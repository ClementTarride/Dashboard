from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.core.config import templates
from app.core.utils import render

router = APIRouter(tags=["pages"])

"""
@router.get("/acceuil",response_class=HTMLResponse)
async def acceuil_page(request: Request):
    return render(request, "acceuil.html")
"""
@router.get("/tables",response_class=HTMLResponse)
async def tables_page(request: Request):
    return render(request, "tables.html")

@router.get("/sql",response_class=HTMLResponse)
async def sql_page(request: Request):
    return render(request, "sql.html")

@router.get("/dashboard",response_class=HTMLResponse)
async def dashboard_page(request: Request):
    return render(request, "dashboard.html")

@router.get("/logout")
async def logout(request: Request):
    return render(request, "login.html")

@router.get("/model",response_class=HTMLResponse)
async def sources(request: Request):
    return render(request, "model.html")

@router.get("/users",response_class=HTMLResponse)
async def users(request: Request):
    return render(request, "users.html")

@router.get("/teams",response_class=HTMLResponse)
async def teams(request: Request):
    return render(request, "teams.html")

@router.get("/profile",response_class=HTMLResponse)
async def profile(request: Request):
    return render(request, "profile.html")

@router.get("/roles",response_class=HTMLResponse)
async def users_role(request: Request):
    return render(request, "roles.html")

@router.get("/sharing",response_class=HTMLResponse)
async def sharing(request: Request):
    return render(request, "sharing.html")

@router.get("/notifications",response_class=HTMLResponse)
async def notifications(request: Request):
    return render(request, "notifications.html")
@router.get("/activity",response_class=HTMLResponse)
async def activity(request: Request):
    return render(request, "activity.html")

@router.get("/settings",response_class=HTMLResponse)
async def settings(request: Request):
    return render(request, "settings.html")

@router.get("/folders",response_class=HTMLResponse)
async def folder(request: Request):
    return render(request, "folders.html")