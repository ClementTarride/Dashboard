from fastapi import Request
from app.core.config import templates

def render(request: Request, template_name: str, context: dict | None = None):
    return templates.TemplateResponse(
        request=request,
        name=template_name,
        context=context or {}
    )