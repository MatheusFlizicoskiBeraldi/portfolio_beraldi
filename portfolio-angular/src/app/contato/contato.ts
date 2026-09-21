import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-contato',
  templateUrl: './contato.html', // Verifique se o nome do seu arquivo HTML é exatamente este
  styleUrl: './contato.css'      // Verifique se o nome do seu arquivo CSS é exatamente este
})
export class ContatoComponent implements AfterViewInit {
  // Captura o canvas do HTML usando a referência #meuCanvas
  @ViewChild('meuCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    this.desenharImagem();
  }

  desenharImagem(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const img = new Image();
      // Aponta para a imagem salva na pasta public (a barra inicial '/' aponta para a raiz do public)
      img.src = '/loji.png';

      img.onload = () => {
        // Ajuste estes valores de acordo com o tamanho que você quer que o canvas tenha
        canvas.width = 400; 
        canvas.height = 500; 
        
        // Desenha a imagem cobrindo a área definida
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }
}