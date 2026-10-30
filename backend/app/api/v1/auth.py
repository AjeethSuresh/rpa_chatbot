"""
Authentication endpoints: Registration, Login, Current User profile.
"""
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from app.core.security import create_access_token, get_password_hash, verify_password, RoleChecker

router = APIRouter()

# In-memory user database with seed accounts
USERS_DB: Dict[str, Dict[str, Any]] = {
    "admin@autoflow.ai": {
        "email": "admin@autoflow.ai",
        "name": "Sarah Connor",
        "hashed_password": get_password_hash("Admin123!"),
        "role": "ADMIN",
    },
    "reviewer@autoflow.ai": {
        "email": "reviewer@autoflow.ai",
        "name": "Alex Vance",
        "hashed_password": get_password_hash("Reviewer123!"),
        "role": "REVIEWER",
    },
    "operator@autoflow.ai": {
        "email": "operator@autoflow.ai",
        "name": "David Miller",
        "hashed_password": get_password_hash("Operator123!"),
        "role": "OPERATOR",
    },
}


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "OPERATOR"


@router.post("/register")
async def register(req: RegisterRequest):
    if req.email in USERS_DB:
        raise HTTPException(status_code=400, detail="User with this email already registered")
    USERS_DB[req.email] = {
        "email": req.email,
        "name": req.name,
        "hashed_password": get_password_hash(req.password),
        "role": req.role.upper(),
    }
    token = create_access_token(subject=req.email, role=req.role.upper())
    return {"access_token": token, "token_type": "bearer", "role": req.role.upper(), "name": req.name}


@router.post("/login")
async def login(req: LoginRequest):
    user = USERS_DB.get(req.email)
    if not user or not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(subject=user["email"], role=user["role"])
    return {"access_token": token, "token_type": "bearer", "role": user["role"], "name": user["name"]}


@router.get("/me")
async def get_current_user(current_user=Depends(RoleChecker(allowed_roles=["ADMIN", "REVIEWER", "OPERATOR"]))):
    email = current_user.get("sub")
    user = USERS_DB.get(email, {"email": email, "name": "Current User", "role": current_user.get("role")})
    return {"email": user["email"], "name": user.get("name", "User"), "role": user.get("role", "OPERATOR")}
