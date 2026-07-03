/**
 * 3D Orbiting Skills Tag Cloud on Canvas
 * Renders a rotating sphere of interactive, glowing skills.
 */

const SKILLS_DATA = [
  // Programming
  { name: 'C', category: 'programming' },
  { name: 'C++', category: 'programming' },
  { name: 'Java', category: 'programming' },
  { name: 'Python', category: 'programming' },
  { name: 'HTML & CSS', category: 'programming' },
  { name: 'PHP', category: 'programming' },
  { name: 'ASP.NET', category: 'programming' },
  { name: 'SQL', category: 'programming' },
  // Cybersecurity
  { name: 'Wireshark', category: 'cybersecurity' },
  { name: 'Nmap', category: 'cybersecurity' },
  { name: 'Hashcat', category: 'cybersecurity' },
  { name: 'Hydra', category: 'cybersecurity' },
  { name: 'Burpsuite', category: 'cybersecurity' },
  { name: 'Metasploit', category: 'cybersecurity' },
  { name: 'OpenVAS', category: 'cybersecurity' },
  { name: 'Nessus', category: 'cybersecurity' },
  // Infrastructure
  { name: 'SOC Operations', category: 'infrastructure' },
  { name: 'VAPT Scans', category: 'infrastructure' },
  { name: 'Log Analysis', category: 'infrastructure' },
  { name: 'Threat Detection', category: 'infrastructure' },
  // Operating Systems
  { name: 'Kali Linux', category: 'os' },
  { name: 'Linux Hardening', category: 'os' },
  { name: 'Windows Server', category: 'os' },
  { name: 'Active Directory', category: 'os' },
  // Databases
  { name: 'SQL Database', category: 'databases' },
  { name: 'Oracle', category: 'databases' },
  { name: 'Firebase', category: 'databases' },
  // Soft Skills
  { name: 'Analytical Thinking', category: 'soft-skills' },
  { name: 'Academic Research', category: 'soft-skills' },
  { name: 'Problem Solving', category: 'soft-skills' },
  { name: 'Team Comm', category: 'soft-skills' },
  { name: 'Agile Learning', category: 'soft-skills' }
];

