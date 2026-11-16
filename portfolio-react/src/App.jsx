
import Cabecalho from './Cabecalho.jsx';
import CardProjeto from './CardProjeto.jsx';
import Rodape from './Rodape.jsx';

// App: o componente raiz. Ele monta a pagina com os outros componentes.
function App() {
  return (
    <>
      <Cabecalho />
      <main>
        <h2>Projetos</h2>
        <div className="cards">
          <CardProjeto
            nome="Portfolio Angular"
            descricao="Meu portfolio com Angular e Angular Material."
            tecnologias="Angular, TypeScript"
            link_github="https://github.com/seu-usuario/2026-DWII-portfolio-an"
            ano={2026}
          />
          <CardProjeto
            nome="API do Portfolio em PHP"
            descricao="Endpoints de projetos e catalogo com PDO e MariaDB."
            tecnologias="PHP, MariaDB"
            link_github={null}
            ano={2026}
          />
          <CardProjeto
            nome="Sistema de Cadastro v1"
            descricao="CRUD em PHP do 1o trimestre."
            tecnologias="PHP, MariaDB, Bootstrap"
            link_github={null}
            ano={2026}
          />
        </div>
      </main>
      <Rodape />
    </>
  );
}

export default App;