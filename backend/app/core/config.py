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

    model_config = SettingsConfigDict(env_file=(".env", "backend/.env"), env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
