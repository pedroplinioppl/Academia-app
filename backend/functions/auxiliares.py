from datetime import timedelta

from fastapi import Header, HTTPException
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv("venv/variaveis.env")

ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY")

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
        )

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