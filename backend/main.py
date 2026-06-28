from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from rotas.auth import router as auth_router
from rotas.perfil import router as perfil_router
from rotas.treinos import router as treinos_router
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(auth_router)
app.include_router(perfil_router)
app.include_router(treinos_router)

@app.get("/")
def home():
    return {"status": "ok"}