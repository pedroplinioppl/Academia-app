import "./TreinoPublicadoCard.css";

const AVATAR_BASE_URL = "http://localhost:8000"; // ajuste se o avatar vier com outra base

function TreinoPublicadoCard({ treino, onClick }) {
    const avatarSrc = treino.autor?.avatar
        ? `${AVATAR_BASE_URL}/uploads/${treino.autor.avatar}`
        : null;

    return (
        <div className="treino-publicado-card clicavel" onClick={onClick}>
            <div className="treino-publicado-conteudo">
                <h3>{treino.nome}</h3>
                <p>{treino.descricao}</p>
            </div>

            <div className="treino-publicado-autor">
                {avatarSrc ? (
                    <img
                        src={avatarSrc}
                        alt={treino.autor.nome}
                        className="autor-avatar"
                    />
                ) : (
                    <div className="autor-avatar autor-avatar-placeholder">
                        {treino.autor?.nome?.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="autor-nome">{treino.autor?.nome}</span>
            </div>
        </div>
    );
}

export default TreinoPublicadoCard;