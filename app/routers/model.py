from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session, selectinload
from app.db.database import get_db
from app.db.models.modeles_db import (
    CatalogModels,
    CatalogModelSources,
    CatalogModelParameters,
    CatalogModelQueries,
)

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")


def status_label(status: str) -> str:
    return {
        "ready": "Prêt",
        "draft": "Brouillon",
        "archived": "Archivé",
    }.get(status, status)


@router.get("/model")
def model_page(request: Request, db: Session = Depends(get_db)):
    db_models = (
        db.query(CatalogModels)
        .options(
            selectinload(CatalogModels.parameters),
            selectinload(CatalogModels.queries),
            selectinload(CatalogModels.sources).selectinload(CatalogModelSources.source),
        )
        .order_by(CatalogModels.updated_at.desc())
        .all()
    )

    models = []

    for model in db_models:
        source_names = [
            ms.source.name
            for ms in model.sources
            if ms.source is not None
        ]

        parameters = [
            [
                param.name,
                param.label,
                param.data_type,
                "Obligatoire" if param.required else "Optionnel",
            ]
            for param in model.parameters
        ]

        widgets = [
            {
                "title": query.title,
                "source": query.source.name if query.source else "Source inconnue",
                "query": query.sql_text,
                "metric": query.metric_name or "—",
                "type": "KPI",
            }
            for query in model.queries
        ]

        preview = [
            [model.main_attribute or "value", "Exemple"],
            ["status", model.status],
            ["domain", model.domain],
        ]

        models.append({
            "id": model.id,
            "name": model.name,
            "title": model.title,
            "domain": model.domain,
            "status": model.status,
            "status_label": status_label(model.status),
            "main_attribute": model.main_attribute or "value",
            "description": model.description or "",
            "source_names": source_names,
            "source_count": len(source_names),
            "widget_count": len(widgets),
            "query_count": len(model.queries),
            "last_update": model.updated_at.strftime("%d/%m/%Y %H:%M"),
            "template_route": f"/dashboard/model/{model.name}?{model.main_attribute or 'value'}={{{{ value }}}}",
            "parameters": parameters,
            "widgets": widgets,
            "preview": preview,
        })

    return templates.TemplateResponse(
        "model.html",
        {
            "request": request,
            "models": models,
            "stat_models": len(models),
            "stat_widgets": sum(m["widget_count"] for m in models),
            "stat_sources": len({
                source
                for model in models
                for source in model["source_names"]
            }),
        },
    )