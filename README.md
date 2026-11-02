# Self Gym 🏋️‍♂️

Aplicativo web completo para gerenciamento e compartilhamento de treinos e acompanhamento de medidas corporais.

Permite que você:
- Crie, organize e reordene seus treinos e exercícios (com fotos personalizadas).
- Compartilhe treinos publicamente para que outros usuários possam visualizar e copiar para a própria lista.
- Acompanhe sua evolução física registrando medidas corporais.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python 3, [FastAPI](https://fastapi.tiangolo.com/), [SQLAlchemy](https://www.sqlalchemy.org/), [Uvicorn](https://www.uvicorn.org/), JWT (python-jose), Passlib (bcrypt).
- **Banco de Dados:** PostgreSQL (ou SQLite para desenvolvimento local rápido).
- **Frontend:** React, Vite, Axios, @dnd-kit (arrastar e soltar).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.10 ou superior
- Node.js 18 ou superior e npm
- PostgreSQL (opcional, por padrão em desenvolvimento pode utilizar SQLite)

---

### 1. Configurando o Backend

1. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Linux/macOS:
   source venv/bin/activate
   # No Windows:
   venv\Scripts\activate
   ```

2. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure as variáveis de ambiente:
   - Copie o arquivo de exemplo:
     ```bash
     cp .env.example .env
     ```
   - Edite o `.env` com a sua string de conexão do PostgreSQL e uma chave secreta JWT segura:
     ```env
     DATABASE_URL=postgresql://usuario:senha@localhost:5432/academia
     SECRET_KEY=sua_chave_secreta_aqui
     ```
   *(Nota: se preferir testar localmente sem PostgreSQL configurado, utilize `DATABASE_URL=sqlite:///./academia.db`)*

4. Inicie o servidor FastAPI:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```
   A API estará rodando em `http://localhost:8000` (documentação interativa Swagger disponível em `http://localhost:8000/docs`).

---

### 2. Configurando o Frontend

1. Acesse o diretório do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   O frontend estará acessível em `http://localhost:5173`.

---

## 🔒 Segurança e Boas Práticas

- Nunca comite arquivos `.env` contendo senhas e segredos de produção no Git.
- Todos os uploads de arquivos são validados quanto à extensão para impedir upload de arquivos executáveis maliciosos.
- As senhas dos usuários são protegidas com hash seguro via bcrypt.
