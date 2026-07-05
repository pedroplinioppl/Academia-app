import os
import shutil

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from schemas import TreinoCreate, ExercicioCreate
from models import Treino, Exercicio, TreinoDia, TreinoExercicio, PublicacaoTreino
from functions.auxiliares import get_current_user_id, get_db


router = APIRouter() 

@router.get("/treinos")
def get_treinos(
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

    treinos = db.query(Treino).filter(
        Treino.usuario_id == usuario_id
    ).order_by(Treino.ordem).all()

    return treinos
 
@router.post("/treinos")
def criar_treino(
    treino: TreinoCreate, 
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    if not treino.nome:
        raise HTTPException(
            status_code=404,
            detail="Nome de treino é obrigatório"
        )


    max_ordem = db.query(func.max(Treino.ordem)).filter(
        Treino.usuario_id == usuario_id
    ).scalar() or 0

    novo_treino = Treino(
        usuario_id=usuario_id,
        nome=treino.nome,
        descricao=treino.descricao,
        ordem=max_ordem + 1
    )

    db.add(novo_treino)
    db.commit()
    db.refresh(novo_treino)

    return novo_treino

@router.get("/treinos/publicados")
def get_treinos_publicados(
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    publicacoes = db.query(PublicacaoTreino).order_by(
        PublicacaoTreino.data_publicacao.desc()
    ).all()

    resultado = []
    for pub in publicacoes:
        treino = pub.treino
        autor_perfil = treino.usuario.perfil

        resultado.append({
            "publicacao_id": pub.id,
            "treino_id": treino.id,
            "nome": treino.nome,
            "descricao": treino.descricao,
            "data_publicacao": pub.data_publicacao,
            "autor": {
                "id": autor_perfil.id,
                "nome": autor_perfil.nome,
                "avatar": autor_perfil.avatar
            }
        })

    return resultado

@router.get("/treinos/{treino_id}")
def get_treino(
    treino_id: int,
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):


    treino = (
        db.query(Treino)
        .filter(
            Treino.id == treino_id,
            or_(
                Treino.usuario_id == usuario_id,
                Treino.id.in_(
                    db.query(PublicacaoTreino.treino_id)
                )
            )
        )
        .first()
    )

    if not treino:
        raise HTTPException(
            status_code=404,
            detail="Treino não encontrado"
        )

    treinos_dia = db.query(TreinoDia).filter(
        TreinoDia.treino_id == treino_id
    ).all()

    exercicios = db.query(TreinoExercicio).filter(
        TreinoExercicio.treino_id == treino_id
    ).order_by(TreinoExercicio.ordem).all()

    return {
        "id": treino.id,
        "nome": treino.nome,
        "descricao": treino.descricao,
        "dias": [d.dia_semana for d in treinos_dia],
        "exercicios": [
            {
                "id": te.id,
                "ordem": te.ordem,
                "exercicio": {                
                    "nome": te.exercicio.nome,
                    "descricao": te.exercicio.descricao,
                    "grupo_muscular": te.exercicio.grupo_muscular,
                },
                "peso": te.peso,
                "series": te.series,
                "repeticoes": te.repeticoes,
                "observacao": te.observacao,
                "avatar": te.avatar
            }
            for te in exercicios
        ]
    }

@router.put("/treinos/{treino_id}")
def atualizar_treino(
    treino_id: int,
    treino: TreinoCreate,
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):


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

@router.delete("/treinos/{treino_id}")
def deletar_treino(
    treino_id: int,
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    
    # Apaga todas as publicações relacionadas a esse treino
    db.query(PublicacaoTreino).filter(
        PublicacaoTreino.treino_id == treino_id
    ).delete()

    treino = db.query(Treino).filter(
        Treino.id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino:
        raise HTTPException(
            status_code=404,
            detail="Treino não encontrado"
        )

    db.delete(treino)
    db.commit()

    return {"message": "Treino deletado com sucesso"}

@router.post("/treinos/{treino_id}/publicar")
def publicar_treino(
        treino_id: int,
        user_id: int = Depends(get_current_user_id),
        db: Session = Depends(get_db)
):
    #Verifica se o treino já foi publicado 
    publicacao = db.query(PublicacaoTreino).filter(
        PublicacaoTreino.treino_id == treino_id
    ).first()

    if publicacao:
        raise HTTPException(
            status_code=400,
            detail="Treino já foi publicado"
        )
    else:
        #Verifica se o treino pertence ao usuário
        treino = db.query(Treino).filter(
            Treino.id == treino_id,
            Treino.usuario_id == user_id
        ).first()

        if not treino:
            raise HTTPException(
                status_code=400,
                detail=f"Treino não encontrado: {user_id} - {treino_id}"
            )

        nova_publicacao = PublicacaoTreino(
            treino_id=treino_id
        )

        db.add(nova_publicacao)
        db.commit()
        db.refresh(nova_publicacao)

        return {"message": "Treino publicado com sucesso"}

@router.delete("/treinos/{treino_id}/publicar")
def despublicar_treino(
        treino_id: int,
        user_id: int = Depends(get_current_user_id),
        db: Session = Depends(get_db)
):
    publicacao = db.query(PublicacaoTreino).filter(
        PublicacaoTreino.treino_id == treino_id
    ).first()

    if not publicacao:
        raise HTTPException(
            status_code=400,
            detail="Treino não está publicado"
        )
    else:
        #Verifica se o treino pertence ao usuário
        treino = db.query(Treino).filter(
            Treino.id == treino_id,
            Treino.usuario_id == user_id
        ).first()

        if not treino:
            raise HTTPException(
                status_code=400,
                detail=f"Treino não encontrado: {user_id} - {treino_id}"
            )

        db.delete(publicacao)
        db.commit()

        return {"message": "Treino despublicado com sucesso"}

@router.get("/treinos/publicados")
def meus_treinos_publicados(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    treinos = db.query(Treino).join(PublicacaoTreino).filter(
        PublicacaoTreino.treino_id == Treino.id,
        Treino.usuario_id == user_id
    ).all()

    return treinos

@router.put("/treinos/{treino_id}/exercicios/{treino_exercicio_id}")
def atualizar_exercicio(
    treino_id: int,
    exercicio: ExercicioCreate,
    treino_exercicio_id: int,          # ← renomeia pra ficar claro
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    
    treino_exercicio = db.query(TreinoExercicio).join(Treino).filter(
        TreinoExercicio.id == treino_exercicio_id,  # ← filtra pelo ID do TreinoExercicio
        TreinoExercicio.treino_id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino_exercicio:
        raise HTTPException(
            status_code=404,
            detail="Exercício não encontrado"
        )
    
    treino_exercicio.series = exercicio.series
    treino_exercicio.repeticoes = exercicio.repeticoes
    treino_exercicio.peso = exercicio.peso
    treino_exercicio.exercicio.nome = exercicio.nome
    treino_exercicio.exercicio.descricao = exercicio.descricao
    treino_exercicio.exercicio.grupo_muscular = exercicio.grupo_muscular

    db.commit()
    db.refresh(treino_exercicio)
    db.refresh(treino_exercicio.exercicio)  
    
    return treino_exercicio

@router.post("/treinos/{treino_id}/exercicios/{treino_exercicio_id}/avatar")
def atualizar_avatar_exercicio(
    treino_id: int,
    treino_exercicio_id: int,
    file: UploadFile = File(...),
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    treino_exercicio = db.query(TreinoExercicio).join(Treino).filter(
        TreinoExercicio.id == treino_exercicio_id,
        TreinoExercicio.treino_id == treino_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino_exercicio:
        raise HTTPException(
            status_code=404,
            detail="Exercício não encontrado"
        )

    if treino_exercicio.avatar:
        caminho_antigo = os.path.join("uploads", treino_exercicio.avatar)

        if os.path.exists(caminho_antigo):
            os.remove(caminho_antigo)

    extensao = file.filename.split(".")[-1]

    nome_arquivo = f"avatar_{usuario_id}_te_{treino_exercicio_id}.{extensao}"

    caminho = os.path.join(
        "uploads",
        nome_arquivo
    )

    with open(caminho, "wb") as buffer:
        shutil.copyfileobj(
            file.file,
            buffer
        )

    treino_exercicio.avatar = nome_arquivo

    db.commit()
    db.refresh(treino_exercicio)

    return {
        "id": treino_exercicio.id,
        "avatar": treino_exercicio.avatar
    }

@router.post("/treinos/{treino_id}/exercicios")
def criar_exercicio(
    treino_id: int,
    exercicio: ExercicioCreate,
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):

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

    max_ordem = db.query(func.max(TreinoExercicio.ordem)).filter(
        TreinoExercicio.treino_id == treino_id
    ).scalar() or 0

    treino_exercicio = TreinoExercicio(
        treino_id=treino_id,
        exercicio_id=novo_exercicio.id,
        series=exercicio.series,
        repeticoes=exercicio.repeticoes,
        peso=exercicio.peso,
        ordem=max_ordem + 1
    )

    db.add(treino_exercicio)
    db.commit()
    db.refresh(treino_exercicio)

    return {
        "id": treino_exercicio.id,
        "ordem": treino_exercicio.ordem,
        "exercicio": {
            "nome": novo_exercicio.nome,
            "descricao": novo_exercicio.descricao,
            "grupo_muscular": novo_exercicio.grupo_muscular,
        },
        "series": treino_exercicio.series,
        "repeticoes": treino_exercicio.repeticoes,
        "peso": treino_exercicio.peso,
        "observacao": treino_exercicio.observacao
    }

@router.delete("/treinos/{treino_id}/exercicios/{exercicio_id}")
def apagar_exercicio(
    treino_id: int,
    exercicio_id: int,
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    treino_exercicio = db.query(TreinoExercicio).join(Treino).filter(
        TreinoExercicio.treino_id == treino_id,
        TreinoExercicio.exercicio_id == exercicio_id,
        Treino.usuario_id == usuario_id
    ).first()

    if not treino_exercicio:
        raise HTTPException(
            status_code=404,
            detail="Exercício não encontrado"
        )

    db.delete(treino_exercicio)
    db.commit()

    return {"message": "Exercício apagado com sucesso"}

@router.patch("/treino/exercicios/reordenar")
def reordenar_exercicios(
    ordem: list[int],
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    for index, te_id in enumerate(ordem):
        exercicio = (
            db.query(TreinoExercicio)
            .filter(TreinoExercicio.id == te_id)
            .first()
        )

        if exercicio and exercicio.treino.usuario_id == usuario_id:
            exercicio.ordem = index

    db.commit()

@router.patch("/treino/reordenar")
def reordenar_treinos(
    ordem: list[int],
    usuario_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    treinos = (
        db.query(Treino)
        .filter(Treino.usuario_id == usuario_id)
        .all()
    )

    treinos_por_id = {t.id: t for t in treinos}

    for index, treino_id in enumerate(ordem):
        if treino_id in treinos_por_id:
            treinos_por_id[treino_id].ordem = index

    db.commit()
