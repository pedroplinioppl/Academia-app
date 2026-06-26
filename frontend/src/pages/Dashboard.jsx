import "./Dashboard.css";

function Dashboard() {
    return (
        <div className="dashboard">

            <aside className="sidebar">

                <div className="avatar">
                    <img
                        src="https://placehold.co/140x140"
                        alt="Avatar"
                    />
                </div>

                <h2>Pedro Henrique</h2>

                <div className="info">

                    <p><strong>📏 Altura:</strong> --</p>

                    <p><strong>🎯 Objetivo:</strong> --</p>

                    <p><strong>⚧ Sexo:</strong> --</p>

                    <p><strong>🎂 Nascimento:</strong> --</p>

                </div>

                <button>
                    Editar Perfil
                </button>

            </aside>

            <main className="content">

                <h1>Meus Treinos</h1>

                <p>
                    Nenhum treino cadastrado ainda.
                </p>

            </main>

        </div>
    );
}

export default Dashboard;