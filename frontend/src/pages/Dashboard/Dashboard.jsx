import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";
import Perfil from "./components/Perfil";
import Treinos from "./components/Treinos";

function Dashboard() {

    return (
        <div className="dashboard">

            <aside className="sidebar">
                <Perfil />
            </aside>

            <main className="content">
                <Treinos />

                <div className="bottom-right-buttons">
                    <button className="btn-bottom-right">
                        Visualizar medidas
                    </button>

                    <button className="btn-bottom-right">
                        Visualizar evolução
                    </button>
                </div>
            </main>

        </div>
    );
}

export default Dashboard;