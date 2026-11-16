function CardProjeto({ nome, descricao, tecnologias, link_github, ano}) {
    return(
        <article className="Card">
            <h3>{nome}</h3>
            <p className="meta">{tecnologias} .  {ano} </p>
            <p>{descricao}</p>
            <a href={link_github}> Ver no Github </a>
        </article>
    );
}

export default CardProjeto;