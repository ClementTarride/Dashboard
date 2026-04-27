from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base
# Dashboards / widgets

class CatalogDashboards(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(String(100), nullable=True)
    visibility = Column(String(50), nullable=False)  # private, team, company
    status = Column(String(50), nullable=False)  # draft, active, archived
    refresh_frequency = Column(String(100), nullable=True)
    default_schema = Column(String(255), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DATETIME, nullable=False)
    updated_at = Column(DATETIME, nullable=False)


class CatalogDashboardSources(Base):
    __tablename__ = "dashboard_sources"

    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("dashboard_id", "source_id"),
    )


class CatalogWidgets(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)
    model_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    title = Column(String(255), nullable=False)
    widget_type = Column(String(50), nullable=False)  # kpi, chart, table, list, text
    sql_text = Column(Text, nullable=True)
    refresh_frequency = Column(String(100), nullable=True)
    position_order = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DATETIME, nullable=False)
    updated_at = Column(DATETIME, nullable=False)


class CatalogWidgetResultsCache(Base):
    __tablename__ = "widget_results_cache"

    id = Column(Integer, primary_key=True, index=True)
    widget_id = Column(Integer, ForeignKey("widgets.id"), nullable=False)
    payload_json = Column(Text, nullable=False)
    generated_at = Column(DATETIME, nullable=False)