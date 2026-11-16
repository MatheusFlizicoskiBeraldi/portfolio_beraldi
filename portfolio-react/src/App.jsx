import Cabecalho from './Cabecalho.jsx'
import CardProjeto from './CardProjeto.jsx'

function App() {
  return (
    <>

    <Cabecalho />
    <main>
      <h2> Projetos </h2>
      <div className="cards">
      <CardProjeto
      nome="Portfolio Angular"
      descricao="Meu portfolio com Angular e Angular Material, administado por LOJI-001."
      tecnologias="Angular, TypeScript"
      link_github="https://github.com/MatheusFlizicoskiBeraldi/portfolio_beraldi"
      ano={2026}
      />
      </div>
    </main>
  </>

  );
}

export default App;