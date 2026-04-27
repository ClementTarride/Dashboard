from datetime import datetime

from fastapi import APIRouter, Request, Form, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.security import pwd_context
from app.db.database import get_db
from app.db.models.utilisateurs_db import CatalogUsers
from app.core.utils import render


router = APIRouter(tags=["auth"])


@router.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return render(request, "index.html")


@router.post("/login", response_class=HTMLResponse)
async def login(
    request: Request,
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if not email or not password:
        return render(request, "index.html", {
            "message": "Email et mot de passe requis."
        })

    if "@" not in email or "." not in email:
        return render(request, "index.html", {
            "message": "Email invalide."
        })

    user = db.query(CatalogUsers).filter(CatalogUsers.email == email).first()

    if user and pwd_context.verify(password, user.password_hash):
        user.last_activity_at = datetime.now()
        db.commit()
        request.session["user_id"] = user.id
        return RedirectResponse(url="/acceuil", status_code=303)

    return render(request, "index.html", {
        "message": "Email ou mot de passe incorrect."
    })


@router.post("/register", response_class=HTMLResponse)
async def register(
    request: Request,
    fullname: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    if not fullname or not email or not password:
        return render(request, "index.html", {
            "message": "Tous les champs sont requis."
        })

    if "@" not in email or "." not in email:
        return render(request, "index.html", {
            "message": "Email invalide."
        })

    existing_user = db.query(CatalogUsers).filter(CatalogUsers.email == email).first()

    if existing_user:
        return render(request, "index.html", {
            "message": "Email déjà utilisé."
        })

    now = datetime.now()

    new_user = CatalogUsers(
        full_name=fullname,
        email=email,
        password_hash=pwd_context.hash(password),
        avatar_url=None,
        status="active",
        last_activity_at=None,
        created_at=now,
        updated_at=now
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return render(request, "index.html", {
        "message": f"Compte créé pour {fullname} !"
    })


@router.get("/logout", response_class=HTMLResponse)
async def logout(request: Request):
    return render(request, "index.html", {
        "message": "Vous êtes déconnecté."
    })