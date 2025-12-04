// Underwater Whale - Three.js Particle System
class UnderwaterWhale {
    constructor() {
        this.canvas = document.getElementById('whaleCanvas');
        this.particleCount = 35000;

        this.init();
        this.createWhaleParticles();
        this.animate();
    }

    init() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Position camera to view whale from below and slightly behind
        this.camera.position.set(0, -25, 45);
        this.camera.rotation.x = Math.PI * 0.2; // Tilt up to look at whale from below

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }

    createWhaleParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        // Create whale shape with light blue ocean colors
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const t = i / this.particleCount;

            // Generate whale shape
            const pos = this.whaleShape(t);

            // Rotate and position whale for underwater scene
            const scale = 2.0; // Larger whale for cinematic effect
            positions[i3] = pos.x * scale;
            positions[i3 + 1] = (pos.z * scale) - 10; // Swim horizontally
            positions[i3 + 2] = (-pos.y * scale) - 20; // Position ahead

            // No initial velocity
            velocities[i3] = 0;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = 0;

            // Light blue ocean color with subtle variations
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i3] = 0.3 * brightness;      // R
            colors[i3 + 1] = 0.8 * brightness;  // G
            colors[i3 + 2] = 1.0 * brightness;  // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Glowing particle material for underwater effect
        const material = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Animation state
        this.swimPhase = 0;
        this.startTime = performance.now();
    }

    // Whale shape based on parametric equations
    whaleShape(t) {
        const u = t * Math.PI * 2;
        const bodyLength = 25;
        const bodyWidth = 8;
        const bodyHeight = 6;

        // Main body using parametric curve
        const x = bodyLength * Math.cos(u) * 0.5;
        const y = bodyHeight * Math.sin(u * 2) * (1 - Math.abs(Math.cos(u))) + Math.sin(u * 4) * 2;
        const z = bodyWidth * Math.sin(u) * (1 - Math.abs(Math.cos(u)));

        // Add fins and tail details
        const finOffset = Math.sin(t * 20) * 1.5;
        const tailSway = Math.sin(t * 10) * 3;

        return {
            x: x + tailSway,
            y: y + finOffset,
            z: z
        };
    }

    updateWhaleMotion(time) {
        const positions = this.particles.geometry.attributes.position.array;
        const colors = this.particles.geometry.attributes.color.array;

        // Slow swimming phase
        this.swimPhase = time * 0.0004;

        // Gentle undulating motion for realistic swimming
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const t = i / this.particleCount;

            // Tail wave motion (particles at the back sway more)
            const tailInfluence = Math.max(0, (t - 0.5) * 2); // Back half of whale
            const tailWave = Math.sin(this.swimPhase + t * Math.PI * 4) * 0.8 * tailInfluence;
            positions[i3] += tailWave * 0.1;
            positions[i3 + 1] += Math.cos(this.swimPhase + t * Math.PI * 3) * 0.05 * tailInfluence;

            // Subtle breathing/body flex
            const bodyFlex = Math.sin(time * 0.0008 + t * Math.PI) * 0.02;
            positions[i3 + 1] += bodyFlex;

            // Underwater light shimmer effect on colors
            const shimmer = Math.sin(time * 0.002 + i * 0.05) * 0.1 + 0.9;
            const baseR = 0.3;
            const baseG = 0.8;
            const baseB = 1.0;

            colors[i3] = baseR * shimmer;
            colors[i3 + 1] = baseG * shimmer;
            colors[i3 + 2] = baseB * shimmer;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
        this.particles.geometry.attributes.color.needsUpdate = true;

        // Gentle whale rotation - slow swimming motion
        this.particles.rotation.y = Math.sin(this.swimPhase * 0.5) * 0.08; // Gentle turn
        this.particles.rotation.z = Math.cos(this.swimPhase * 0.7) * 0.04; // Slight roll

        // Slow forward movement (whale swimming through water)
        this.particles.position.z += Math.sin(time * 0.0001) * 0.002;
        this.particles.position.x += Math.cos(time * 0.00015) * 0.001;
    }

    animate() {
        const time = performance.now();

        this.updateWhaleMotion(time);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.animate());
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize when DOM and Three.js are loaded
window.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        new UnderwaterWhale();
    }
});
