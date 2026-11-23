import time
import json
import datetime
from typing import List, Optional
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supplier import SupplierConnector
from app.models.search import AuditLog
from app.models.user import User
from app.schemas.supplier import SupplierConnectorConfig, SupplierConnectorUpdate
from app.connectors.registry import connector_registry
from app.api.deps import get_current_user, require_admin

router = APIRouter(prefix="/suppliers", tags=["Supplier Management & Admin Config"])

@router.get("/connectors", response_model=List[SupplierConnectorConfig])
def get_connectors(db: Session = Depends(get_db)):
    connectors = db.query(SupplierConnector).order_by(SupplierConnector.slot_number.asc()).all()
    return connectors

@router.put("/connectors/{slot_number}", response_model=SupplierConnectorConfig)
def update_connector_config(
    slot_number: int,
    data: SupplierConnectorUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    conn = db.query(SupplierConnector).filter(SupplierConnector.slot_number == slot_number).first()
    if not conn:
        raise HTTPException(status_code=404, detail=f"Connector for Slot {slot_number} not found")

    if data.supplier_name is not None:
        conn.supplier_name = data.supplier_name
    if data.adapter_type is not None:
        conn.adapter_type = data.adapter_type
    if data.base_url is not None:
        conn.base_url = data.base_url
    if data.search_endpoint is not None:
        conn.search_endpoint = data.search_endpoint
    if data.api_key is not None:
        conn.api_key = data.api_key
    if data.api_secret is not None:
        conn.api_secret = data.api_secret
    if data.is_enabled is not None:
        conn.is_enabled = data.is_enabled
    if data.timeout_seconds is not None:
        conn.timeout_seconds = data.timeout_seconds
    if data.custom_headers_json is not None:
        conn.custom_headers_json = data.custom_headers_json

    conn.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(conn)

    # Sync memory registry
    connector_registry.sync_with_db(db)

    # Log audit
    audit = AuditLog(
        action="UPDATE_CONNECTOR_CONFIG",
        entity_type="SupplierConnector",
        entity_id=str(slot_number),
        details=f"Admin {admin.email} updated Slot {slot_number} configuration",
        user_id=admin.id
    )
    db.add(audit)
    db.commit()

    return conn

@router.post("/connectors/{slot_number}/toggle", response_model=SupplierConnectorConfig)
def toggle_connector(
    slot_number: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    conn = db.query(SupplierConnector).filter(SupplierConnector.slot_number == slot_number).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connector not found")

    conn.is_enabled = not conn.is_enabled
    conn.last_status = "HEALTHY" if conn.is_enabled else "DISABLED"
    db.commit()
    db.refresh(conn)

    connector_registry.sync_with_db(db)

    audit = AuditLog(
        action="TOGGLE_CONNECTOR",
        entity_type="SupplierConnector",
        entity_id=str(slot_number),
        details=f"Admin {admin.email} set Slot {slot_number} enabled={conn.is_enabled}",
        user_id=admin.id
    )
    db.add(audit)
    db.commit()

    return conn

@router.post("/connectors/{slot_number}/test")
async def test_connector_connection(
    slot_number: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    conn = db.query(SupplierConnector).filter(SupplierConnector.slot_number == slot_number).first()
    if not conn:
        raise HTTPException(status_code=404, detail="Connector not found")

    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=conn.timeout_seconds, follow_redirects=True) as client:
            resp = await client.get(conn.base_url)
            latency = round((time.time() - start) * 1000, 1)
            conn.last_checked_at = datetime.datetime.utcnow()
            conn.last_status = "HEALTHY" if resp.status_code < 400 else "DEGRADED"
            db.commit()
            return {
                "slot_number": slot_number,
                "supplier_name": conn.supplier_name,
                "status": "HEALTHY" if resp.status_code < 400 else "DEGRADED",
                "http_status_code": resp.status_code,
                "latency_ms": latency,
                "message": f"Successfully probed {conn.base_url}"
            }
    except Exception as e:
        latency = round((time.time() - start) * 1000, 1)
        conn.last_checked_at = datetime.datetime.utcnow()
        conn.last_status = "ERROR"
        conn.last_error_message = str(e)
        db.commit()
        return {
            "slot_number": slot_number,
            "supplier_name": conn.supplier_name,
            "status": "ERROR",
            "latency_ms": latency,
            "message": f"Connection probe failed: {str(e)}"
        }

