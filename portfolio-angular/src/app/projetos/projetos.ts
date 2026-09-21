import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ProjetoService, Projeto } from '../projeto.service';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-projetos',
  imports: [MatCardModule, MatButtonModule],
  templateUrl: './projetos.html',
})
export class Projetos implements OnInit {
  private service = inject(ProjetoService);
  projetos: Projeto[] = [];
  carregando = true;
  erro = '';

  ngOnInit() {
    this.service.listar().subscribe({
      next: (lista) => { this.projetos = lista; this.carregando = false; },
      error: (err) => { this.erro = 'Falha ao carregar projeto.'; this.carregando = false; }
    });
  }
}
