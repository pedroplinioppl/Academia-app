function TreinoCard({ treino, onClick }) {
    return (
        <div className="treino-card" onClick={onClick}>
            <h3>{treino.nome}</h3>
            <p>{treino.descricao}</p>
        </div>
    );
}

export default TreinoCard;