import { useState, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import botaoPublicar from "../../../assets/botao publicar.png";
import axios from "axios";
import "./TreinoCard.css";

function TreinoCard({ treino, onClick }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: treino.id });

    const [mConfirmacao, setModalConfirmacao] = useState(false);
    const [treinoPublicado, setTreinoPublicado] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        const verificarTreinoPublicado = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8000/treinos/publicados",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (res.data.some((t) => t.treino_id === treino.id)) {
                    setTreinoPublicado(true);
                } else {
                    setTreinoPublicado(false);
                }
            } catch (err) {
                console.error(err);
            }
        };

        verificarTreinoPublicado();
    }, [treino.id]);

    async function publicarTreino() {
        try {
            const token = localStorage.getItem("token");

            await axios.post(
                `http://localhost:8000/treinos/${treino.id}/publicar`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Treino publicado com sucesso!");
            setModalConfirmacao(false);
        } catch (err) {
            alert(err.response.data.detail);
        }
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className="treino-card clicavel"
                onClick={onClick}
            >
                <span className="drag-handle" {...attributes} {...listeners}>
                    ⠿
                </span>

                <div className="treino-card-conteudo">
                    <h3>{treino.nome}</h3>
                    <p>{treino.descricao}</p>
                </div>

                {!treinoPublicado && (
                    <button
                        style={{
                            marginLeft: "auto",
                            width: "auto",
                            background: "transparent",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setModalConfirmacao(true);
                        }}
                    >
                        <img
                            src={botaoPublicar}
                            alt="Publicar"
                            style={{
                                width: "80px",
                                height: "40px",
                            }}
                        />
                    </button>
                )}
            </div>

            {mConfirmacao && (
                <div
                    className="modal-confirmacao"
                    onClick={() => setModalConfirmacao(false)}
                >
                    <div
                        className="modal-conteudo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p>Deseja mesmo publicar este treino?</p>

                        <div className="modal-botoes">
                            <button
                                className="btn-cancelar"
                                onClick={() => setModalConfirmacao(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-confirmar"
                                onClick={publicarTreino}
                            >
                                Publicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TreinoCard;