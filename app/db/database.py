from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
from urllib.parse import quote_plus

DATABASE_URL = "sqlite:///./data_platform.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_bd_connection(db_type, username, password, host, port, database_name):
    try:
        if db_type == "postgresql":
            db_url = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database_name}"

        elif db_type == "mysql":
            db_url = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"

        elif db_type == "sqlserver":
            password = quote_plus(password)
            driver = quote_plus("ODBC Driver 17 for SQL Server")
            db_url = (
                f"mssql+pyodbc://{username}:{password}@{host}:{port}/"
                f"{database_name}?driver={driver}"
            )

        else:
            return False, "Type de base non supporté"

        engine = create_engine(db_url)

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return True, "Connexion réussie"

    except SQLAlchemyError as e:
        return False, str(e)

def db_query_executer(db_type, username, password, host, port, database_name, sql_query):
    try:
        if db_type == "postgresql":
            db_url = f"postgresql+psycopg2://{username}:{password}@{host}:{port}/{database_name}"

        elif db_type == "mysql":
            db_url = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_name}"

        elif db_type == "sqlserver":
            password = quote_plus(password)
            driver = quote_plus("ODBC Driver 17 for SQL Server")
            db_url = (
                f"mssql+pyodbc://{username}:{password}@{host}:{port}/"
                f"{database_name}?driver={driver}"
            )

        elif db_type == "sqlite":
            db_url = f"sqlite:///{database_name}"

        else:
            return False, "Type de base non supporté"

        engine = create_engine(db_url)

        with engine.connect() as conn:
            result = conn.execute(text(sql_query))

            columns = result.keys()
            rows = [dict(zip(columns, row)) for row in result.fetchall()]

        return True, {
            "columns": list(columns),
            "rows": rows
        }

    except SQLAlchemyError as e:
        return False, str(e)
