from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    # Ajoutez ces deux lignes :
    FIRST_ADMIN_EMAIL: str = "achrefzammeli6@gmail.com"
    FIRST_ADMIN_PASSWORD: str = "admin123" 

    class Config:
        env_file = ".env"


settings = Settings()