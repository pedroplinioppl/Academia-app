import { useState, useEffect, useMemo } from "react";
import "./modalEvolucao.css";
import axios from "axios";

const CAMPOS = [
    { chave: "peso", label: "Peso", unidade: "kg", cor: "#3b82f6" },
    { chave: "percentual_gordura", label: "% de gordura", unidade: "%", cor: "#f59e0b" },
    { chave: "panturrilha", label: "Panturrilha", unidade: "cm", cor: "#10b981" },
    { chave: "coxa", label: "Coxa", unidade: "cm", cor: "#8b5cf6" },
    { chave: "quadril", label: "Quadril", unidade: "cm", cor: "#ec4899" },
    { chave: "cintura", label: "Cintura", unidade: "cm", cor: "#06b6d4" },
    { chave: "abdomen", label: "Abdômen", unidade: "cm", cor: "#ef4444" },
    { chave: "peito", label: "Peito", unidade: "cm", cor: "#84cc16" },
    { chave: "ombro", label: "Ombro", unidade: "cm", cor: "#6366f1" },
    { chave: "braco", label: "Braço", unidade: "cm", cor: "#f97316" },
    { chave: "antebraco", label: "Antebraço", unidade: "cm", cor: "#14b8a6" },
];

const LARGURA = 600;
const ALTURA = 260;
const PADDING = { top: 20, right: 20, bottom: 34, left: 46 };