const CATEGORY_COLORS = {
  'programming': { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' },      // Cyan
  'cybersecurity': { color: '#bd00ff', glow: 'rgba(189, 0, 255, 0.4)' },    // Purple
  'infrastructure': { color: '#0052ff', glow: 'rgba(0, 82, 255, 0.4)' },     // Blue
  'os': { color: '#ffffff', glow: 'rgba(255, 255, 255, 0.4)' },             // White
  'databases': { color: '#8f9cae', glow: 'rgba(143, 156, 174, 0.4)' },      // Gray
  'soft-skills': { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.4)' }        // Cyan
};

class SkillsOrbit {
  constructor() {
    this.canvas = document.getElementById('orbit-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.radius = 180; // Radius of 3D sphere
    this.tags = [];
    this.selectedCategory = 'all';
    
    // Rotation angles
    this.angleX = 0.003;
    this.angleY = 0.003;
    
    // Interaction states
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    
    this.init();
    this.bindEvents();
    
    // Setup intersection observer to pause updates when not visible
    this.isVisible = true;
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const wasVisible = this.isVisible;
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !wasVisible) {
            this.animate();
          }
        });
      }, { threshold: 0.05 });
      this.observer.observe(this.canvas);
    }
    
    this.animate();
  }

  init() {
    this.resize();
    this.tags = [];
    
    const count = SKILLS_DATA.length;
    for (let i = 0; i < count; i++) {
      // Golden spiral distribution on sphere
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      
      const x = this.radius * Math.sin(phi) * Math.cos(theta);
      const y = this.radius * Math.sin(phi) * Math.sin(theta);
      const z = this.radius * Math.cos(phi);
      
      this.tags.push({
        name: SKILLS_DATA[i].name,
        category: SKILLS_DATA[i].category,
        x3d: x,
        y3d: y,
        z3d: z,
        x2d: 0,
        y2d: 0,
        scale: 1,
        alpha: 1,
        highlighted: false
      });
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.radius = Math.min(rect.width, rect.height) * 0.38;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse rotation controls
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      this.lastMouseX = e.clientX - rect.left;
      this.lastMouseY = e.clientY - rect.top;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.mouseX = x;
      this.mouseY = y;
      
      if (this.isDragging) {
        const dx = x - this.lastMouseX;
        const dy = y - this.lastMouseY;
        this.angleY = dx * 0.005;
        this.angleX = -dy * 0.005;
        this.lastMouseX = x;
        this.lastMouseY = y;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch controls for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      const rect = this.canvas.getBoundingClientRect();
      this.lastMouseX = e.touches[0].clientX - rect.left;
      this.lastMouseY = e.touches[0].clientY - rect.top;
    });

    window.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      if (this.isDragging) {
        const dx = x - this.lastMouseX;
        const dy = y - this.lastMouseY;
        this.angleY = dx * 0.008;
        this.angleX = -dy * 0.008;
        this.lastMouseX = x;
        this.lastMouseY = y;
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Interactive category button clicking
    document.querySelectorAll('.skill-category-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.skill-category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedCategory = e.target.dataset.category;
        
        // Highlight active badges in DOM list
        document.querySelectorAll('.skill-badge').forEach(badge => {
          if (this.selectedCategory === 'all' || badge.dataset.category === this.selectedCategory) {
            badge.classList.remove('dimmed');
          } else {
            badge.classList.add('dimmed');
          }
        });
      });
    });
  }

  rotateSphere() {
    // Trigonometric variables
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);
    
    for (let tag of this.tags) {
      // Rotate Y
      const x1 = tag.x3d * cosY - tag.z3d * sinY;
      const z1 = tag.z3d * cosY + tag.x3d * sinY;
      
      // Rotate X
      const y2 = tag.y3d * cosX - z1 * sinX;
      const z2 = z1 * cosX + tag.y3d * sinX;
      
      tag.x3d = x1;
      tag.y3d = y2;
      tag.z3d = z2;
    }

    // Apply deceleration friction when not dragging
    if (!this.isDragging) {
      this.angleX *= 0.98;
      this.angleY *= 0.98;
      
      // Keep a very tiny idle rotation
      if (Math.abs(this.angleX) < 0.001) this.angleX = 0.001;
      if (Math.abs(this.angleY) < 0.001) this.angleY = 0.001;
    }
  }

  animate() {
    if (!this.isVisible) return;
    this.rotateSphere();
    
    const rect = this.canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    
    // Project 3D tags into 2D coordinates & compute depth (scale/opacity)
    for (let tag of this.tags) {
      // Perspective projection
      const fov = 400; // Camera distance field of view
      const scale = fov / (fov + tag.z3d);
      
      tag.x2d = cx + tag.x3d * scale;
      tag.y2d = cy + tag.y3d * scale;
      tag.scale = scale;
      
      // Base opacity depends on Z-depth
      let opacity = (scale - 0.5) * 1.5;
      opacity = Math.max(0.1, Math.min(1, opacity));
      
      // Category filtering dim effect
      if (this.selectedCategory !== 'all' && tag.category !== this.selectedCategory) {
        opacity *= 0.25;
      }
      
      tag.alpha = opacity;
    }

    // Sort by depth (z-index buffer equivalent) so background is drawn first
    const sortedTags = [...this.tags].sort((a, b) => b.z3d - a.z3d);
    
    // Clear screen
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Render sorted elements
    for (let tag of sortedTags) {
      const cfg = CATEGORY_COLORS[tag.category] || { color: '#ffffff', glow: 'rgba(255,255,255,0.2)' };
      
      this.ctx.save();
      this.ctx.globalAlpha = tag.alpha;
      
      // Font settings scaled by perspective depth
      const fontSize = Math.max(8, Math.floor(13 * tag.scale));
      this.ctx.font = `600 ${fontSize}px 'Outfit', sans-serif`;
      
      // Calculate node measurements
      const textWidth = this.ctx.measureText(tag.name).width;
      const paddingX = 10 * tag.scale;
      const paddingY = 6 * tag.scale;
      const boxW = textWidth + paddingX * 2;
      const boxH = fontSize + paddingY * 2;
      const rx = tag.x2d - boxW / 2;
      const ry = tag.y2d - boxH / 2;
      
      // Glow and blur shadows for items close to the camera (Z > 0)
      const isLight = document.body.classList.contains('light-theme');
      if (!isLight && tag.z3d < 0 && tag.alpha > 0.6) {
        this.ctx.shadowBlur = 15 * tag.scale;
        this.ctx.shadowColor = cfg.color;
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      // Draw background glass pill box
      this.ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.92)' : 'rgba(10, 10, 12, 0.85)';
      this.ctx.strokeStyle = isLight ? '#000000' : cfg.color;
      this.ctx.lineWidth = Math.max(0.5, 1 * tag.scale);
      
      // Draw rounded rectangle
      this.ctx.beginPath();
      const radius = 6 * tag.scale;
      this.ctx.moveTo(rx + radius, ry);
      this.ctx.lineTo(rx + boxW - radius, ry);
      this.ctx.quadraticCurveTo(rx + boxW, ry, rx + boxW, ry + radius);
      this.ctx.lineTo(rx + boxW, ry + boxH - radius);
      this.ctx.quadraticCurveTo(rx + boxW, ry + boxH, rx + boxW - radius, ry + boxH);
      this.ctx.lineTo(rx + radius, ry + boxH);
      this.ctx.quadraticCurveTo(rx, ry + boxH, rx, ry + boxH - radius);
      this.ctx.lineTo(rx, ry + radius);
      this.ctx.quadraticCurveTo(rx, ry, rx + radius, ry);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
      
      // Write skill name inside node box
      this.ctx.shadowBlur = 0; // Reset text shadow
      this.ctx.fillStyle = isLight 
        ? (tag.z3d < 0 ? '#1a1a24' : 'rgba(26, 26, 36, 0.75)') 
        : (tag.z3d < 0 ? '#ffffff' : 'rgba(255, 255, 255, 0.7)');
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(tag.name, tag.x2d, tag.y2d);
      
      this.ctx.restore();
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate orbit
document.addEventListener('DOMContentLoaded', () => {
  new SkillsOrbit();
});
