/**
 * Visual Effects System for Fruit Tetris
 * Includes Particle System, Screen Shake, and Celebration Manager
 */

// Particle class representing a single visual element
export class Particle {
    constructor(x, y, type, options = {}) {
        this.x = x;
        this.y = y;
        this.type = type; // 'juice', 'sparkle', 'confetti'

        // Physics
        this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * 5;
        this.vy = options.vy !== undefined ? options.vy : (Math.random() - 0.5) * 5;
        this.gravity = options.gravity !== undefined ? options.gravity : 0.2;
        this.friction = options.friction !== undefined ? options.friction : 0.98;

        // Visuals
        this.color = options.color || '#FFFFFF';
        this.size = options.size || 5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.opacity = 1.0;

        // Lifecycle
        this.age = 0;
        this.maxLife = options.life || 60; // frames
        this.active = true;
    }

    reset(x, y, type, options = {}) {
        this.x = x;
        this.y = y;
        this.type = type;

        this.vx = options.vx !== undefined ? options.vx : (Math.random() - 0.5) * 5;
        this.vy = options.vy !== undefined ? options.vy : (Math.random() - 0.5) * 5;
        this.gravity = options.gravity !== undefined ? options.gravity : 0.2;
        this.friction = options.friction !== undefined ? options.friction : 0.98;

        this.color = options.color || '#FFFFFF';
        this.size = options.size || 5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.opacity = 1.0;

        this.age = 0;
        this.maxLife = options.life || 60;
        this.active = true;
    }

    update(deltaTime) {
        if (!this.active) return;

        // Apply physics
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update rotation
        this.rotation += this.rotationSpeed;

        // Update lifecycle
        this.age++;
        this.opacity = 1 - (this.age / this.maxLife);

        if (this.age >= this.maxLife) {
            this.active = false;
        }
    }

    render(ctx) {
        if (!this.active) return;

        // Culling - check if particle is roughly within canvas bounds
        // Assuming standard canvas size or passed context has canvas
        if (ctx.canvas) {
            const margin = 50;
            if (this.x < -margin || this.x > ctx.canvas.width + margin ||
                this.y < -margin || this.y > ctx.canvas.height + margin) {
                return;
            }
        }

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;

        if (this.type === 'juice') {
            // Circle for juice
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'sparkle') {
            // Star/diamond shape for sparkle
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(this.size * 0.5, 0);
            ctx.lineTo(0, this.size);
            ctx.lineTo(-this.size * 0.5, 0);
            ctx.closePath();
            ctx.fill();
        } else {
            // Square for confetti/default
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        }

        ctx.restore();
    }
}

// ParticleSystem to manage all active particles
export class ParticleSystem {
    constructor(maxParticles = 500) {
        this.particles = [];
        this.pool = [];
        this.maxParticles = maxParticles;
    }

    update(deltaTime) {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update(deltaTime);
            if (!p.active) {
                this.particles.splice(i, 1);
                this.pool.push(p);
            }
        }
    }

    getParticle(x, y, type, options) {
        let p;
        if (this.pool.length > 0) {
            p = this.pool.pop();
            p.reset(x, y, type, options);
        } else {
            p = new Particle(x, y, type, options);
        }
        return p;
    }

    render(ctx) {
        this.particles.forEach(p => p.render(ctx));
    }

    // Create juice splatters (e.g., when clearing lines)
    createJuiceSplatter(x, y, color, count = 10) {
        if (this.particles.length >= this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            this.particles.push(this.getParticle(x, y, 'juice', {
                color: color,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                life: 30 + Math.random() * 20
            }));
        }
    }

    // Create sparkles (e.g., for combos)
    createSparkles(x, y, count = 5) {
        if (this.particles.length >= this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            this.particles.push(this.getParticle(x, y, 'sparkle', {
                color: '#FFD700', // Gold
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                gravity: 0.05,
                size: Math.random() * 3 + 1,
                life: 40 + Math.random() * 20
            }));
        }
    }

    // Create multi-color burst
    createColorBurst(x, y, count = 20) {
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

        if (this.particles.length >= this.maxParticles) return;

        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) break;

            const color = colors[Math.floor(Math.random() * colors.length)];

            this.particles.push(this.getParticle(x, y, 'confetti', {
                color: color,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                gravity: 0.1,
                size: Math.random() * 4 + 2,
                life: 50 + Math.random() * 30
            }));
        }
    }

    clear() {
        this.particles = [];
        this.pool = [];
    }
}

