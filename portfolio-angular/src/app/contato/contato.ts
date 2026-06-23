import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-contato', // <-- Atualizado para o seletor de contato
  standalone: true,
  imports: [],
  templateUrl: './contato.html', // <-- Aponta para o HTML de contato
  styleUrl: './contato.css',     // <-- Aponta para o CSS de contato
})
export class ContatoComponent implements AfterViewInit { // <-- Classe renomeada
  @ViewChild('meuCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particlesArray: Particle3D[] = [];
  
  // Parâmetros da Esfera
  private sphereRadius = 150; 
  private numParticles = 800;  
  
  // Controle de Rotação
  private mouse = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 }; 
  private currentRotation = { x: 0, y: 0 }; 

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Define o tamanho do canvas
    canvas.width = 600;
    canvas.height = 600;

    this.initEffect();
    this.animate();
  }

  // Captura a posição do mouse para girar
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    // Normaliza a posição do mouse em relação ao centro (entre -1 e 1)
    const normalizedX = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    const normalizedY = ((event.clientY - rect.top) / canvas.height) * 2 - 1;

    // Define os ângulos alvo com base no mouse
    this.targetRotation.y = normalizedX * Math.PI; 
    this.targetRotation.x = normalizedY * Math.PI; 
  }

  private initEffect() {
    this.particlesArray = [];
    
    // Gera pontos distribuídos na superfície (algoritmo Fibonacci)
    const phi = Math.PI * (3 - Math.sqrt(5)); 

    for (let i = 0; i < this.numParticles; i++) {
      let y = 1 - (i / (this.numParticles - 1)) * 2; 
      let radiusAtY = Math.sqrt(1 - y * y); 

      let theta = phi * i; 

      let x = Math.cos(theta) * radiusAtY;
      let z = Math.sin(theta) * radiusAtY;

      this.particlesArray.push(new Particle3D(
        x * this.sphereRadius, 
        y * this.sphereRadius, 
        z * this.sphereRadius, 
        this.ctx
      ));
    }
  }

  private animate = () => {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Suaviza a rotação atual em direção à rotação alvo (efeito inércia)
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.05;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.05;

    // Processa cada partícula
    for (let i = 0; i < this.particlesArray.length; i++) {
      const particle = this.particlesArray[i];

      // 1. Aplica a rotação 3D
      particle.updateRotation(this.currentRotation.x, this.currentRotation.y);
      
      // 2. Projeta e desenha na tela 2D
      particle.drawProjection(canvas.width / 2, canvas.height / 2);
    }
    
    // Ordena as partículas pelo 'Z' final antes de desenhar
    this.particlesArray.sort((a, b) => b.rotatedCoords.z - a.rotatedCoords.z);

    // Redesenha as partículas na ordem correta
    for (let i = 0; i < this.particlesArray.length; i++) {
       this.particlesArray[i].drawFinal();
    }

    requestAnimationFrame(this.animate);
  }
}

// Classe que controla a física 3D e a projeção 2D de cada partícula
class Particle3D {
  private baseX: number;
  private baseY: number;
  private baseZ: number;

  public rotatedCoords = { x: 0, y: 0, z: 0 };
  private projectedCoords = { x: 0, y: 0 };
  
  private baseSize: number = 3;
  private projectedSize: number = 1;
  private opacity: number = 1;

  constructor(x: number, y: number, z: number, private ctx: CanvasRenderingContext2D) {
    this.baseX = x;
    this.baseY = y;
    this.baseZ = z;
  }

  updateRotation(angleX: number, angleY: number) {
    let tempY = this.baseY * Math.cos(angleX) - this.baseZ * Math.sin(angleX);
    let tempZ1 = this.baseY * Math.sin(angleX) + this.baseZ * Math.cos(angleX);

    let tempX = this.baseX * Math.cos(angleY) - tempZ1 * Math.sin(angleY);
    let finalZ = this.baseX * Math.sin(angleY) + tempZ1 * Math.cos(angleY);

    this.rotatedCoords.x = tempX;
    this.rotatedCoords.y = tempY;
    this.rotatedCoords.z = finalZ; 
  }

  drawProjection(offsetX: number, offsetY: number) {
    const cameraDistance = 800; 

    const factor = cameraDistance / (cameraDistance + this.rotatedCoords.z);
    
    this.projectedCoords.x = this.rotatedCoords.x * factor + offsetX;
    this.projectedCoords.y = this.rotatedCoords.y * factor + offsetY;

    this.projectedSize = this.baseSize * factor; 
    this.opacity = (factor * 2.5); 
    if (this.opacity > 1) this.opacity = 1;
    if (this.opacity < 0.05) this.opacity = 0.05; 
  }

  drawFinal() {
    this.ctx.globalAlpha = this.opacity; 
    this.ctx.fillStyle = '#ffffff'; 
    this.ctx.beginPath();
    this.ctx.arc(this.projectedCoords.x, this.projectedCoords.y, this.projectedSize, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.globalAlpha = 1; 
  }
}