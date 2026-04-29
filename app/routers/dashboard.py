from fastapi import APIRouter, Request, Depends, Form,HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from app.core.config import templates
from app.core.utils import render
from app.db.database import get_db,db_query_executer
from app.routers.get_current_user import get_current_user
from sqlalchemy.orm import Session, selectinload
from datetime import datetime
from fastapi.responses import RedirectResponse
from app.db.models.dashboards_db import CatalogDashboards,CatalogWidgets,CatalogDashboardSources,CatalogWidgetResultsCache
from app.db.models.utilisateurs_db import CatalogTeamMembers,CatalogTeams
from app.db.models.sources_db import CatalogSources
import json


router = APIRouter( tags=["dashboard"])

def format_last_test(dt):
    if not dt:
        return "Jamais testé"
    return dt.strftime("%d/%m/%Y %H:%M")

@router.get("/dashboard")
def dashboard_page(request: Request, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    dashboards = (
        db.query(CatalogDashboards)
        .filter(CatalogDashboards.owner_id == current_user.id)
        .order_by(CatalogDashboards.updated_at.desc())
        .all()
    )

    active_count = (
        db.query(CatalogDashboards)
        .filter(CatalogDashboards.status == "active" and CatalogDashboards.owner_id == current_user.id)
        .count()
    )

    widget_count = db.query(CatalogWidgets).count()

    source_count = db.query(CatalogDashboardSources.source_id).distinct().count()

    return templates.TemplateResponse(
        request,
        "dashboard.html",
        {
            "request": request,
            "dashboards": dashboards,
            "active_count": db.query(CatalogDashboards).filter(CatalogDashboards.status == "active").count(),
            "widget_count": db.query(CatalogWidgets).count(),
            "source_count": db.query(CatalogDashboardSources.source_id).distinct().count(),
        }
    )




@router.get("/dashboard/new")
def dashboard_model(request: Request, db: Session = Depends(get_db)):
    sources = (
        db.query(CatalogSources)
        .filter(CatalogSources.status != "archived")
        .order_by(CatalogSources.name.asc())
        .all()
    )

    domains = [
        ("sales", "Sales"),
        ("finance", "Finance"),
        ("marketing", "Marketing"),
        ("operations", "Operations"),
        ("product", "Produit"),
        ("executive", "Executive"),
    ]

    visibilities = [
        ("private", "Privé"),
        ("team", "Équipe"),
        ("company", "Entreprise"),
    ]

    statuses = [
        ("draft", "Brouillon"),
        ("active", "Actif"),
        ("archived", "Archivé"),
    ]

    return templates.TemplateResponse(
        request,
        "dashboard_model.html",
        {
            "request": request,
            "sources": sources,
            "domains": domains,
            "visibilities": visibilities,
            "statuses": statuses,
        },
    )


@router.post("/dashboard/new")
def create_dashboard(
    dashboard_name: str = Form(...),
    dashboard_description: str = Form(None),
    dashboard_source: int = Form(...),
    dashboard_domain: str = Form(None),
    dashboard_visibility: str = Form("private"),
    dashboard_status: str = Form("draft"),
    refresh_frequency: str = Form(None),
    default_schema: str = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    now = datetime.now()

    dashboard = CatalogDashboards(
        name=dashboard_name,
        description=dashboard_description,
        domain=dashboard_domain,
        visibility=dashboard_visibility,
        status=dashboard_status,
        refresh_frequency=refresh_frequency,
        default_schema=default_schema,
        owner_id=current_user.id,
        created_at=now,
        updated_at=now,
    )

    db.add(dashboard)
    db.flush()

    dashboard_source_link = CatalogDashboardSources(
        dashboard_id=dashboard.id,
        source_id=dashboard_source,
    )

    db.add(dashboard_source_link)
    db.commit()

    return RedirectResponse(
        url="/dashboard/{dashboard.id}",
        status_code=303,
    )



@router.get("/dashboard/{dashboard_id}", response_class=HTMLResponse)
def open_dashboard(
    dashboard_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    dashboard = (
        db.query(CatalogDashboards)
        .filter(
            CatalogDashboards.id == dashboard_id,
            CatalogDashboards.owner_id == current_user.id
        )
        .first()
    )

    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard introuvable")

    dashboard_source = (
        db.query(CatalogDashboardSources)
        .filter(CatalogDashboardSources.dashboard_id == dashboard.id)
        .first()
    )

    source_id = dashboard_source.source_id if dashboard_source else None

    widgets = (
        db.query(CatalogWidgets)
        .filter(CatalogWidgets.dashboard_id == dashboard.id)
        .order_by(CatalogWidgets.position_order.asc())
        .all()
    )

    for widget in widgets:
        cache = (
            db.query(CatalogWidgetResultsCache)
            .filter(CatalogWidgetResultsCache.widget_id == widget.id)
            .order_by(CatalogWidgetResultsCache.generated_at.desc())
            .first()
        )

        widget.cache = json.loads(cache.payload_json) if cache else None

    return templates.TemplateResponse(
        request,
        "dashboard_widgets.html",
        {
            "request": request,
            "dashboard": dashboard,
            "widgets": widgets,
            "source_id": source_id,
        }
    )

@router.post("/dashboard/{dashboard_id}/widgets")
def create_widget(
    dashboard_id: int,
    title: str = Form(...),
    widget_type: str = Form(...),
    sql_text: str = Form(None),
    refresh_frequency: str = Form(None),
    description: str = Form(None),
    source_id: int = Form(...),
    db: Session = Depends(get_db),
    chart_type: str = Form(None),
    chart_label_column: str = Form(None),
    chart_value_column: str = Form(None),
    current_user = Depends(get_current_user)
    
):
    now = datetime.now()
    
    # position automatique
    last_position = (
        db.query(CatalogWidgets.position_order)
        .filter(CatalogWidgets.dashboard_id == dashboard_id)
        .order_by(CatalogWidgets.position_order.desc())
        .first()
    )

    next_position = (last_position[0] + 1) if last_position else 1

    element = widget_type
    if widget_type == 'chart':
        element = chart_type
    
    widget = CatalogWidgets(
        dashboard_id=dashboard_id,
        source_id=source_id,
        title=title,
        widget_type= element,
        sql_text=sql_text,
        refresh_frequency=refresh_frequency,
        position_order=next_position,
        description=description,
        created_at=now,
        updated_at=now,
    )
    db.add(widget)
    db.flush()
    dashboard_source = (
    db.query(
        CatalogDashboardSources)
        .filter(CatalogDashboardSources.dashboard_id == dashboard_id)
        .first()
    )

    source = (
        db.query(CatalogSources)
        .filter(CatalogSources.id == dashboard_source.source_id)
        .first()
    )
    success, result = db_query_executer(
        db_type=source.db_type,
        username=source.username,
        password=source.password_secret_ref,  # à adapter si tu sécurises
        host=source.host,
        port=source.port,
        database_name=source.database_name,
        sql_query=sql_text
    )
    if success:
        cache = CatalogWidgetResultsCache(
            widget_id=widget.id,
            payload_json=json.dumps(result),
            generated_at=datetime.now()
        )
    db.add(cache)


    db.commit()

    return RedirectResponse(
        url=f"/dashboard/{dashboard_id}",
        status_code=303,
    )

# Exemple si tu veux réactiver l'édition
# @router.get("/{dashboard_id}/edit", response_class=HTMLResponse)
# async def edit_dashboard_page(request: Request, dashboard_id: int):
#     return templates.TemplateResponse(
#         request=request,
#         name="dashboard_model.html",
#         context={"dashboard_id": dashboard_id}
#     )