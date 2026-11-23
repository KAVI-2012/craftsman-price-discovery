import sqlite3
import os

db_paths = [
    r"c:\Users\Lap-1938\Desktop\TNPL\backend\craftsman_price_discovery.db",
    r"c:\Users\Lap-1938\Desktop\TNPL\craftsman_price_discovery.db"
]

for p in db_paths:
    if not os.path.exists(p):
        continue
    conn = sqlite3.connect(p)
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(search_queries)")
    sq = [r[1] for r in cur.fetchall()]
    if "common_uom" not in sq:
        cur.execute("ALTER TABLE search_queries ADD COLUMN common_uom VARCHAR(50) DEFAULT 'Piece'")
        print(f"Added common_uom to search_queries in {p}")
        
    cur.execute("PRAGMA table_info(product_prices)")
    pp = [r[1] for r in cur.fetchall()]
    if "original_uom" not in pp:
        cur.execute("ALTER TABLE product_prices ADD COLUMN original_uom VARCHAR(50) DEFAULT 'Unit'")
        print(f"Added original_uom to product_prices in {p}")
    if "common_uom" not in pp:
        cur.execute("ALTER TABLE product_prices ADD COLUMN common_uom VARCHAR(50) DEFAULT 'Piece'")
        print(f"Added common_uom to product_prices in {p}")
    if "normalized_price_common" not in pp:
        cur.execute("ALTER TABLE product_prices ADD COLUMN normalized_price_common FLOAT")
        print(f"Added normalized_price_common to product_prices in {p}")
    if "is_uom_normalized" not in pp:
        cur.execute("ALTER TABLE product_prices ADD COLUMN is_uom_normalized BOOLEAN DEFAULT 1")
        print(f"Added is_uom_normalized to product_prices in {p}")
    if "uom_conversion_status" not in pp:
        cur.execute("ALTER TABLE product_prices ADD COLUMN uom_conversion_status VARCHAR(100) DEFAULT 'Exact UOM Match'")
        print(f"Added uom_conversion_status to product_prices in {p}")
        
    cur.execute("UPDATE product_prices SET normalized_price_common = normalized_price_inr WHERE normalized_price_common IS NULL")
    conn.commit()
    conn.close()
    print(f"Migration completed successfully for {p}")
