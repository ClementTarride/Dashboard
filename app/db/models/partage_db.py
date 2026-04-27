from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base

# Partage / accès

class CatalogResourcePermissions(Base):
    __tablename__ = "resource_permissions"

    id = Column(Integer, primary_key=True, index=True)
    resource_type = Column(String(50), nullable=False)  # dashboard, source, model
    resource_id = Column(Integer, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    permission = Column(String(50), nullable=False)  # read, edit, admin
    expires_at = Column(DATETIME, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)