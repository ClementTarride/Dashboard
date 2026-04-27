from sqlalchemy import Column, Integer, String, Text, ForeignKey, DATETIME, Boolean, PrimaryKeyConstraint
from app.db.database import Base
# UTILISATEURS / ÉQUIPES / RÔLES

class CatalogUsers(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    status = Column(String(50), nullable=False)  # active, invited, suspended
    last_activity_at = Column(DATETIME, nullable=True)
    created_at = Column(DATETIME, nullable=False)
    updated_at = Column(DATETIME, nullable=False)


class CatalogTeams(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # business, technical, restricted
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False)
    created_at = Column(DATETIME, nullable=False)


class CatalogTeamMembers(Base):
    __tablename__ = "team_members"

    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    joined_at = Column(DATETIME, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "user_id"),
    )


class CatalogRoles(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)  # Admin, Data Engineer, Editor, Viewer
    description = Column(Text, nullable=True)


class CatalogPermissions(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(100), unique=True, nullable=False)  # dashboard.read, dashboard.edit, source.admin
    label = Column(String(255), nullable=False)


class CatalogRolePermissions(Base):
    __tablename__ = "role_permissions"

    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("role_id", "permission_id"),
    )