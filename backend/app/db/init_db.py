import datetime
import json
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.supplier import Supplier, SupplierConnector
from app.models.product import Manufacturer, Product
from app.models.search import SearchQuery, SearchResult, ProductPrice, PriceHistory, AuditLog

def init_db():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Users
        if not db.query(User).filter(User.email == "admin@craftsman.com").first():
            print("Seeding Admin User (admin@craftsman.com)...")
            admin_user = User(
                email="admin@craftsman.com",
                full_name="Craftsman System Administrator",
                hashed_password=get_password_hash("CraftsmanAdmin#2026"),
                role="admin",
                department="Procurement Operations",
                is_active=True
            )
            db.add(admin_user)

        if not db.query(User).filter(User.email == "procurement@craftsman.com").first():
            print("Seeding Procurement User (procurement@craftsman.com)...")
            proc_user = User(
                email="procurement@craftsman.com",
                full_name="Rajesh Kumar (Senior Buyer)",
                hashed_password=get_password_hash("Procurement#2026"),
                role="procurement",
                department="Direct Material Sourcing",
                is_active=True
            )
            db.add(proc_user)

        db.commit()

        # 2. Seed 7 Supplier Connectors
        default_connectors = [
            {
                "slot": 1,
                "name": "IndiaMART Industrial",
                "adapter": "scraper",
                "base_url": "https://dir.indiamart.com",
                "endpoint": "/search.mp",
                "timeout": 8
            },
            {
                "slot": 2,
                "name": "Moglix Industrial MRO",
                "adapter": "api",
                "base_url": "https://www.moglix.com",
                "endpoint": "/search",
                "timeout": 8
            },
            {
                "slot": 3,
                "name": "Industrybuying",
                "adapter": "scraper",
                "base_url": "https://www.industrybuying.com",
                "endpoint": "/search",
                "timeout": 8
            },
            {
                "slot": 4,
                "name": "RS Components",
                "adapter": "api",
                "base_url": "https://in.rs-online.com",
                "endpoint": "/web/c",
                "timeout": 8
            },
            {
                "slot": 5,
                "name": "Misumi Precision",
                "adapter": "api",
                "base_url": "https://in.misumi-ec.com",
                "endpoint": "/vona2/result",
                "timeout": 8
            },
            {
                "slot": 6,
                "name": "Grainger Industrial Supply",
                "adapter": "api",
                "base_url": "https://www.grainger.com",
                "endpoint": "/search",
                "timeout": 8
            },
            {
                "slot": 7,
                "name": "Craftsman Direct OEM Portal",
                "adapter": "custom",
                "base_url": "https://www.craftsmanautomation.com",
                "endpoint": "/products/",
                "timeout": 6
            }
        ]

        for sc in default_connectors:
            existing = db.query(SupplierConnector).filter(SupplierConnector.slot_number == sc["slot"]).first()
            if not existing:
                print(f"Seeding Supplier Connector Slot {sc['slot']}: {sc['name']}...")
                conn = SupplierConnector(
                    slot_number=sc["slot"],
                    supplier_name=sc["name"],
                    adapter_type=sc["adapter"],
                    base_url=sc["base_url"],
                    search_endpoint=sc["endpoint"],
                    timeout_seconds=sc["timeout"],
                    is_enabled=True,
                    last_status="HEALTHY",
                    success_count=42,
                    error_count=1
                )
                db.add(conn)

        db.commit()

        # 3. Seed Manufacturers & Products
        mfg_names = ["Craftsman Automation", "Siemens", "Bosch Rexroth", "SKF", "RS PRO", "Misumi", "Dayton"]
        for m_name in mfg_names:
            if not db.query(Manufacturer).filter(Manufacturer.name == m_name).first():
                db.add(Manufacturer(name=m_name, code=m_name[:3].upper()))

        db.commit()

        # 4. Seed baseline Search for RL-123_Z462H1712106
        sample_q = db.query(SearchQuery).filter(SearchQuery.part_number == "RL-123_Z462H1712106").first()
        if not sample_q:
            print("Seeding sample search baseline for part RL-123_Z462H1712106...")
            sq = SearchQuery(
                query_text="Hydraulic Pressure Relief Valve Cartridge 350 Bar",
                part_number="RL-123_Z462H1712106",
                category="Hydraulics & Fluid Power",
                target_currency="INR",
                status="COMPLETED",
                suppliers_queried_count=7,
                suppliers_succeeded_count=7,
                execution_time_seconds=2.14,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            )
            db.add(sq)
            db.commit()
            db.refresh(sq)

            # Seed 7 results from the 7 suppliers
            sample_suppliers = [
                {
                    "slot": 7,
                    "name": "Craftsman Direct OEM Portal",
                    "title": "Craftsman Genuine Pressure Relief Valve Assembly RL-123",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Craftsman Automation OEM",
                    "price": 12950.0,
                    "cur": "INR",
                    "inr": 12950.0,
                    "score": 98.5,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://www.craftsmanautomation.com/products/"
                },
                {
                    "slot": 3,
                    "name": "Industrybuying",
                    "title": "Sun Hydraulics Equivalent Cartridge Relief Valve RL-123 Series",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Craftsman / Sun Equivalent",
                    "price": 13550.0,
                    "cur": "INR",
                    "inr": 13550.0,
                    "score": 95.0,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://www.industrybuying.com/search/?q=RL-123_Z462H1712106"
                },
                {
                    "slot": 2,
                    "name": "Moglix Industrial MRO",
                    "title": "Rexroth Compatible Pressure Relief Valve Cartridge RL-123 Type",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Bosch Rexroth / Certified OEM",
                    "price": 13800.0,
                    "cur": "INR",
                    "inr": 13800.0,
                    "score": 93.0,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://www.moglix.com/search?controller=search&s=RL-123_Z462H1712106"
                },
                {
                    "slot": 5,
                    "name": "Misumi Precision",
                    "title": "Misumi Precision Cartridge Relief Valve Model RL-123 Configured",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Misumi Factory Automation",
                    "price": 14100.0,
                    "cur": "INR",
                    "inr": 14100.0,
                    "score": 92.0,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://in.misumi-ec.com/vona2/result/?Keyword=RL-123_Z462H1712106"
                },
                {
                    "slot": 1,
                    "name": "IndiaMART Industrial",
                    "title": "Precision Heavy Duty Hydraulic Relief Valve RL-123 Series",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Craftsman Fluid Power",
                    "price": 14250.0,
                    "cur": "INR",
                    "inr": 14250.0,
                    "score": 94.0,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://dir.indiamart.com/search.mp?ss=RL-123_Z462H1712106"
                },
                {
                    "slot": 6,
                    "name": "Grainger Industrial Supply",
                    "title": "Eaton / Vickers Cartridge Style Relief Valve RL-123 Series",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "Eaton Vickers",
                    "price": 175.0,
                    "cur": "USD",
                    "inr": 14525.0, # 175 * 83.0
                    "score": 91.5,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://www.grainger.com/search?searchQuery=RL-123_Z462H1712106"
                },
                {
                    "slot": 4,
                    "name": "RS Components",
                    "title": "RS PRO High Pressure Hydraulic Relief Valve Cartridge RL-123",
                    "part": "RL-123_Z462H1712106",
                    "mfg": "RS PRO / Industrial OEM",
                    "price": 14980.0,
                    "cur": "INR",
                    "inr": 14980.0,
                    "score": 92.5,
                    "class": "Exact Match",
                    "avail": "In Stock",
                    "url": "https://in.rs-online.com/web/c/?searchTerm=RL-123_Z462H1712106"
                }
            ]

            specs = {
                "Nominal Pressure": "350 Bar",
                "Flow Capacity": "120 LPM",
                "Cavity": "T-10A",
                "Seals": "Fluorocarbon Viton"
            }

            for s in sample_suppliers:
                sr = SearchResult(
                    search_id=sq.id,
                    connector_slot=s["slot"],
                    supplier_name=s["name"],
                    product_name=s["title"],
                    part_number=s["part"],
                    manufacturer=s["mfg"],
                    description="Industrial grade pressure relief valve cartridge with hardened steel seat.",
                    specifications_json=json.dumps(specs),
                    source_url=s["url"],
                    match_confidence=s["score"],
                    match_classification=s["class"]
                )
                db.add(sr)
                db.flush()

                pp = ProductPrice(
                    result_id=sr.id,
                    original_price=s["price"],
                    currency=s["cur"],
                    normalized_price_inr=s["inr"],
                    price_type="Verified Published",
                    tax_included=False,
                    tax_rate=18.0,
                    shipping_charges=0.0,
                    moq="1 Unit",
                    availability=s["avail"],
                    last_checked_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                )
                db.add(pp)

                # Add historical price points for trend analysis (over past 3 months)
                timestamps = [
                    datetime.datetime.utcnow() - datetime.timedelta(days=60),
                    datetime.datetime.utcnow() - datetime.timedelta(days=30),
                    datetime.datetime.utcnow() - datetime.timedelta(hours=2)
                ]
                variations = [0.96, 0.98, 1.00]
                for t_idx, ts in enumerate(timestamps):
                    db.add(PriceHistory(
                        part_number="RL-123_Z462H1712106",
                        supplier_name=s["name"],
                        price=round(s["price"] * variations[t_idx], 2),
                        currency=s["cur"],
                        normalized_price_inr=round(s["inr"] * variations[t_idx], 2),
                        recorded_at=ts,
                        search_id=sq.id
                    ))

            db.commit()

        print("Database initialization and seed complete!")

    except Exception as e:
        print(f"Error during db initialization: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()

