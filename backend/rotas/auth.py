from fastapi import APIRouter 
from sqlalchemy.orm import Session
from database import SessionLocal
from modelos import Usuario
from schemas import UsuarioCreate
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/cadastro")
def criar_usuario(usuario: UsuarioCreate):
    db: Session = SessionLocal()
    
    novo_usuario = Usuario(
        nome=usuario.nome, 
        email=usuario.email, 
        senha=pwd_context.hash(usuario.senha)
    )
    
    db.add(novo_usuario)
    db.commit()

    return {"mensagem": "Usuário criado com sucesso", "usuario": {"id": novo_usuario.id, "nome": novo_usuario.nome, "email": novo_usuario.email}}