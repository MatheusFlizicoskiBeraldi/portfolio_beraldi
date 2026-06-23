import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('meuCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private particlesArray: Particle3D[] = [];
  
  // Parâmetros da Esfera
  private sphereRadius = 150; // Tamanho real da esfera 3D
  private numParticles = 800;  // Número de partículas na esfera
  
  // Controle de Rotação
  private mouse = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 }; // Rotação alvo (para suavizar)
  private currentRotation = { x: 0, y: 0 }; // Rotação atual sendo desenhada

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Define o tamanho do canvas (maior para acomodar a rotação)
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
    this.targetRotation.y = normalizedX * Math.PI; // Gira na horizontal (eixo Y)
    this.targetRotation.x = normalizedY * Math.PI; // Inclina na vertical (eixo X)
  }

  private initEffect() {
    this.particlesArray = [];
    
    // Gera pontos perfeitamente distribuídos na superfície de uma esfera (algoritmo Fibonacci)
    const phi = Math.PI * (3 - Math.sqrt(5)); // Ângulo dourado

    for (let i = 0; i < this.numParticles; i++) {
      let y = 1 - (i / (this.numParticles - 1)) * 2; // y varia de 1 a -1
      let radiusAtY = Math.sqrt(1 - y * y); // raio no y atual

      let theta = phi * i; // ângulo dourado de incremento

      let x = Math.cos(theta) * radiusAtY;
      let z = Math.sin(theta) * radiusAtY;

      // Escala os pontos unitários para o tamanho real da esfera
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
      
      // 2. Projeta e desenha na tela 2D (offset para o centro do canvas)
      particle.drawProjection(canvas.width / 2, canvas.height / 2);
    }
    
    // Ordena as partículas pelo 'Z' final antes de desenhar (ordem de sobreposição)
    this.particlesArray.sort((a, b) => b.rotatedCoords.z - a.rotatedCoords.z);

    // Redesenha as partículas na ordem correta (para profundidade realista)
    for (let i = 0; i < this.particlesArray.length; i++) {
       this.particlesArray[i].drawFinal();
    }

    requestAnimationFrame(this.animate);
  }
}

// Classe que controla a física 3D e a projeção 2D de cada partícula
class Particle3D {
  // Coordenadas 3D originais e estáticas
  private baseX: number;
  private baseY: number;
  private baseZ: number;

  // Coordenadas 3D calculadas após a rotação
  public rotatedCoords = { x: 0, y: 0, z: 0 };
  // Coordenadas 2D finais na tela
  private projectedCoords = { x: 0, y: 0 };
  
  // Parâmetros visuais
  private baseSize: number = 3;
  private projectedSize: number = 1;
  private opacity: number = 1;

  constructor(x: number, y: number, z: number, private ctx: CanvasRenderingContext2D) {
    this.baseX = x;
    this.baseY = y;
    this.baseZ = z;
  }

  // Calcula a nova posição 3D baseada nos ângulos de rotação
  updateRotation(angleX: number, angleY: number) {
    // Rotação no eixo X
    let tempY = this.baseY * Math.cos(angleX) - this.baseZ * Math.sin(angleX);
    let tempZ1 = this.baseY * Math.sin(angleX) + this.baseZ * Math.cos(angleX);

    // Rotação no eixo Y (aplicada sobre o resultado anterior)
    let tempX = this.baseX * Math.cos(angleY) - tempZ1 * Math.sin(angleY);
    let finalZ = this.baseX * Math.sin(angleY) + tempZ1 * Math.cos(angleY);

    this.rotatedCoords.x = tempX;
    this.rotatedCoords.y = tempY;
    this.rotatedCoords.z = finalZ; // profundidade
  }

  // Projeta as coordenadas 3D rotacionadas para 2D na tela
  drawProjection(offsetX: number, offsetY: number) {
    const cameraDistance = 800; // Distância da "câmera" para o efeito de perspectiva

    // Fator de perspectiva baseado na profundidade (z)
    const factor = cameraDistance / (cameraDistance + this.rotatedCoords.z);
    
    // Coordenadas 2D projetadas
    this.projectedCoords.x = this.rotatedCoords.x * factor + offsetX;
    this.projectedCoords.y = this.rotatedCoords.y * factor + offsetY;

    // Tamanho e opacidade projetados com base na profundidade
    this.projectedSize = this.baseSize * factor; // Mais perto, maior
    this.opacity = (factor * 2.5); // Mais perto, mais visível (maior opacidade)
    if (this.opacity > 1) this.opacity = 1;
    if (this.opacity < 0.05) this.opacity = 0.05; // Mínimo visível
  }

  // Desenha a partícula na tela 2D
  drawFinal() {
    this.ctx.globalAlpha = this.opacity; // Aplica transparência
    this.ctx.fillStyle = '#580000'; // Cor das partículas (vermelho escuro)
    this.ctx.beginPath();
    this.ctx.arc(this.projectedCoords.x, this.projectedCoords.y, this.projectedSize, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.globalAlpha = 1; // Reseta transparência
  }
}