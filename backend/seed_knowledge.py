from app.db.session import SessionLocal
from app.modules.numerology.knowledge_base.seed import seed_knowledge_base

if __name__ == "__main__":
    with SessionLocal() as db:
        print(f"Inserted {seed_knowledge_base(db)} new source-backed knowledge records.")
