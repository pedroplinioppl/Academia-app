from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Usuario(Base):
    __tablename__ = "usuario"

    id = Column(Integer, primary_key=True, index=True)

    email = Column(String(255), unique=True, nullable=False)

    senha_hash = Column(String(255), nullable=False)

    data_cadastro = Column(DateTime(timezone=True),
                           server_default=func.now())

    perfil = relationship(
        "Perfil",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan"
    )

    medida = relationship(
        "Medida",
        back_populates="usuario",
        cascade="all, delete-orphan"
    )