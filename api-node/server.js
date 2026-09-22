const express = require('express');

const app = express();

const cors = require('cors')

const PORTA = 3000;

app.use(cors());

const projetos = [
    {
        id: 1,
        nome: 'Portfolio Angular',
        descricao: 'Meu portfolio com angular e angular material.',
        tecnologias: 'Angular, TypeScript',
        link_github: ' https://github.com/MatheusFlizicoskiBeraldi/portfolio_beraldi ',
        ano: 2026
    },

   {
        id: 2,
        nome: ' ',
        descricao: ' .',
        tecnologias: '',
        link_github:  null,
        ano: 2026
    },

   {
        id: 3,
        nome: '',
        descricao: '',
        tecnologias: ', ',
        link_github: null,
        ano: 2026
    }

];



app.get('/', (req, res) => {
    res.send('API do portfolio em Node: no ar');
});



//app.listen(PORTA, () => {
//    console.log('API no ar em http://localhost:' + PORTA);
//});

app.get('/api/projetos', (req, res) => {
    res.json(projetos);
});


