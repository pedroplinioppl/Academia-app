import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Treinos.css";
import TreinoCard from "./TreinoCard";
import TreinoDetalhe from "./TreinoDetalhe";
import axios from "axios";

function Treinos() {
    const navigate = useNavigate();

    const [treinos, setTreinos] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [treinoSelecionado, setTreinoSelecionado] = useState(null);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get("http://localhost:8000/treinos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setTreinos(res.data);
            })
            .catch((err) => {
                console.error(err);
                navigate("/");
            });
    }, [navigate]);

    async function criarTreino() {
        if (!nome.trim() || !descricao.trim()) {
            alert("Preencha todos os campos.");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://localhost:8000/treinos",
                {
                    nome,
                    descricao,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setTreinos((prev) => [...prev, response.data]);

            setNome("");
            setDescricao("");
            setMostrarModal(false);
        } catch (err) {
            console.error(err);
            alert("Erro ao criar treino.");
        }
    }

    if (treinoSelecionado) {
        return (
            <TreinoDetalhe
                treino={treinoSelecionado}
                voltar={() => setTreinoSelecionado(null)}
            />
        );
    }

    return (
        <>
            <h1>Meus Treinos</h1>

            {treinos.map((treino) => (
                <TreinoCard
                    key={treino.id}
                    treino={treino}
                    onClick={() => setTreinoSelecionado(treino)}
                />
            ))}

            <button onClick={() => setMostrarModal(true)}>
                Adicionar Treino
            </button>

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Criar Treino</h2>

                        <input
                            type="text"
                            placeholder="Nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                        />

                        <textarea
                            placeholder="Descrição"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                        />

                        <div className="botoes">
                            <button
                                onClick={() => {
                                    setMostrarModal(false);
                                    setNome("");
                                    setDescricao("");
                                }}
                            >
                                Cancelar
                            </button>

                            <button onClick={criarTreino}>
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Treinos;