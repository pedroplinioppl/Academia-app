import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./TreinosPublicados.css";
import TreinoPublicadoCard from "./TreinoPublicadoCard";
import Perfil from "../Dashboard/components/Perfil";

function TreinosPublicados() {
    const navigate = useNavigate();
    const [treinos, setTreinos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get("http://localhost:8000/treinos/publicados", {
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
            })
            .finally(() => setCarregando(false));
    }, [navigate]);

    return (
        <div className="dashboard">
            <aside
                className="sidebar">
                <Perfil />
            </aside>

            <main className="treinos-publicados-content">
                <div className="treinos-publicados">
                    <h1>Treinos Publicados</h1>

                    {carregando && <p className="mensagem-vazia">Carregando...</p>}

                    {!carregando && treinos.length === 0 && (
                        <p className="mensagem-vazia">
                            Nenhum treino publicado ainda.
                        </p>
                    )}

                    {treinos.map((treino) => (
                        <TreinoPublicadoCard
                            key={treino.publicacao_id}
                            treino={treino}
                            onClick={() => {
                                // futuro: navigate(`/treinos-publicados/${treino.treino_id}`)
                            }}
                        />
                    ))}

                    <div className="bottom-right-buttons">
                        <button
                            className="btn-bottom-right"
                            onClick={() => navigate("/dashboard")}
                        >
                            Dashboard
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default TreinosPublicados;