function formatarData(dataStr) {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}`;
}

function modalEvolucao({ onClose }) {
    const [medidas, setMedidas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [modo, setModo] = useState("unico"); // "unico" | "todas"
    const [campoSelecionado, setCampoSelecionado] = useState("peso");
    const [camposAtivos, setCamposAtivos] = useState(CAMPOS.map((c) => c.chave));
    const token = localStorage.getItem("token");

    useEffect(() => {
        const buscarMedidas = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:8000/medidas",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMedidas(res.data);
            } catch (err) {
                console.log(err);
            } finally {
                setCarregando(false);
            }
        };

        buscarMedidas();
    }, []);

    const sortedMedidas = useMemo(() => {
        return [...medidas].sort(
            (a, b) => new Date(a.data_registro) - new Date(b.data_registro)
        );
    }, [medidas]);

    const alternarCampo = (chave) => {
        setCamposAtivos((atuais) =>
            atuais.includes(chave)
                ? atuais.filter((c) => c !== chave)
                : [...atuais, chave]
        );
    };

    // ---------- MODO: UMA MEDIDA (valores absolutos) ----------

    const campoAtual = CAMPOS.find((c) => c.chave === campoSelecionado);

    const pontosUnico = useMemo(() => {
        return sortedMedidas
            .filter((m) => m[campoSelecionado] !== null && m[campoSelecionado] !== undefined)
            .map((m) => ({ data: m.data_registro, valor: m[campoSelecionado] }));
    }, [sortedMedidas, campoSelecionado]);

    const graficoUnico = useMemo(() => {
        if (pontosUnico.length === 0) return null;

        const valores = pontosUnico.map((p) => p.valor);
        const valorMin = Math.min(...valores);
        const valorMax = Math.max(...valores);
        const folga = (valorMax - valorMin) * 0.15 || 1;
        const escalaMin = valorMin - folga;
        const escalaMax = valorMax + folga;

        const largurableUtil = LARGURA - PADDING.left - PADDING.right;
        const alturaUtil = ALTURA - PADDING.top - PADDING.bottom;

        const coordX = (i) =>
            pontosUnico.length === 1
                ? PADDING.left + largurableUtil / 2
                : PADDING.left + (i / (pontosUnico.length - 1)) * largurableUtil;

        const coordY = (valor) =>
            PADDING.top + alturaUtil - ((valor - escalaMin) / (escalaMax - escalaMin)) * alturaUtil;

        const coordenadas = pontosUnico.map((p, i) => ({ x: coordX(i), y: coordY(p.valor), ...p }));
        const linha = coordenadas.map((c) => `${c.x},${c.y}`).join(" ");

        return { coordenadas, linha, escalaMin, escalaMax };
    }, [pontosUnico]);

    // ---------- MODO: TODAS JUNTAS (normalizado, % de variação) ----------

    const linhasTodas = useMemo(() => {
        if (sortedMedidas.length === 0) return [];

        return CAMPOS.filter((c) => camposAtivos.includes(c.chave))
            .map((c) => {
                const pts = sortedMedidas
                    .map((m, i) => ({ i, valor: m[c.chave] }))
                    .filter((p) => p.valor !== null && p.valor !== undefined);

                if (pts.length === 0) return null;

                const base = pts[0].valor;
                const normalizados = pts.map((p) => ({
                    i: p.i,
                    valor: p.valor,
                    norm: base !== 0 ? ((p.valor - base) / base) * 100 : p.valor - base,
                }));

                return { chave: c.chave, label: c.label, cor: c.cor, pontos: normalizados };
            })
            .filter(Boolean);
    }, [sortedMedidas, camposAtivos]);

    const graficoTodas = useMemo(() => {
        if (linhasTodas.length === 0 || sortedMedidas.length === 0) return null;

        const todosNormalizados = linhasTodas.flatMap((l) => l.pontos.map((p) => p.norm));
        const valorMin = Math.min(...todosNormalizados, 0);
        const valorMax = Math.max(...todosNormalizados, 0);
        const folga = (valorMax - valorMin) * 0.15 || 5;
        const escalaMin = valorMin - folga;
        const escalaMax = valorMax + folga;

        const largurableUtil = LARGURA - PADDING.left - PADDING.right;
        const alturaUtil = ALTURA - PADDING.top - PADDING.bottom;
        const totalPontosX = sortedMedidas.length - 1 || 1;

        const coordX = (i) => PADDING.left + (i / totalPontosX) * largurableUtil;
        const coordY = (valor) =>
            PADDING.top + alturaUtil - ((valor - escalaMin) / (escalaMax - escalaMin)) * alturaUtil;

        const linhasComCoords = linhasTodas.map((l) => ({
            ...l,
            linha: l.pontos.map((p) => `${coordX(p.i)},${coordY(p.norm)}`).join(" "),
            coordenadas: l.pontos.map((p) => ({ x: coordX(p.i), y: coordY(p.norm), ...p })),
        }));

        // Rótulos de data no eixo X (evita poluir se houver muitos registros)
        const passo = Math.max(1, Math.ceil(sortedMedidas.length / 8));
        const rotulosX = sortedMedidas
            .map((m, i) => ({ i, data: m.data_registro }))
            .filter((_, i) => i % passo === 0 || i === sortedMedidas.length - 1);

        return { linhasComCoords, escalaMin, escalaMax, coordX, rotulosX };
    }, [linhasTodas, sortedMedidas]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-evolucao" onClick={(e) => e.stopPropagation()}>
                <div className="modal-evolucao-header">
                    <h2>Evolução</h2>
                    <button className="modal-fechar" onClick={onClose} aria-label="Fechar">
                        ✕
                    </button>
                </div>

                <div className="modal-evolucao-modos">
                    <button
                        className={`modo-btn ${modo === "unico" ? "ativo" : ""}`}
                        onClick={() => setModo("unico")}
                    >
                        Uma medida
                    </button>
                    <button
                        className={`modo-btn ${modo === "todas" ? "ativo" : ""}`}
                        onClick={() => setModo("todas")}
                    >
                        Todas juntas
                    </button>
                </div>

                {modo === "unico" && (
                    <select
                        className="modal-evolucao-select"
                        value={campoSelecionado}
                        onChange={(e) => setCampoSelecionado(e.target.value)}
                    >
                        {CAMPOS.map((c) => (
                            <option key={c.chave} value={c.chave}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                )}

                {carregando && <p className="modal-evolucao-mensagem">Carregando...</p>}

                {!carregando && medidas.length === 0 && (
                    <p className="modal-evolucao-mensagem">Nenhuma medida registrada ainda.</p>
                )}

                {/* ---------- GRÁFICO: UMA MEDIDA ---------- */}

                {!carregando && medidas.length > 0 && modo === "unico" && (
                    <>
                        {!graficoUnico && (
                            <p className="modal-evolucao-mensagem">
                                Nenhum registro de {campoAtual.label.toLowerCase()} ainda.
                            </p>
                        )}

                        {graficoUnico && (
                            <>
                                <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="modal-evolucao-svg">
                                    <text x={PADDING.left - 10} y={PADDING.top + 4} className="eixo-label" textAnchor="end">
                                        {graficoUnico.escalaMax.toFixed(1)}
                                    </text>
                                    <text x={PADDING.left - 10} y={ALTURA - PADDING.bottom + 4} className="eixo-label" textAnchor="end">
                                        {graficoUnico.escalaMin.toFixed(1)}
                                    </text>

                                    <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={ALTURA - PADDING.bottom} className="eixo-linha" />
                                    <line x1={PADDING.left} y1={ALTURA - PADDING.bottom} x2={LARGURA - PADDING.right} y2={ALTURA - PADDING.bottom} className="eixo-linha" />

                                    <polyline points={graficoUnico.linha} className="grafico-linha" style={{ stroke: campoAtual.cor }} />

                                    {graficoUnico.coordenadas.map((c, i) => (
                                        <g key={i}>
                                            <circle cx={c.x} cy={c.y} r="4" className="grafico-ponto" style={{ stroke: campoAtual.cor }} />
                                            <text x={c.x} y={ALTURA - PADDING.bottom + 18} className="eixo-label" textAnchor="middle">
                                                {formatarData(c.data)}
                                            </text>
                                        </g>
                                    ))}
                                </svg>

                                <p className="modal-evolucao-unidade">Valores em {campoAtual.unidade}</p>
                            </>
                        )}
                    </>
                )}

                {/* ---------- GRÁFICO: TODAS JUNTAS ---------- */}

                {!carregando && medidas.length > 0 && modo === "todas" && (
                    <>
                        {!graficoTodas && (
                            <p className="modal-evolucao-mensagem">
                                Selecione ao menos uma medida na legenda abaixo.
                            </p>
                        )}

                        {graficoTodas && (
                            <>
                                <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} className="modal-evolucao-svg">
                                    <text x={PADDING.left - 10} y={PADDING.top + 4} className="eixo-label" textAnchor="end">
                                        {graficoTodas.escalaMax.toFixed(0)}%
                                    </text>
                                    <text x={PADDING.left - 10} y={ALTURA - PADDING.bottom + 4} className="eixo-label" textAnchor="end">
                                        {graficoTodas.escalaMin.toFixed(0)}%
                                    </text>

                                    <line x1={PADDING.left} y1={PADDING.top} x2={PADDING.left} y2={ALTURA - PADDING.bottom} className="eixo-linha" />
                                    <line x1={PADDING.left} y1={ALTURA - PADDING.bottom} x2={LARGURA - PADDING.right} y2={ALTURA - PADDING.bottom} className="eixo-linha" />

                                    {graficoTodas.linhasComCoords.map((l) => (
                                        <g key={l.chave}>
                                            <polyline points={l.linha} className="grafico-linha" style={{ stroke: l.cor }} />
                                            {l.coordenadas.map((c, i) => (
                                                <circle key={i} cx={c.x} cy={c.y} r="3.5" className="grafico-ponto" style={{ stroke: l.cor }} />
                                            ))}
                                        </g>
                                    ))}

                                    {graficoTodas.rotulosX.map((r) => (
                                        <text key={r.i} x={graficoTodas.coordX(r.i)} y={ALTURA - PADDING.bottom + 18} className="eixo-label" textAnchor="middle">
                                            {formatarData(r.data)}
                                        </text>
                                    ))}
                                </svg>

                                <p className="modal-evolucao-unidade">
                                    % de variação desde o primeiro registro de cada medida
                                </p>
                            </>
                        )}

                        <div className="modal-evolucao-legenda">
                            {CAMPOS.map((c) => (
                                <button
                                    key={c.chave}
                                    className={`legenda-item ${camposAtivos.includes(c.chave) ? "" : "inativo"}`}
                                    onClick={() => alternarCampo(c.chave)}
                                >
                                    <span className="legenda-cor" style={{ background: c.cor }} />
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default modalEvolucao;