// ScreenShake manager
export class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.duration = 0;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    shake(intensity, duration) {
        // Add to current intensity but clamp to reasonable max
        this.intensity = Math.min(this.intensity + intensity, 20);
        this.duration = Math.max(this.duration, duration);
    }

    update(deltaTime) {
        if (this.duration > 0) {
            this.duration -= deltaTime;

            // Calculate random offset based on intensity
            this.offsetX = (Math.random() - 0.5) * 2 * this.intensity;
            this.offsetY = (Math.random() - 0.5) * 2 * this.intensity;

            // Decay intensity
            this.intensity = Math.max(0, this.intensity * 0.9);

            if (this.duration <= 0) {
                this.intensity = 0;
                this.offsetX = 0;
                this.offsetY = 0;
            }
        } else {
            this.offsetX = 0;
            this.offsetY = 0;
        }
    }
}

// CelebrationManager for high-level effects
export class CelebrationManager {
    constructor(particleSystem, screenShake) {
        this.particleSystem = particleSystem;
        this.screenShake = screenShake;
    }

    triggerTetrisCelebration(x, y) {
        // Big explosion for Tetris (4 lines)
        this.particleSystem.createJuiceSplatter(x, y, '#FFD700', 60); // Gold splatter
        this.particleSystem.createSparkles(x, y, 30);
        this.particleSystem.createColorBurst(x, y, 40); // Add color burst for more impact
        this.screenShake.shake(12, 400);
    }

    triggerComboCelebration(x, y, comboCount) {
        // Scale intensity with combo count
        const intensity = Math.min(comboCount, 12);

        if (comboCount >= 7) {
            // Very high combo - epic burst
            this.particleSystem.createColorBurst(x, y, intensity * 10);
            this.particleSystem.createSparkles(x, y, intensity * 6);
            this.screenShake.shake(intensity * 2.5, 300);
        } else if (comboCount >= 5) {
            // High combo - multi-color burst
            this.particleSystem.createColorBurst(x, y, intensity * 8);
            this.particleSystem.createSparkles(x, y, intensity * 4);
            this.screenShake.shake(intensity * 2, 250);
        } else {
            // Regular combo - sparkles
            this.particleSystem.createSparkles(x, y, intensity * 6);
            this.screenShake.shake(intensity * 1.5, 200);
        }
    }

    triggerPerfectClearCelebration(x, y) {
        // Epic celebration for perfect clear - the ultimate achievement!
        // Multiple waves of particles with staggered timing
        this.particleSystem.createColorBurst(x, y, 120); // Massive initial burst
        this.particleSystem.createSparkles(x, y, 60); // Lots of sparkles
        
        // Create additional bursts in a circle pattern with better timing
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 90;
            const burstX = x + Math.cos(angle) * distance;
            const burstY = y + Math.sin(angle) * distance;
            
            setTimeout(() => {
                this.particleSystem.createColorBurst(burstX, burstY, 25);
                this.particleSystem.createSparkles(burstX, burstY, 12);
            }, i * 60);
        }
        
        // Add secondary wave for extra impact
        setTimeout(() => {
            this.particleSystem.createColorBurst(x, y, 80);
            this.particleSystem.createSparkles(x, y, 40);
        }, 300);
        
        // Intense screen shake with longer duration
        this.screenShake.shake(18, 500);
    }
}

// Attach to window for browser usage
if (typeof window !== 'undefined') {
    window.Particle = Particle;
    window.ParticleSystem = ParticleSystem;
    window.ScreenShake = ScreenShake;
    window.CelebrationManager = CelebrationManager;
}
