from datetime import datetime
from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from app.core.security import pwd_context

from app.core.config import templates
from app.db.database import get_db
from app.db.models.utilisateurs_db import CatalogUsers, CatalogTeams, CatalogRoles, CatalogTeamMembers

router = APIRouter(tags=["users"])


@router.get("/users", response_class=HTMLResponse)
async def users_list(request: Request, db: Session = Depends(get_db)):
    users = (
        db.query(CatalogUsers)
        .order_by(CatalogUsers.created_at.desc())
        .all()
    )

    teams = db.query(CatalogTeams).all()
    roles = db.query(CatalogRoles).all()

    memberships = {
        m.user_id: m
        for m in db.query(CatalogTeamMembers).all()
    }

    return templates.TemplateResponse(
        request,
        "users.html",
        {
            "request": request,
            "users": users,
            "teams": teams,
            "roles": roles,
            "memberships": memberships,
        },
    )


@router.post("/users/save")
async def user_save(
    db: Session = Depends(get_db),
    user_id: int | None = Form(None),
    full_name: str = Form(...),
    email: str = Form(...),
    password: str | None = Form(None),
    status: str = Form("active"),
    avatar_url: str | None = Form(None),
):
    now = datetime.utcnow()

    if user_id:
        user = db.query(CatalogUsers).filter(CatalogUsers.id == user_id).first()
        if not user:
            return RedirectResponse("/users", status_code=303)

        user.full_name = full_name
        user.email = email
        user.status = status
        user.avatar_url = avatar_url
        user.updated_at = now

        if password:
            user.password_hash = pwd_context.hash(password)

    else:
        user = CatalogUsers(
            full_name=full_name,
            email=email,
            password_hash=pwd_context.hash(password or "changeme"),
            avatar_url=avatar_url,
            status=status,
            created_at=now,
            updated_at=now,
        )
        db.add(user)

    db.commit()
    return RedirectResponse("/users", status_code=303)


@router.post("/{user_id}/delete")
async def user_delete(user_id: int, db: Session = Depends(get_db)):
    user = db.query(CatalogUsers).filter(CatalogUsers.id == user_id).first()

    if user:
        db.query(CatalogTeamMembers).filter(
            CatalogTeamMembers.user_id == user_id
        ).delete()

        db.delete(user)
        db.commit()

    return RedirectResponse("/users", status_code=303)