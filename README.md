# Self Gym 🏋️‍♂️

Aplicativo web completo para gerenciamento e compartilhamento de treinos e acompanhamento de medidas corporais.

Permite que você:
- Crie, organize e reordene seus treinos e exercícios (com fotos personalizadas).
- Compartilhe treinos publicamente para que outros usuários possam visualizar e copiar para a própria lista.
- Acompanhe sua evolução física registrando medidas corporais.

---
 
## 🛠️ Tecnologias Utilizadas

- **Backend:** Python, FastAPI, SQLAlchemy, Uvicorn, JWT, Passlib (bcrypt).
- **Banco de Dados:** PostgreSQL
- **Frontend:** React, Vite, Axios

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Python 3.10 ou superior
- Node.js 18 ou superior e npm
- PostgreSQL (Em desenvolvimento da pra substituir por sqllite)

---

### 1. Configurando o Backend

1. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv

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
- Todos os uploads de arquivos são validados quanto à extensão para impedir upload de arquivos executáveis maliciosos.
- As senhas dos usuários são protegidas com hash seguro via bcrypt.
