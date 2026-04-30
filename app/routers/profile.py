from fastapi import APIRouter, Request, Depends, Form, UploadFile, File
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.routers.get_current_user import get_current_user
from app.core.config import templates
from app.db.database import get_db
from app.db.models.utilisateurs_db import CatalogUsers
from app.db.models.parametres_db import CatalogUserPreferences
from datetime import datetime

router = APIRouter(tags=["profile"])


@router.get("/profile")
def profile(
    request: Request,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = current_user.id

    user = db.query(CatalogUsers).filter(CatalogUsers.id == user_id).first()
    user_pref = db.query(CatalogUserPreferences).filter(
        CatalogUserPreferences.user_id == user_id
    ).first()

    return templates.TemplateResponse(
        request,
        "profile.html",
        {
            "request": request,
            "user": user,
            "user_pref": user_pref,
        }
    )


@router.post("/profile")
async def update_profile(
    request: Request,
    full_name: str = Form(...),
    email: str = Form(...),
    timezone: str = Form(...),
    theme: str = Form(...),
    language: str = Form(...),
    avatar: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id

    user = db.query(CatalogUsers).filter(CatalogUsers.id == user_id).first()

    user_pref = db.query(CatalogUserPreferences).filter(
        CatalogUserPreferences.user_id == user_id
    ).first()

    user.full_name = full_name
    user.email = email
    user.updated_at = datetime.now()

    if not user_pref:
        user_pref = CatalogUserPreferences(
            user_id=user_id,
            theme=theme,
            language=language,
            timezone=timezone,
            notification_email_enabled=True,
            notification_app_enabled=True,
        )
        db.add(user_pref)
    else:
        user_pref.timezone = timezone
        user_pref.theme = theme
        user_pref.language = language

    if avatar and avatar.filename:
        avatar_path = f"static/uploads/avatars/{avatar.filename}"

        with open(avatar_path, "wb") as buffer:
            buffer.write(await avatar.read())

        user.avatar_url = f"/{avatar_path}"

    db.commit()

    return RedirectResponse("/profile/", status_code=303)