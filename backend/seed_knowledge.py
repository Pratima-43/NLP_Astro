from app.db.session import SessionLocal
from app.db.seed import sync_all

if __name__ == "__main__":
    with SessionLocal() as db:
        for system, stats in sync_all(db).items():
            print(f"{system}: {stats['inserted']} inserted, {stats['updated']} updated, {stats['deleted']} deleted")
