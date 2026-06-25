import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function cadastrar(e) {
    e.preventDefault();

    try {

      const resposta = await axios.post(
        "http://localhost:8000/cadastro",
        {
          nome,
          email,
          senha,
        }
      );

      alert(resposta.data.mensagem);

      setNome("");
      setEmail("");
      setSenha("");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao cadastrar usuário");
    }
  }

  return (
    <div className="container">
      <form className="card" onSubmit={cadastrar}>
        <h1>Academia App</h1>

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">
          Criar Conta
        </button>
      </form>
    </div>
  );
}

export default App;