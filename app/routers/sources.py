from fastapi import APIRouter, Request, Depends, Form,HTTPException
from fastapi.templating import Jinja2Templates
from datetime import datetime
from sqlalchemy.orm import Session, selectinload
from app.db.database import get_db
from app.db.models.sources_db import CatalogSources, CatalogConnectionTests
from fastapi.responses import RedirectResponse
from app.routers.get_current_user import get_current_user

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def engine_label(db_type: str) -> str:
    return {
        "postgresql": "PostgreSQL",
        "mysql": "MySQL",
        "sqlserver": "SQL Server",
        "sqlite": "SQLite",
        "oracle": "Oracle",
    }.get(db_type, db_type)


def status_label(status: str) -> str:
    return {
        "active": "Active",
        "warning": "À vérifier",
        "error": "Erreur",
        "archived": "Archivée",
        "draft": "Brouillon",
    }.get(status, status)


def format_last_test(dt):
    if not dt:
        return "Jamais testé"
    return dt.strftime("%d/%m/%Y %H:%M")


@router.get("/source")
def source_page(request: Request, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    db_sources = (db.query(CatalogSources).filter(CatalogSources.created_by == current_user.id).order_by(CatalogSources.created_at.desc()).all())
    sources = []
    for source in db_sources:
        source_doc_points = [
            "Valider l’accès réseau depuis l’environnement d’exécution.",
            "Utiliser un compte de service dédié.",
            "Tester la connexion avant modification.",
        ]

        sources.append({
            "id": source.id,
            "name": source.name,
            "type": source.db_type,
            "engine_label": engine_label(source.db_type),
            "environment": source.environment,
            "status": source.status,
            "status_label": status_label(source.status),
            "description": source.description or "",
            "host": source.host,
            "port": source.port or "",
            "database": source.database_name,
            "schema": source.schema_name or "",
            "username": source.username,
            "ssl": "required" if source.ssl_enabled else "disabled",
            "timeout": "15",
            "last_test": format_last_test(source.last_test_at),
            "doc_title": f"Documentation {source.name}",
            "doc_summary": (
                f"Documentation contextuelle pour la source {source.name}. "
                "Vérifiez les paramètres réseau, les droits et le schéma par défaut."
            ),
            "doc_points": source_doc_points,
        })

    active_count = sum(1 for s in sources if s["status"] == "active")
    last_sync = sources[0]["last_test"] if sources else "Aucune"

    return templates.TemplateResponse(
        request,
        "source.html",
        {
            "sources": sources,
            "stat_sources": len(sources),
            "stat_active_sources": active_count,
            "stat_last_sync": last_sync,
        },
    )

@router.post("/source")
def create_source(
        name: str = Form(...),
        db_type: str = Form(...),
        environment: str = Form("development"),
        host: str = Form(...),
        port: int | None = Form(None),
        database_name: str = Form(...),
        schema_name: str | None = Form(None),
        username: str = Form(...),
        password: str = Form(...),
        ssl_enabled: bool = Form(False),
        description: str | None = Form(None),
        db: Session = Depends(get_db),
        current_user = Depends(get_current_user),
    ):
        now = datetime.now()

        source = CatalogSources(
            name=name,
            db_type=db_type,
            environment=environment,
            host=host,
            port=port,
            database_name=database_name,
            schema_name=schema_name,
            username=username,
            password_secret_ref=password,  # à remplacer plus tard par un vrai secret manager
            ssl_enabled=ssl_enabled,
            status="active",
            description=description,
            last_test_at=None,
            created_by=current_user.id,
            created_at=now,
            updated_at=now,
        )

        db.add(source)
        db.commit()

        return RedirectResponse(url="/source", status_code=303)

@router.post("/source/{source_id}/delete")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    source = db.query(CatalogSources).filter(CatalogSources.id == source_id).first()

    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")

    db.delete(source)
    db.commit()

    return RedirectResponse(url="/source", status_code=303)

@router.post("/source/{source_id}/test")
def test_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    source = (
        db.query(CatalogSources)
        .filter(
            CatalogSources.id == source_id,
            CatalogSources.created_by == current_user.id,
        )
        .first()
    )
    #connexion_test = (db.query(CatalogConnectionTests).filter())
    if not source:
        raise HTTPException(status_code=404, detail="Source introuvable")

    source.last_test_at = datetime.now()
    source.status = "active"
    source.updated_at = datetime.now()

    db.commit()

    return RedirectResponse(url="/source", status_code=303)