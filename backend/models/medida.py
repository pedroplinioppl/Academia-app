from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Medida(Base):
    __tablename__ = "medida"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuario.id"),
        nullable=False
    )

    peso = Column(Float)

    percentual_gordura = Column(Float)

    peito = Column(Float)

    cintura = Column(Float)

    quadril = Column(Float)

    braco = Column(Float)

    antebraco = Column(Float)

    coxa = Column(Float)

    panturrilha = Column(Float)

    data_registro = Column(
        Date,
        server_default=func.current_date()
    )

    usuario = relationship(
        "Usuario",
        back_populates="medida"
    )