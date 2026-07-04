import { useState, useEffect } from "react";
import axios from "axios";
import "./TreinoDetalhe.css";
import ExercicioCard from "../Dashboard/components/ExercicioCard";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function ModalTreinoPublicado({ isOpen, treinoPublicado, voltar, onCopiar }) {

    const autor = treinoPublicado?.autor;

    // nome/descrição já vêm na listagem, mas dias e exercícios não —
    // então esses dois começam vazios e são preenchidos pelo GET abaixo
    const [dias, setDias] = useState([]);
    const [exercicios, setExercicios] = useState([]);
    const [carregando, setCarregando] = useState(true);

    const [copiando, setCopiando] = useState(false);

    const [exercicioDetalhe, setExercicioDetalhe] = useState(null);
    const [modalExercicioDetalhe, setModalExercicioDetalhe] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        if (!isOpen || !treinoPublicado?.treino_id) return;

        const token = localStorage.getItem("token");
        setCarregando(true);

        axios
            .get(`http://localhost:8000/treinos/${treinoPublicado.treino_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setDias(res.data.dias || []);
                setExercicios(res.data.exercicios || []);
            })
            .catch((err) => {
                console.error(err);
                alert("Não foi possível carregar o treino.");
            })
            .finally(() => setCarregando(false));
    }, [isOpen, treinoPublicado?.treino_id]);

    async function copiarTreino() {
        const token = localStorage.getItem("token");
        setCopiando(true);

        try {
            // cria o novo treino do usuário logado, mesmo endpoint usado
            // pra criar um treino normal, só que com "cópia" no nome
            const resTreino = await axios.post(
                "http://localhost:8000/treinos",
                {
                    nome: `${treinoPublicado.nome} cópia`,
                    descricao: treinoPublicado.descricao,
                    dias,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const novoTreino = resTreino.data;

            // replica cada exercício no treino recém-criado
            for (const exercicio of exercicios) {
                await axios.post(
                    `http://localhost:8000/treinos/${novoTreino.id}/exercicios`,
                    {
                        nome: exercicio.exercicio.nome,
                        descricao: exercicio.exercicio.descricao,
                        grupo_muscular: exercicio.exercicio.grupo_muscular,
                        series: exercicio.series,
                        repeticoes: exercicio.repeticoes,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            alert("Treino copiado para a sua lista!");
            onCopiar?.(novoTreino);
        } catch (err) {
            console.error(err);
            alert("Não foi possível copiar o treino.");
        } finally {
            setCopiando(false);
        }
    }

    function formatarData(dataString) {
        if (!dataString) return "";
        return new Date(dataString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    if (!isOpen || !treinoPublicado) return null;

    const avatarUrl = autor?.avatar
        ? `http://localhost:8000/uploads/${autor.avatar}`
        : null;

    return (
        <div className="modal-overlay">
            <div className="modal modal-treino-publicado">
                <div className="treino-detalhe">

                    <div className="autor-row">
                        {avatarUrl ? (
                            <img
                                className="autor-avatar"
                                src={avatarUrl}
                                alt={autor?.nome || "Autor"}
                            />
                        ) : (
                            <div className="autor-avatar autor-avatar-placeholder">
                                {(autor?.nome || "?").charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="autor-info">
                            <span className="autor-nome">{autor?.nome || "Usuário"}</span>
                            <span className="autor-label">
                                Publicado em {formatarData(treinoPublicado?.data_publicacao)}
                            </span>
                        </div>
                    </div>

                    <div className="cabecalho">
                        <div className="dados">
                            <h1 className="nome-view">{treinoPublicado.nome}</h1>
                            <p className="descricao-view">
                                {treinoPublicado.descricao || <span className="descricao-vazia">Sem descrição</span>}
                            </p>
                        </div>

                        <div className="dias-container">
                            <span className="dias-label">Dias</span>
                            <div className="dias">
                                {diasSemana.map((dia) => (
                                    <span
                                        key={dia}
                                        className={`dia${dias.includes(dia) ? " ativo" : ""}`}
                                    >
                                        {dia}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="divisor" />

                    {carregando ? (
                        <p className="descricao-vazia">Carregando exercícios...</p>
                    ) : (
                        <div className="lista-exercicios">
                            <DndContext sensors={sensors} collisionDetection={closestCenter}>
                                <SortableContext
                                    items={exercicios.map((e) => e.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {exercicios.map((exercicio) => (
                                        <ExercicioCard
                                            key={exercicio.id}
                                            exercicio={exercicio}
                                            editando={false}
                                            onClick={() => {
                                                setExercicioDetalhe(exercicio);
                                                setModalExercicioDetalhe(true);
                                            }}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}

                    {modalExercicioDetalhe && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Detalhes do Exercício</h2>

                                <div className="exercicio-info">
                                    <div className="info-row">
                                        <span className="info-label">Nome</span>
                                        <span className="info-valor">{exercicioDetalhe?.exercicio?.nome}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Descrição</span>
                                        <span className="info-valor">{exercicioDetalhe?.exercicio?.descricao || "—"}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Grupo Muscular</span>
                                        <span className="info-valor">{exercicioDetalhe?.exercicio?.grupo_muscular}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Séries</span>
                                        <span className="info-valor">{exercicioDetalhe?.series}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Repetições</span>
                                        <span className="info-valor">{exercicioDetalhe?.repeticoes}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Peso</span>
                                        <span className="info-valor">{exercicioDetalhe?.peso}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn-fechar"
                                    onClick={() => setModalExercicioDetalhe(false)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="acoes">
                        <button className="btn-voltar" onClick={voltar}>Voltar</button>
                        <button
                            className="btn-copiar"
                            onClick={copiarTreino}
                            disabled={copiando || carregando}
                        >
                            {copiando ? "Copiando..." : "Copiar treino"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default ModalTreinoPublicado;