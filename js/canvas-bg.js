/**
 * High-performance background canvas animation
 * Renders an interactive mesh network (cybersecurity style node connection grid)
 * with scroll parallax and mouse-following displacement.
 */

class InteractiveBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.scrollOffset = 0;
    this.maxParticles = 80;
    this.connectionDistance = 120;
    
    this.init();
    this.animate();
    this.bindEvents();
  }

  init() {
    this.resize();
    this.particles = [];
    
    // Scale particle count based on screen size
    const screenArea = this.canvas.width * this.canvas.height;
    this.maxParticles = Math.min(Math.floor(screenArea / 18000), 120);
    
    for (let i = 0; i < this.maxParticles; i++) {
      const size = Math.random() * 2 + 1;
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: size,
        originalSize: size,
        color: this.getRandomColor(),
        depth: Math.random() * 0.8 + 0.2 // Depth factor for scroll parallax (0.2 to 1.0)
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(0, 240, 255, 0.4)', // cyan
      'rgba(0, 82, 255, 0.3)',  // blue
      'rgba(189, 0, 255, 0.3)', // purple
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    window.addEventListener('scroll', () => {
      this.scrollOffset = window.scrollY;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Process and draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // Apply parallax relative to scroll
      // A deeper particle (smaller depth factor) moves slower
      let drawY = p.y - (this.scrollOffset * p.depth);
      
      // Wrap around vertical space based on scroll
      const virtualHeight = this.canvas.height;
      drawY = ((drawY % virtualHeight) + virtualHeight) % virtualHeight;
      
      // Mouse interaction (repulsion/attraction)
      let displayX = p.x;
      let displayY = drawY;
      
      if (this.mouse.x !== null) {
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - drawY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          // Move nodes slightly away from cursor to feel interactive and fluid
          displayX -= dx / distance * force * 35;
          displayY -= dy / distance * force * 35;
          p.size = p.originalSize * (1 + force * 0.8);
        } else {
          p.size = p.originalSize;
        }
      }
      
      // Update basic position for next frame
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce boundaries
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      // Draw particle glow
      const isLight = document.body.classList.contains('light-theme');
      this.ctx.beginPath();
      this.ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.25)' : p.color;
      this.ctx.shadowBlur = (isLight || p.size <= 2) ? 0 : 8;
      this.ctx.shadowColor = isLight ? 'transparent' : p.color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // Reset shadow for lines
      
      // Connect to neighbors
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        let p2DrawY = p2.y - (this.scrollOffset * p2.depth);
        p2DrawY = ((p2DrawY % virtualHeight) + virtualHeight) % virtualHeight;
        
        let p2DisplayX = p2.x;
        let p2DisplayY = p2DrawY;
        
        // Match mouse shift for connections
        if (this.mouse.x !== null) {
          const dx = this.mouse.x - p2.x;
          const dy = this.mouse.y - p2DrawY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < this.mouse.radius) {
            const force = (this.mouse.radius - distance) / this.mouse.radius;
            p2DisplayX -= dx / distance * force * 35;
            p2DisplayY -= dy / distance * force * 35;
          }
        }
        
        const dx = displayX - p2DisplayX;
        const dy = displayY - p2DisplayY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.connectionDistance) {
          const alpha = (1 - (dist / this.connectionDistance)) * 0.12;
          const isLight = document.body.classList.contains('light-theme');
          this.ctx.strokeStyle = isLight ? `rgba(0, 0, 0, ${alpha * 1.5})` : `rgba(255, 255, 255, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(displayX, displayY);
          this.ctx.lineTo(p2DisplayX, p2DisplayY);
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate once DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  new InteractiveBackground();
});
