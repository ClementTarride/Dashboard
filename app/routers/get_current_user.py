from fastapi import Request, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models.utilisateurs_db import CatalogUsers

def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.session.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Non connecté")

    user = db.query(CatalogUsers).filter(CatalogUsers.id == user_id).first()

    if not user:
        request.session.clear()
        raise HTTPException(status_code=401, detail="Session invalide")

    return user