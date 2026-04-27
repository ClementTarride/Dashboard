from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base
# Paramètres

class CatalogUserPreferences(Base):
    __tablename__ = "user_preferences"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    theme = Column(String(50), nullable=False)
    language = Column(String(20), nullable=False)
    timezone = Column(String(100), nullable=False)
    notification_email_enabled = Column(Boolean, nullable=False)
    notification_app_enabled = Column(Boolean, nullable=False)


class CatalogPlatformSettings(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    setting_key = Column(String(255), unique=True, nullable=False)
    setting_value = Column(Text, nullable=True)
    updated_at = Column(DATETIME, nullable=False)