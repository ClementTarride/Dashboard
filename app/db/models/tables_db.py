from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base
# Tables / fonctions explorées

class CatalogDataObjects(Base):
    __tablename__ = "data_objects"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    name = Column(String(255), nullable=False)
    object_type = Column(String(50), nullable=False)  # table, view, function
    schema_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    primary_key = Column(String(255), nullable=True)
    signature = Column(Text, nullable=True)
    return_type = Column(String(255), nullable=True)
    columns_count = Column(Integer, nullable=True)
    last_analysis_at = Column(DATETIME, nullable=True)


class CatalogDataObjectColumns(Base):
    __tablename__ = "data_object_columns"

    id = Column(Integer, primary_key=True, index=True)
    data_object_id = Column(Integer, ForeignKey("data_objects.id"), nullable=False)
    name = Column(String(255), nullable=False)
    data_type = Column(String(255), nullable=False)
    nullable = Column(Boolean, nullable=False)
    is_primary_key = Column(Boolean, nullable=False)
    ordinal_position = Column(Integer, nullable=False)
