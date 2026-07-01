import { useState, useEffect } from "react";
import "./modalMedidas.css";
import axios from "axios";

function ModalMedidas({ onClose }) {
    const [medidas, setMedidas] = useState(null);
    const [editando, setEditando] = useState(false);
    const [form, setForm] = useState({});

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchMedidas();
    }, []);

    const fetchMedidas = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8000/medidas",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = response.data;

            if (Array.isArray(data) && data.length > 0) {
                setMedidas(data[0]);
            } else {
                setMedidas(data)
            }
        } catch (error) {
            console.error(error);
        }
    };

    const iniciarEdicao = () => {
        setForm({
            peso: medidas.peso,
            percentual_gordura: medidas.percentual_gordura,
            peito: medidas.peito,
            cintura: medidas.cintura,
            quadril: medidas.quadril,
            braco: medidas.braco,
            antebraco: medidas.antebraco,
            coxa: medidas.coxa,
            panturrilha: medidas.panturrilha,
            data_registro: new Date().toISOString().split("T")[0],
        });

        setEditando(true);
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: Number(e.target.value),
        });
    };

    const salvar = async () => {
        try {
            await axios.post(
                "http://localhost:8000/medidas",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMedidas(form);
            setEditando(false);
        } catch (error) {
            console.error(error);
        }
    };

    const campos = [
        { key: "peso", label: "Peso", unidade: "kg" },
        { key: "percentual_gordura", label: "% Gordura", unidade: "%" },
        { key: "peito", label: "Peito", unidade: "cm" },
        { key: "cintura", label: "Cintura", unidade: "cm" },
        { key: "quadril", label: "Quadril", unidade: "cm" },
        { key: "braco", label: "Braço", unidade: "cm" },
        { key: "antebraco", label: "Antebraço", unidade: "cm" },
        { key: "coxa", label: "Coxa", unidade: "cm" },
        { key: "panturrilha", label: "Panturrilha", unidade: "cm" },
    ];

    return (
        <div className="modal-medidas-overlay" onClick={onClose}>
            <div
                className="modal-medidas-content"
                onClick={(e) => e.stopPropagation()}
            >
                <h2>Medidas</h2>

                {medidas && (
                    <>
                        {campos.map((campo) => (
                            <div
                                className="modal-medidas-row"
                                key={campo.key}
                            >
                                <span>{campo.label}</span>

                                {editando ? (
                                    <input
                                        type="number"
                                        step="0.1"
                                        name={campo.key}
                                        value={form[campo.key]}
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <span>
                                        {medidas[campo.key]} {campo.unidade}
                                    </span>
                                )}
                            </div>
                        ))}

                        {!editando && (
                            <div className="modal-medidas-row">
                                <span>Data</span>
                                <span>
                                    {medidas.data_registro
                                        ? new Date(
                                              medidas.data_registro
                                          ).toLocaleDateString("pt-BR")
                                        : "—"}
                                </span>
                            </div>
                        )}
                    </>
                )}

                <div className="modal-medidas-acoes">
                    {editando ? (
                        <>
                            <button
                                className="btn-editar"
                                onClick={salvar}
                            >
                                Salvar
                            </button>

                            <button
                                className="btn-fechar"
                                onClick={() => setEditando(false)}
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                className="btn-editar"
                                onClick={iniciarEdicao}
                            >
                                Editar
                            </button>

                            <button
                                className="btn-fechar"
                                onClick={onClose}
                            >
                                Fechar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalMedidas;