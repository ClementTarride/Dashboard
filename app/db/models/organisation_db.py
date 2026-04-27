from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base
# Organisation

class CatalogFolders(Base):
    __tablename__ = "folders"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)


class CatalogFolderDashboards(Base):
    __tablename__ = "folder_dashboards"

    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=False)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("folder_id", "dashboard_id"),
    )


class CatalogFavorites(Base):
    __tablename__ = "favorites"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(Integer, nullable=False)
    created_at = Column(DATETIME, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("user_id", "resource_type", "resource_id"),
    )


class CatalogTags(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)


class CatalogDashboardTags(Base):
    __tablename__ = "dashboard_tags"

    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("dashboard_id", "tag_id"),
    )
