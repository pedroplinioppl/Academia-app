import { useState, useEffect } from "react";
import "./TreinoDetalhe.css";
import axios from "axios";

function TreinoDetalhe({ treino, voltar }) {

    const [editando, setEditando] = useState(false);

    const [nome, setNome] = useState(treino.nome);
    const [nomeDraft, setNomeDraft] = useState(treino.nome);

    const [descricao, setDescricao] = useState(treino.descricao || "");
    const [descricaoDraft, setDescricaoDraft] = useState(treino.descricao || "");

    const [dias, setDias] = useState(treino.dias || []);
    const [diasDraft, setDiasDraft] = useState(treino.dias || []);

    const [exercicios, setExercicios] = useState([]);

    const [modalNovoExercicio, setModalNovoExercicio] = useState(false);

    const [exercicioDetalhe, setExercicioDetalhe] = useState(null);
    const [modalExercicioDetalhe, setModalExercicioDetalhe] = useState(false);
    const [exercicioDraft, setExercicioDraft] = useState(null);
    const [editandoExercicio, setEditandoExercicio] = useState(false);
    // exercício

    const [nomeExercicio, setNomeExercicio] = useState("");
    const [exercicioDescricao, setExercicioDescricao] = useState("");
    const [exercicioSeries, setExercicioSeries] = useState("");
    const [exercicioRepeticoes, setExercicioRepeticoes] = useState("");
    const [selectedGrupo, setSelectedGrupo] = useState("");

    const gruposMusculares = [
        "Peito",
        "Costas",
        "Ombros",
        "Bíceps",
        "Tríceps",
        "Antebraço",
        "Quadríceps",
        "Posterior",
        "Glúteos",
        "Panturrilha",
        "Abdômen"
    ];

    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    useEffect(() => {
        const token = localStorage.getItem("token");

        axios
            .get(
                `http://localhost:8000/treinos/${treino.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => {
                setNome(res.data.nome);
                setDescricao(res.data.descricao || "");
                setDias(res.data.dias || []);

                setNomeDraft(res.data.nome);
                setDescricaoDraft(res.data.descricao || "");
                setDiasDraft(res.data.dias || []);

                setExercicios(res.data.exercicios || []);
            })
            .catch((err) => {
                console.error(err);
                alert("Nao foi possível carregar o treino");
            })


    }, [treino.id]);
    function entrarEdicao() {
        setNomeDraft(nome);
        setDescricaoDraft(descricao);
        setDiasDraft([...dias]);
        setEditando(true);
    }

    function toggleDiaDraft(dia) {
        setDiasDraft(prev =>
            prev.includes(dia)
                ? prev.filter(d => d !== dia)
                : [...prev, dia]
        );
    }

    function salvarExercicio() {
        const token = localStorage.getItem("token");

        axios.put(
            `http://localhost:8000/treinos/${treino.id}/exercicios/${exercicioDraft.id}`,
            {
                nome: exercicioDraft.exercicio.nome,
                descricao: exercicioDraft.exercicio.descricao,
                grupo_muscular: exercicioDraft.exercicio.grupo_muscular,
                series: exercicioDraft.series,
                repeticoes: exercicioDraft.repeticoes
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
            .then(res => {
                setExercicios(prev => prev.map(ex => ex.id === res.data.id ? res.data : ex));
                setEditandoExercicio(false);
                setModalExercicioDetalhe(false);
            })
            .catch(err => {
                console.error(err);
                alert("Não foi possível atualizar o exercício.");
            });
    }

    async function salvar() {
        const token = localStorage.getItem("token");

        try {
            const res = await axios.put(
                `http://localhost:8000/treinos/${treino.id}`,
                {
                    nome: nomeDraft,
                    descricao: descricaoDraft,
                    dias: diasDraft
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Atualiza os estados com o retorno da API
            setNome(nomeDraft);
            setDescricao(descricaoDraft);
            setDias(diasDraft);

            setEditando(false);

            alert("Treino atualizado com sucesso!");
        } catch (err) {
            console.error(err);
            alert("Não foi possível atualizar o treino.");
        }
    }

    function cancelar() {
        setEditando(false);
    }

    async function criarExercicio() {
        const token = localStorage.getItem("token");

        try {
            const res = await axios.post(
                `http://localhost:8000/treinos/${treino.id}/exercicios`,
                {
                    nome: nomeExercicio,
                    descricao: exercicioDescricao,
                    series: exercicioSeries,
                    repeticoes: exercicioRepeticoes,
                    grupo_muscular: selectedGrupo
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // adiciona o novo exercício à lista de exercícios
            setExercicios(prev => [...prev, res.data]);

            setModalNovoExercicio(false);
            setNomeExercicio("");
            setExercicioDescricao("");
            setSelectedGrupo("");
            setExercicioSeries("");
            setExercicioRepeticoes("");

        } catch (err) {
            console.error(err);
            alert("Erro ao criar exercício.");
        }
    }

    return (
        <div className="treino-detalhe">

            <div className="cabecalho">
                <div className="dados">
                    {editando ? (
                        <input
                            className="nome-input editando"
                            value={nomeDraft}
                            onChange={e => setNomeDraft(e.target.value)}
                        />
                    ) : (
                        <h1 className="nome-view">{nome}</h1>
                    )}

                    {editando ? (
                        <textarea
                            className="descricao-input"
                            value={descricaoDraft}
                            placeholder="Descrição do treino"
                            onChange={e => setDescricaoDraft(e.target.value)}
                        />
                    ) : (
                        <p className="descricao-view">
                            {descricao || <span className="descricao-vazia">Sem descrição</span>}
                        </p>
                    )}
                </div>

                <div className="dias-container">
                    <span className="dias-label">Dias</span>
                    <div className="dias">
                        {diasSemana.map(dia => {
                            const ativo = editando
                                ? diasDraft.includes(dia)
                                : dias.includes(dia);
                            return (
                                <button
                                    key={dia}
                                    className={`dia${ativo ? " ativo" : ""}${editando ? " clicavel" : ""}`}
                                    onClick={() => editando && toggleDiaDraft(dia)}
                                    tabIndex={editando ? 0 : -1}
                                >
                                    {dia}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="divisor" />

            <div className="lista-exercicios">
                {exercicios.map(exercicio => (
                    <div key={exercicio.id} className="exercicio-card clicavel" onClick={() => {
                        setExercicioDetalhe(exercicio);
                        setExercicioDraft(exercicio);
                        setModalExercicioDetalhe(true);
                    }}>
                        <span className="exercicio-nome">
                            {exercicio.exercicio.nome}
                        </span>

                        <span className="exercicio-series">
                            {exercicio.series}×{exercicio.repeticoes}
                        </span>
                    </div>
                ))}
            </div>

            {modalExercicioDetalhe && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Detalhes do Exercício</h2>

                        {editandoExercicio ? (
                            <>
                                <label>Nome</label>
                                <input
                                    type="text"
                                    value={exercicioDraft.exercicio.nome}
                                    onChange={(e) =>
                                        setExercicioDraft({
                                            ...exercicioDraft,
                                            exercicio: {
                                                ...exercicioDraft.exercicio,
                                                nome: e.target.value
                                            }
                                        })
                                    }
                                />

                                <label>Descrição</label>
                                <textarea
                                    value={exercicioDraft.exercicio.descricao}
                                    onChange={(e) =>
                                        setExercicioDraft({
                                            ...exercicioDraft,
                                            exercicio: {
                                                ...exercicioDraft.exercicio,
                                                descricao: e.target.value
                                            }
                                        })
                                    }
                                />

                                <label>Grupo Muscular</label>
                                <select
                                    value={exercicioDraft.exercicio.grupo_muscular}
                                    onChange={(e) =>
                                        setExercicioDraft({
                                            ...exercicioDraft,
                                            exercicio: {
                                                ...exercicioDraft.exercicio,
                                                grupo_muscular: e.target.value
                                            }
                                        })
                                    }
                                >
                                    {gruposMusculares.map(grupo => (
                                        <option key={grupo} value={grupo}>
                                            {grupo}
                                        </option>
                                    ))}
                                </select>

                                <label>Séries</label>
                                <input
                                    type="number"
                                    value={exercicioDraft.series}
                                    onChange={(e) =>
                                        setExercicioDraft({
                                            ...exercicioDraft,
                                            series: Number(e.target.value)
                                        })
                                    }
                                />

                                <label>Repetições</label>
                                <input
                                    type="number"
                                    value={exercicioDraft.repeticoes}
                                    onChange={(e) =>
                                        setExercicioDraft({
                                            ...exercicioDraft,
                                            repeticoes: Number(e.target.value)
                                        })
                                    }
                                />

                                <div className="modal-botoes">
                                    <button
                                        className="btn-salvar"
                                        onClick={() => {
                                            salvarExercicio();
                                            setEditandoExercicio(false);
                                            setModalExercicioDetalhe(false);
                                        }}
                                    >
                                        Salvar
                                    </button>

                                    <button
                                        className="btn-cancelar"
                                        onClick={() => {
                                            setExercicioDraft(exercicioDetalhe);
                                            setEditandoExercicio(false);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
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
                                </div>

                                <button
                                    className="btn-editar"
                                    onClick={() => setEditandoExercicio(true)}
                                >
                                    Editar
                                </button>

                                <button
                                    className="btn-fechar"
                                    onClick={() => {
                                        setModalExercicioDetalhe(false);
                                        setEditandoExercicio(false);
                                    }}
                                >
                                    Fechar
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {editando && (
                <button className="btn-adicionar" onClick={() => setModalNovoExercicio(true)}>
                    + Adicionar exercício
                </button>
            )}

            {modalNovoExercicio && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Criar Exercicio</h2>

                        <input
                            type="text"
                            placeholder="Nome do ex."
                            value={nomeExercicio}
                            onChange={(e) => setNomeExercicio(e.target.value)}
                        />

                        <textarea
                            placeholder="Descrição"
                            value={exercicioDescricao}
                            onChange={(e) => setExercicioDescricao(e.target.value)}
                        />

                        <select
                            value={selectedGrupo}
                            onChange={(e) => setSelectedGrupo(e.target.value)}
                        >
                            <option value="">
                                Grupo Muscular
                            </option>

                            {
                                gruposMusculares.map(grupo => (
                                    <option
                                        key={grupo}
                                        value={grupo}
                                    >
                                        {grupo}
                                    </option>
                                ))
                            }
                        </select>

                        <input
                            placeholder="Séries"
                            value={exercicioSeries}
                            onChange={(e) => setExercicioSeries(e.target.value)}
                        />

                        <input
                            placeholder="Repetições"
                            value={exercicioRepeticoes}
                            onChange={(e) => setExercicioRepeticoes(e.target.value)}
                        />


                        <div className="botoes">
                            <button
                                onClick={() => {
                                    setModalNovoExercicio(false);
                                    setNomeExercicio("");
                                    setExercicioDescricao("");
                                    setSelectedGrupo("");
                                    setExercicioSeries("");
                                    setExercicioRepeticoes("");
                                }}
                            >
                                Cancelar
                            </button>

                            <button onClick={criarExercicio}>
                                Criar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="acoes">
                <button className="btn-apagar">Apagar</button>
                <div className="acoes-direita">
                    {editando ? (
                        <>
                            <button className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                            <button className="btn-salvar" onClick={salvar}>Salvar</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-voltar" onClick={voltar}>Voltar</button>
                            <button className="btn-editar" onClick={entrarEdicao}>Editar</button>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
}

export default TreinoDetalhe;