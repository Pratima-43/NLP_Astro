"""Point the app at a throwaway SQLite database and disable the LLM before anything imports settings."""
import os
import tempfile
from pathlib import Path

_DB = Path(tempfile.mkdtemp()) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_DB.as_posix()}"
os.environ["GROQ_API_KEY"] = ""
os.environ["APP_ENV"] = "development"
os.environ["AUTO_CREATE_TABLES"] = "true"
os.environ["SMTP_HOST"] = ""
