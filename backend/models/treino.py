from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Treino(Base):

    __tablename__ = "treinos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=False
    )

    nome = Column(
        String(100),
        nullable=False
    )

    descricao = Column(
        String(500)
    )

    publico = Column(
        Boolean,
        default=False
    )

    data_criacao = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    ordem = Column(
        Integer, 
        nullable=False,
        default=0
    )

    usuario = relationship(
        "Usuario"
    )

    dias = relationship(
        "TreinoDia",
        back_populates="treino",
        cascade="all, delete-orphan"
    )

    exercicios = relationship(
        "TreinoExercicio",
        back_populates="treino",
        cascade="all, delete-orphan"
    )

class TreinoDia(Base):

    __tablename__ = "treino_dias"

    id = Column(
        Integer,
        primary_key=True
    )

    treino_id = Column(
        Integer,
        ForeignKey("treinos.id"),
        nullable=False
    )

    dia_semana = Column(
        String(20),
        nullable=False
    )

    treino = relationship(
        "Treino",
        back_populates="dias"
    )

class Exercicio(Base):

    __tablename__ = "exercicios"

    id = Column(
        Integer,
        primary_key=True
    )

    nome = Column(
        String(100),
        nullable=False
    )

    grupo_muscular = Column(
        String(50)
    )

    descricao = Column(
        String(500)
    )

    treinos = relationship(
        "TreinoExercicio",
        back_populates="exercicio"
    )

class TreinoExercicio(Base):
 
    __tablename__ = "treino_exercicios"

    id = Column(
        Integer,
        primary_key=True
    )

    treino_id = Column(
        Integer,
        ForeignKey("treinos.id"),
        nullable=False
    )

    exercicio_id = Column(
        Integer,
        ForeignKey("exercicios.id"),
        nullable=False
    )

    series = Column(Integer)

    repeticoes = Column(Integer)

    peso = Column(Float)

    observacao = Column(
        String(500)
    )

    ordem = Column(
        Integer, 
        nullable=False,
        default=0
    )

    treino = relationship(
        "Treino",
        back_populates="exercicios"
    )

    exercicio = relationship(
        "Exercicio",
        back_populates="treinos"
    )

class PublicacaoTreino(Base):

    __tablename__ = "publicacao_treinos"

    id = Column(
        Integer,
        primary_key=True
    )

    treino_id = Column(
        Integer,
        ForeignKey("treinos.id"),
        nullable=False
    )

    data_publicacao = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    treino = relationship(
        "Treino"
    )