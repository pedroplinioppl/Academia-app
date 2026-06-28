import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";


function App() {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();

  async function cadastrar(e) {
    e.preventDefault();

    try {
      const resposta = await axios.post(
        "http://localhost:8000/cadastro",
        {
          nome,
          email: usuario,
          senha: senha,
        }
      );

      localStorage.setItem(
        "token",
        resposta.data.access_token
      )

      setNome("");
      setUsuario("");
      setSenha("");

      navigate("/dashboard")
    } catch (erro) {
      console.error(erro);
      alert("Erro ao cadastrar usuário: " + erro.response.data.detail);
    }
  }

  async function fazerLogin(e) {
    e.preventDefault();

    try {
      const resposta = await axios.post(
        "http://localhost:8000/login",
        {
          email: usuario,
          senha: senha,
        }
      );

      localStorage.setItem(
          "token",
          resposta.data.access_token
      )

      setUsuario("");
      setSenha("");

      navigate("/dashboard")
    } catch (erro) {
      console.error(erro);
      alert("Erro ao fazer login: " + erro.response.data.detail);
    }
  }

  useEffect(() => {
      const token = localStorage.getItem("token");

      if (token) {
          navigate("/dashboard");
      }
  }, [navigate]);

  return (
    <div className="container">
      <form className="card" onSubmit={login ? fazerLogin : cadastrar}>
        <img src="/icon.png" alt="Self Gym" className="logo" />
        <h1>Self Gym</h1>

        {!login && (
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        )}

        <input
          type="text"
          placeholder="E-mail"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button type="submit">
          {login ? "Entrar" : "Criar Conta"}
        </button>

        <p className="troca-form">
          {login ? "Não possui uma conta? " : "Já possui uma conta? "}
          <span onClick={() => setLogin(!login)}>
            {login ? "Criar Conta" : "Entrar"}
          </span>
        </p>
      </form>
    </div>
  );
}

export default App;