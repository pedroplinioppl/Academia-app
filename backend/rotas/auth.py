from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Usuario, Perfil
from schemas import UsuarioCreate, UsuarioLogin
from passlib.context import CryptContext

from functions.auxiliares import criar_token

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
###############################
#   Rotas de autenticação     #
###############################


@router.post("/cadastro")
def criar_usuario(usuario: UsuarioCreate):
    db: Session = SessionLocal()
    
    novo_usuario = Usuario(
        email=usuario.email,
        senha_hash=pwd_context.hash(usuario.senha)
    )

    #for usuario_existente in db.query(Usuario).all():
    #    if pwd_context.verify(usuario.senha, usuario_existente.senha_hash):
    #        raise HTTPException(
    #            status_code=400,
    #            detail="Senha já está em uso pelo usuário: {}".format(usuario_existente.email)
    #        )

    # Verifica se o email já está em uso
    usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="Email já está em uso"
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
    
    if not usuario_db or not pwd_context.verify(usuario.senha, usuario_db.senha_hash):
        return {"mensagem": "Credenciais inválidas"}
    
    token = criar_token(usuario_db.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "mensagem": "Login bem-sucedido"
    }
