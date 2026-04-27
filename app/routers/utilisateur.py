from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.core.config import templates
from app.core.utils import render
router = APIRouter(prefix="/users", tags=["users"])

@router.get("/new", response_class=HTMLResponse)
async def user_new(request: Request):
    return render(request, ".html")

