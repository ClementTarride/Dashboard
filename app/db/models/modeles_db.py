from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base

# Modèles

class CatalogModels(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    title = Column(String(255), nullable=False)
    domain = Column(String(100), nullable=False)  # sales, finance, marketing, operations, customer...
    status = Column(String(50), nullable=False)  # ready, draft, archived
    main_attribute = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)
    updated_at = Column(DATETIME, nullable=False)


class CatalogModelSources(Base):
    __tablename__ = "model_sources"

    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("model_id", "source_id"),
    )


class CatalogModelParameters(Base):
    __tablename__ = "model_parameters"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    name = Column(String(255), nullable=False)
    label = Column(String(255), nullable=False)
    data_type = Column(String(100), nullable=False)
    required = Column(Boolean, nullable=False)
    default_value = Column(String(255), nullable=True)


class CatalogModelQueries(Base):
    __tablename__ = "model_queries"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    title = Column(String(255), nullable=False)
    sql_text = Column(Text, nullable=False)
    metric_name = Column(String(255), nullable=True)
    created_at = Column(DATETIME, nullable=False)
