from fastapi import APIRouter, Depends, HTTPException
from schemas import TreinoCreate, ExercicioCreate
from database import SessionLocal
from models import Treino, Exercicio, TreinoDia, TreinoExercicio
from functions.auxiliares import get_current_user_id

router = APIRouter() 

@router.get("/treinos")
def get_treinos(
    usuario_id: int = Depends(get_current_user_id)
):
    db = SessionLocal()

    treinos = db.query(Treino).filter(
        Treino.usuario_id == usuario_id
    ).all() # Todos os treinos do usuário

    return treinos

@router.post("/treinos")
def criar_treino(
    treino: TreinoCreate,
    usuario_id: int = Depends(get_current_user_id)
):
    if not treino.nome:
        raise HTTPException(
            status_code=404,
            detail="Nome de treino é obrigatório"
        )

    db = SessionLocal()

    novo_treino = Treino(
        usuario_id=usuario_id,
        nome=treino.nome,
        descricao=treino.descricao
    )

    db.add(novo_treino)
    db.commit()
    db.refresh(novo_treino)

    return novo_treino

@router.get("/treinos/{treino_id}")
def get_treino(
    treino_id: int,
    usuario_id: int = Depends(get_current_user_id)
):
    db = SessionLocal()

    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    treinos_dia = db.query(TreinoDia).filter(
        TreinoDia.treino_id == treino_id
    ).all()

    exercicios = db.query(TreinoExercicio).filter(
        TreinoExercicio.treino_id == treino_id
    ).all()

    if not treino:
        raise HTTPException(
            status_code=404,
            detail="Treino não encontrado"
        )

    return {
        "id": treino.id,
        "nome": treino.nome,
        "descricao": treino.descricao,
        "dias": [d.dia_semana for d in treinos_dia],
        "exercicios": [
            {
                "id": te.id,
                "exercicio": {                
                    "nome": te.exercicio.nome,
                    "descricao": te.exercicio.descricao,
                    "grupo_muscular": te.exercicio.grupo_muscular,
                },
                "series": te.series,
                "repeticoes": te.repeticoes,
                "observacao": te.observacao
            }
            for te in exercicios
        ]
    }
@router.put("/treinos/{treino_id}")
def atualizar_treino(
    treino_id: int,
    treino: TreinoCreate,
    usuario_id: int = Depends(get_current_user_id)
):
    db = SessionLocal()

    treino_existente = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino_existente:
        raise HTTPException(
            status_code=404,
            detail="Treino não encontrado"
        )

    treino_existente.nome = treino.nome
    treino_existente.descricao = treino.descricao

    db.query(TreinoDia).filter(
        TreinoDia.treino_id == treino_id
    ).delete()

    for dia in treino.dias:
        db.add(
            TreinoDia(
                treino_id=treino_id,
                dia_semana=dia
            )
        )

    db.commit()
    db.refresh(treino_existente)

    return treino_existente

@router.post("/treinos/{treino_id}/exercicios")
def criar_exercicio(
    treino_id: int,
    exercicio: ExercicioCreate,
    usuario_id: int = Depends(get_current_user_id)
):
    db = SessionLocal()

    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino:
        raise HTTPException(
            status_code=404,
            detail="Treino não encontrado"
        )

    novo_exercicio = Exercicio(
        nome=exercicio.nome,
        descricao=exercicio.descricao,
        grupo_muscular=exercicio.grupo_muscular
    )

    db.add(novo_exercicio)
    db.commit()
    db.refresh(novo_exercicio)

    treino_exercicio = TreinoExercicio(
        treino_id=treino_id,
        exercicio_id=novo_exercicio.id,
        series=exercicio.series,
        repeticoes=exercicio.repeticoes
    )

    db.add(treino_exercicio)
    db.commit()
    db.refresh(treino_exercicio)

    return {
        "id": treino_exercicio.id,
        "exercicio": {
            "nome": novo_exercicio.nome,
            "descricao": novo_exercicio.descricao,
            "grupo_muscular": novo_exercicio.grupo_muscular,
        },
        "series": treino_exercicio.series,
        "repeticoes": treino_exercicio.repeticoes,
        "observacao": treino_exercicio.observacao
    }
