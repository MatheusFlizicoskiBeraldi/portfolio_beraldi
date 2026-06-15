import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [],
  templateUrl: './sobre.html',
  styleUrl: './sobre.css',
})
export class Sobre implements AfterViewInit {
  @ViewChild('meuCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particlesArray: Particle[] = [];
  private mouse = { x: 0, y: 0, radius: 40 }; // Radius é a área de efeito do mouse

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Define o tamanho do canvas
    canvas.width = 780;
    canvas.height = 150;

    this.initEffect(canvas);
    this.animate();
  }

  // Captura o movimento do mouse sobre o canvas
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  // Reseta o mouse quando ele sai do canvas
  @HostListener('mouseleave')
  onMouseLeave() {
    this.mouse.x = -1000;
    this.mouse.y = -1000;
  }

  private initEffect(canvas: HTMLCanvasElement) {
    this.particlesArray = [];
    
    // Desenha o texto temporariamente para ler os pixels
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 65px Gothic Unicode';
    this.ctx.fillText('MATHEUS F. B', 10, 80);

    // Lê os dados dos pixels da área desenhada
    const textCoordinates = this.ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Cria partículas apenas onde há cor (texto)
    for (let y = 0, y2 = textCoordinates.height; y < y2; y += 2) {
      for (let x = 0, x2 = textCoordinates.width; x < x2; x += 2) {
        // Checa a opacidade do pixel (se for maior que 128, faz parte do texto)
        if (textCoordinates.data[(y * 4 * textCoordinates.width) + (x * 4) + 3] > 128) {
          let positionX = x;
          let positionY = y;
          this.particlesArray.push(new Particle(positionX, positionY, this.ctx, this.mouse));
        }
      }
    }
  }

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    
    for (let i = 0; i < this.particlesArray.length; i++) {
      this.particlesArray[i].update();
      this.particlesArray[i].draw();
    }
    
    requestAnimationFrame(this.animate);
  }
}

// Classe que controla a física de cada pontinho (partícula)
class Particle {
  private x: number;
  private y: number;
  private size: number;
  private baseX: number;
  private baseY: number;
  private density: number;

  constructor(x: number, y: number, private ctx: CanvasRenderingContext2D, private mouse: any) {
    this.x = x + 10; // offset inicial
    this.y = y;
    this.size = 2; // tamanho de cada pontinho
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 0.5; // peso da partícula
  }

  draw() {
    this.ctx.fillStyle = '#8f8f8f'; // Cor das partículas (você pode mudar)
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  update() {
    let dx = this.mouse.x - this.x;
    let dy = this.mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let forceDirectionX = dx / distance;
    let forceDirectionY = dy / distance;
    let maxDistance = this.mouse.radius;
    let force = (maxDistance - distance) / maxDistance;
    let directionX = forceDirectionX * force * this.density;
    let directionY = forceDirectionY * force * this.density;

    // Se o mouse estiver perto, espalha
    if (distance < this.mouse.radius) {
      this.x -= directionX;
      this.y -= directionY;
    } else {
      // Se não, volta para a posição original formando a letra
      if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
      }
      if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
      }
    }
  }
}