import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { Sobre } from './sobre/sobre';
import { Projetos } from './projetos/projetos';
import { ContatoComponent } from './contato/contato';

export const routes: Routes = [
    { path: '', component: HomeComponent}, 
    { path: 'sobre', component: Sobre}, 
    { path: 'projetos', component: Projetos}, 
    { path: 'contato', component: ContatoComponent}, 
       
];