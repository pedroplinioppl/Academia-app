from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class Perfil(Base):
    __tablename__ = "perfil"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer, 
        ForeignKey("usuario.id"),
        unique=True,
        nullable=False
    )

    nome = Column(String(100), nullable=False)

    avatar = Column(String(255), nullable=True)

    altura = Column(Float, nullable=True)

    sexo = Column(String(20), nullable=True)

    objetivo = Column(String(50), nullable=True)

    data_nascimento = Column(Date, nullable=True)

    usuario = relationship(
        "Usuario",
        back_populates="perfil"
    )