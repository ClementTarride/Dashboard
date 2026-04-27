from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from app.core.config import templates
from app.core.utils import render
router = APIRouter(prefix="/tables", tags=["tables"])


@router.get("/new", response_class=HTMLResponse)
async def new_tables_page(request: Request):
    return render(request, "tables_model.html")