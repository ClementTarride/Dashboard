from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session

from app.db.database import get_db

# nouveaux modèles
from app.db.models.modeles_db import CatalogModels
from app.db.models.sources_db import CatalogSources
from app.db.models.dashboards_db import CatalogDashboards
from app.db.models.tables_db import CatalogDataObjects
from app.routers.get_current_user import get_current_user

router = APIRouter(tags=["pages"])
templates = Jinja2Templates(directory="app/templates")


@router.get("/acceuil")
def acceuil(
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    db_models = (
        db.query(CatalogModels)
        .filter(CatalogModels.created_by == current_user.id)
        .order_by(CatalogModels.created_at.desc())
        .all()
    )

    db_sources = (
        db.query(CatalogSources)
        .filter(CatalogSources.created_by == current_user.id)
        .order_by(CatalogSources.created_at.desc())
        .all()
    )

    db_dashboards = (
        db.query(CatalogDashboards)
        .filter(CatalogDashboards.owner_id == current_user.id)
        .order_by(CatalogDashboards.created_at.desc())
        .all()
    )

    db_tables = (
        db.query(CatalogDataObjects)
        .filter(CatalogDataObjects.object_type == "table")
        .all()
    )

    models = [
        {
            "url": "/model",
            "badge": model.status,
            "title": model.title,
            "description": model.description or "Aucune description.",
        }
        for model in db_models
    ]

    sources = [
        {
            "url": "/source",
            "badge": source.db_type,
            "title": source.name,
            "description": (
                source.description
                or f"{source.environment} • {source.host}:{source.port or ''} • {source.database_name}"
            ),
        }
        for source in db_sources
    ]

    dashboards = [
        {
            "url": "/dashboard",
            "badge": dashboard.status,
            "title": dashboard.title,
            "description": dashboard.description or "Dashboard disponible.",
        }
        for dashboard in db_dashboards
    ]

    tables = [
        {
            "url": "/tables",
            "badge": table.object_type,
            "title": table.name,
            "description": table.description or "Table disponible.",
        }
        for table in db_tables
    ]

    return templates.TemplateResponse(
        request,
        "Acceuil.html",
        {
            "models": models,
            "sources": sources,
            "dashboards": dashboards,
            "tables": tables,
        },
    )