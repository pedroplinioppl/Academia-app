from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Perfil
from schemas import PerfilUpdate
import shutil
import os
from database import SessionLocal
from functions.auxiliares import get_current_user_id

router = APIRouter()

@router.post("/perfil/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    usuario_id: int = Depends(get_current_user_id),
):
    
    db = SessionLocal()

    perfil = db.query(Perfil).filter(
        Perfil.usuario_id == usuario_id
    ).first()

    if not perfil:
        raise HTTPException(
            status_code=404,
            detail="Perfil não encontrado"
        )
    
    if perfil.avatar:
        caminho_antigo = os.path.join("uploads", perfil.avatar)

        if os.path.exists(caminho_antigo):
            os.remove(caminho_antigo)

    extensao = file.filename.split(".")[-1]

    nome_arquivo = f"avatar_{usuario_id}.{extensao}"

    caminho = os.path.join(
        "uploads",
        nome_arquivo
    )

    with open(caminho, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    perfil.avatar = nome_arquivo

    db.commit()

    return {
        "message": "Avatar atualizado",
        "avatar": nome_arquivo
    }

@router.get("/perfil")
def buscar_perfil(
    user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    perfil = db.query(
        Perfil
    ).filter(
        Perfil.usuario_id == user_id
    ).first()

    return perfil

@router.put("/perfil")
def atualizar_perfil( 
    dados: PerfilUpdate,
    user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    perfil = (
        db.query(Perfil)
        .filter(Perfil.usuario_id == user_id)
        .first()
    )

    if not perfil:
        raise HTTPException(
            status_code=404,
            detail="Perfil não encontrado"
        )

    if dados.nome is not None:
        perfil.nome = dados.nome

    if dados.altura is not None:
        perfil.altura = dados.altura

    if dados.sexo is not None:
        perfil.sexo = dados.sexo

    if dados.objetivo is not None:
        perfil.objetivo = dados.objetivo

    if dados.data_nascimento is not None:
        perfil.data_nascimento = dados.data_nascimento

    db.commit()
    db.refresh(perfil)

    return perfil