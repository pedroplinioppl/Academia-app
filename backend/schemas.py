from sqlite3 import Date
from pydantic import BaseModel

class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str

class UsuarioLogin(BaseModel):
    email: str
    senha: str

class PerfilUpdate(BaseModel):
    nome: str | None = None
    altura: float | None = None
    sexo: str | None = None
    avatar: str | None = None
    objetivo: str | None = None
    data_nascimento: Date | None = None

class TreinoCreate(BaseModel):
    nome: str
    descricao: str | None = None
    dias: list[str] = []

class ExercicioCreate(BaseModel):
    nome: str
    descricao: str | None = None
    grupo_muscular: str | None = None
    series: int | None = None
    repeticoes: int | None = None
    peso: float | None = None

class MedidaCreate(BaseModel):
    peso: float  | None = None
    percentual_gordura: float | None = None
    peito: float | None = None
    cintura: float | None = None
    quadril: float | None = None
    braco: float | None = None
    antebraco: float  | None = None
    coxa: float | None = None
    ombro: float | None = None 
    abdomen: float | None = None
    panturrilha: float | None = None
    data_registro: Date