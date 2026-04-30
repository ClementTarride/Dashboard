from datetime import datetime
from fastapi import APIRouter, Request, Depends, Form, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.db.models.utilisateurs_db import CatalogTeams, CatalogUsers, CatalogTeamMembers, CatalogRoles
from app.core.config import templates
from app.routers.get_current_user import get_current_user
router = APIRouter(tags=["teams"])

@router.get("/teams", response_class=HTMLResponse)
def teams_page(request: Request, db: Session = Depends(get_db),current_user = Depends(get_current_user)):
    teams = db.query(CatalogTeams).all()
    users = db.query(CatalogUsers).all()
    roles = db.query(CatalogRoles).all()

    team_members = (
        db.query(CatalogTeamMembers, CatalogUsers, CatalogRoles)
        .join(CatalogUsers, CatalogUsers.id == CatalogTeamMembers.user_id)
        .join(CatalogRoles, CatalogRoles.id == CatalogTeamMembers.role_id)
        .all()
    )

    members_by_team = {}

    for member, user, role in team_members:
        members_by_team.setdefault(member.team_id, []).append({
            "user": user,
            "role": role
        })

    return templates.TemplateResponse(
        request,
        "teams.html",
        {
            "request": request,
            "teams": teams,
            "users": users,
            "roles": roles,
            "members_by_team": members_by_team,
        },
    )

@router.post("/teams/create")
def create_team(
    name: str = Form(...),
    type: str = Form(...),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    team = CatalogTeams(
        name=name,
        type=type,
        description=description,
        status="active",
        created_at=datetime.now(),
    )
    db.add(team)
    db.commit()

    return RedirectResponse("/teams", status_code=303)


@router.post("/teams/{team_id}/members/add")
def add_team_member(
    team_id: int,
    user_ids: list[int] = Form(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    for user_id in user_ids:
        exists = db.query(CatalogTeamMembers).filter(
            CatalogTeamMembers.team_id == team_id,
            CatalogTeamMembers.user_id == user_id
        ).first()
        if not exists:
            db.add(CatalogTeamMembers(
                team_id=team_id,
                user_id=user_id,
                role_id=None,
                joined_at=datetime.now()
            ))
    db.commit()
    return RedirectResponse("/teams", status_code=303)


@router.post("/teams/{team_id}/members/{user_id}/remove")
def remove_team_member(
    team_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    member = (
        db.query(CatalogTeamMembers)
        .filter(
            CatalogTeamMembers.team_id == team_id,
            CatalogTeamMembers.user_id == user_id,
        )
        .first()
    )

    if member:
        db.delete(member)
        db.commit()

    return RedirectResponse("/teams", status_code=303)