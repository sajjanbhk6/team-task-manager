import os

from dotenv import load_dotenv


load_dotenv()


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./team_task_manager.db")
    jwt_secret: str = os.getenv("JWT_SECRET", "replace_with_a_long_random_secret")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]


settings = Settings()
