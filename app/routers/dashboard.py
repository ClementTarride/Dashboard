from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.core.config import templates
from app.core.utils import render
router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/new", response_class=HTMLResponse)
async def new_dashboard_page(request: Request):
    return render(request, "dashboard_model.html")


@router.get("/widgets", response_class=HTMLResponse)
async def dashboard_widgets_page(request: Request):
    return render(request, "dashboard_widgets.html")


# Exemple si tu veux réactiver l'édition
# @router.get("/{dashboard_id}/edit", response_class=HTMLResponse)
# async def edit_dashboard_page(request: Request, dashboard_id: int):
#     return templates.TemplateResponse(
#         request=request,
#         name="dashboard_model.html",
#         context={"dashboard_id": dashboard_id}
#     )