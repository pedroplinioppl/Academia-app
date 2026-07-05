from fastapi import APIRouter, Depends, HTTPException
from schemas import MedidaCreate
from models import Medida
from sqlalchemy.orm import Session
from functions.auxiliares import get_current_user_id, get_db

router = APIRouter()

@router.get("/medidas")
def buscar_medidas(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    medida = (
        db.query(Medida)
        .filter(Medida.usuario_id == user_id)
        .order_by(Medida.data_registro.desc())
        .all()
    )

    if not medida:
        return [{
            "peso": 0,
            "percentual_gordura": 0,
            "ombro": 0,
            "abdomen": 0,
            "peito": 0,
            "cintura": 0,
            "quadril": 0,
            "braco": 0,
            "antebraco": 0,
            "coxa": 0,
            "panturrilha": 0,
            "data_registro": None
        }]
    

    return medida

@router.post("/medidas")
def adicionar_medida(
    medidas: MedidaCreate,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    nova_medida = Medida(
        usuario_id=user_id,
        peso=medidas.peso,
        percentual_gordura=medidas.percentual_gordura,
        peito=medidas.peito,
        cintura=medidas.cintura,
        quadril=medidas.quadril, 
        braco=medidas.braco,
        antebraco=medidas.antebraco,
        ombro=medidas.ombro,
        abdomen=medidas.abdomen,
        coxa=medidas.coxa,
        panturrilha=medidas.panturrilha,
        data_registro=medidas.data_registro
    )

    db.add(nova_medida)
    db.commit()
    db.refresh(nova_medida)

    return nova_medida