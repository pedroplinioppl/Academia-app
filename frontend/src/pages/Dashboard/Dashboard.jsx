import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import Perfil from "./components/Perfil";
import Treinos from "./components/Treinos";
import ModalMedidas from "./components/modalMedidas";
import treinosPublicadosFoto from "../../assets/treinos publicados.png";

function Dashboard() {
    const [mostrarModal, setMostrarModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, []);

    return (
        <div className="dashboard">

            <aside className="sidebar">
                <Perfil />
            </aside>

            <main className="content">
                <Treinos />

            </main>

            <div className="bottom-right-buttons">
                <button
                    className="btn-bottom-right"
                    onClick={() => setMostrarModal(true)}
                >
                    Visualizar medidas
                </button>

                <button className="btn-bottom-right">
                    Visualizar evolução
                </button>
            </div>

            {mostrarModal && (
                <ModalMedidas
                    onClose={() => setMostrarModal(false)}
                />
            )}

            <aside className="sidebar-right">
                <div className="sidebar-card" onClick={() => {
                    navigate("/treinos-publicados")
                }}>
                    <img
                        src={treinosPublicadosFoto}
                        alt="Treinos Publicados"
                        className="sidebar-image"
                    />

                    <h3 className="sidebar-title">
                        Treinos Publicados
                    </h3>
                </div>
            </aside>
        </div>


    );
}

export default Dashboard;