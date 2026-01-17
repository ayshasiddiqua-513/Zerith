import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv


load_dotenv()

MYSQL_USER = os.getenv("MYSQL_USER", "zerith")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "zerithpass")
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DB = os.getenv("MYSQL_DB", "zerith_db")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    # Default to local SQLite for smoother first run
    SQLITE_PATH = os.getenv("SQLITE_PATH", str((os.path.dirname(__file__) + "/../zerith.db")))
    SQLALCHEMY_DATABASE_URL = f"sqlite+pysqlite:///{os.path.abspath(SQLITE_PATH)}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


