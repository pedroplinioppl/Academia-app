import os
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import Header, HTTPException
from jose import jwt, JWTError
from database import SessionLocal

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY", "chave_padrao_para_desenvolvimento_trocar_em_producao")

def get_current_user_id(
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token ausente"
        )

    try:
        token = authorization.replace(
            "Bearer ",
            ""
        ).strip()

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Token inválido"
            )

        return int(user_id)

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido"
        )
    
def criar_token(usuario_id: int):
    payload = {
        "sub": str(usuario_id),
        "exp": datetime.now() + timedelta(days=7)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
