from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AstroVerse API"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str = "sqlite:///./astroverse.db"
    supabase_url: str | None = None
    supabase_jwt_secret: str | None = None
    supabase_jwks_url: str | None = None
    frontend_origins: str = "http://localhost:3000"
    auto_create_tables: bool = True
    # Signs AstroVerse access tokens. Required outside development.
    auth_secret_key: str | None = None
    access_token_days: int = 7
    groq_api_key: str | None = None
    groq_model: str = "llama-3.3-70b-versatile"
    # Your Groq plan's tokens-per-minute limit for the model (free tier gpt-oss-120b: 8000).
    groq_tokens_per_minute: int = 8000
    # Optional geocoder for Vedic charts; Nominatim requires an identifying user agent.
    geocoder_user_agent: str = "astroverse-research-app"
    # Upper bound for uploaded palm images.
    max_upload_mb: int = 8
    # Public URL of the web app, used in emailed links (defaults to the first FRONTEND_ORIGINS entry).
    frontend_url: str | None = None
    password_reset_minutes: int = 30
    # Outgoing mail for password resets and security notices. Without SMTP_HOST, emails are written
    # to the server log instead (development only).
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str | None = None
    smtp_use_ssl: bool = False

    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]

    @property
    def public_app_url(self) -> str:
        return (self.frontend_url or (self.cors_origins or ["http://localhost:3000"])[0]).rstrip("/")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
