from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect
from app.routers import acceuil, auth, dashboard, header, sources, tables, profile, utilisateur, teams
from starlette.middleware.sessions import SessionMiddleware
from app.db.database import SessionLocal, engine, Base
from app.db.models import *
from app.config import cle_ultra_secraite, https_only
app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key=cle_ultra_secraite,
    https_only=https_only,
    same_site="lax",
)

db = SessionLocal()
inspector = inspect(engine)

# vérifier si la table existe
if "catalog_items" not in inspector.get_table_names():
    Base.metadata.create_all(bind=engine)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(auth.router)
app.include_router(header.router)
app.include_router(acceuil.router)
app.include_router(dashboard.router)
app.include_router(sources.router)
app.include_router(tables.router)
app.include_router(profile.router)
app.include_router(utilisateur.router)
app.include_router(teams.router)