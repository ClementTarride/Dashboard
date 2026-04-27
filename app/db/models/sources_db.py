from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base

# Sources de données

class CatalogSources(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    db_type = Column(String(50), nullable=False)  # postgresql, mysql, sqlserver, sqlite, oracle
    environment = Column(String(50), nullable=False)  # production, staging, development, test
    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=True)
    database_name = Column(String(255), nullable=False)
    schema_name = Column(String(255), nullable=True)
    username = Column(String(255), nullable=False)
    password_secret_ref = Column(String(500), nullable=False)
    ssl_enabled = Column(Boolean, nullable=False)
    status = Column(String(50), nullable=False)  # active, warning, error, archived
    description = Column(Text, nullable=True)
    last_test_at = Column(DATETIME, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)
    updated_at = Column(DATETIME, nullable=False)


class CatalogConnectionTests(Base):
    __tablename__ = "connection_tests"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    tested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    tested_at = Column(DATETIME, nullable=False)