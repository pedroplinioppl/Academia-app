import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Dashboard.css";

function Perfil({
}) {
    const navigate = useNavigate();

    const [perfil, setPerfil] = useState(null);
    const [formData, setFormData] = useState(null);
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editando, setEditando] = useState(false);

    useEffect(() => { // GET perfil
        const token = localStorage.getItem("token");

        axios.get("http://localhost:8000/perfil", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => {
                setPerfil(res.data);
                setFormData(res.data);
            })
            .catch(() => {
                navigate("/");
            });
    }, [navigate]);

    const handleEditar = async () => {

        const token = localStorage.getItem("token");

        if (!editando) {
            setEditando(true);
            return;
        }

        try {

            await axios.put(
                "http://localhost:8000/perfil",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (avatar) {

                const dados = new FormData();

                dados.append("file", avatar);

                await axios.post(
                    "http://localhost:8000/perfil/avatar",
                    dados,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            }

            const atualizado = await axios.get(
                "http://localhost:8000/perfil",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setPerfil(atualizado.data);
            setFormData(atualizado.data);

            setEditando(false);

        } catch (error) {
            console.error(error);
        }
    };

    if (!perfil) {
        return <p>Carregando...</p>;
    }

    return (
        <>
            <div className="avatar">

                <img
                    src={
                        preview
                            ? preview
                            : perfil.avatar
                                ? `http://localhost:8000/uploads/${perfil.avatar}`
                                : "/default-avatar.png"
                    }
                    alt="Avatar"
                />

                {editando && (
                    <label className="upload-btn">
                        Alterar Foto

                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                                const file = e.target.files[0];

                                if (!file) return;

                                setAvatar(file);
                                setPreview(URL.createObjectURL(file));
                            }}
                        />
                    </label>
                )}

            </div>

            {editando ? (
                <input
                    className="edit-input"
                    type="text"
                    value={formData.nome || ""}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            nome: e.target.value
                        })
                    }
                />
            ) : (
                <h2>{perfil.nome}</h2>
            )}

            <div className="info">

                <p>
                    <strong>Altura</strong>

                    {editando ? (
                        <input
                            className="edit-input"
                            type="number"
                            value={formData.altura || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    altura: e.target.value
                                })
                            }
                        />
                    ) : (
                        <> {perfil.altura} cm</>
                    )}
                </p>

                <p>
                    <strong>Objetivo</strong>

                    {editando ? (
                        <input
                            className="edit-input"
                            type="text"
                            value={formData.objetivo || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    objetivo: e.target.value
                                })
                            }
                        />
                    ) : (
                        <> {perfil.objetivo}</>
                    )}
                </p>

                <p>
                    <strong>Sexo</strong>

                    {editando ? (
                        <input
                            className="edit-input"
                            type="text"
                            value={formData.sexo || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    sexo: e.target.value
                                })
                            }
                        />
                    ) : (
                        <> {perfil.sexo}</>
                    )}
                </p>

                <p>
                    <strong>Nascimento</strong>

                    {editando ? (
                        <input
                            type="date"
                            value={formData.data_nascimento || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    data_nascimento: e.target.value
                                })
                            }
                        />
                    ) : (
                        <> {perfil.data_nascimento}</>
                    )}
                </p>

            </div>

            <button onClick={handleEditar}>
                {editando ? "Confirmar Edições" : "Editar Perfil"}
            </button>

            <button className="btn btn-leave" onClick={() => {
                localStorage.removeItem("token");
                navigate("/");
            }}>
                Sair
            </button>
        </>
    );
}

export default Perfil;