from fastapi import APIRouter 
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario, Perfil
from schemas import UsuarioCreate, UsuarioLogin
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from os import getenv
from dotenv import load_dotenv

load_dotenv("venv/variaveis.env")

ALGORITHM = "HS256"
SECRET_KEY = getenv("SECRET_KEY")

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/cadastro")
def criar_usuario(usuario: UsuarioCreate):
    db: Session = SessionLocal()
    
    novo_usuario = Usuario(
        email=usuario.email,
        senha_hash=pwd_context.hash(usuario.senha)
    )

    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    perfil = Perfil(
        usuario_id=novo_usuario.id,
        nome=usuario.nome
    )

    db.add(perfil)
    db.commit()
    
    db.add(novo_usuario)
    db.commit()
    db.refresh(novo_usuario)

    token = criar_token(novo_usuario.id)

    return {"mensagem": "Usuário criado com sucesso", "access_token": token, "token_type": "bearer"}

@router.post("/login")
def login_usuario(usuario: UsuarioLogin):
    db: Session = SessionLocal()
    
    usuario_db = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    
    if not usuario_db or not pwd_context.verify(usuario.senha, usuario_db.senha):
        return {"mensagem": "Credenciais inválidas"}
    
    token = criar_token(usuario_db.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "mensagem": "Login bem-sucedido"
    }

def criar_token(usuario_id: int):
    payload = {
        "sub": str(usuario_id),
        "exp": datetime.now() + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )