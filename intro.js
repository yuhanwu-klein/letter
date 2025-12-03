// Whale Fall - Three.js Particle System
class WhaleFallParticles {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.particleCount = 35000;
        this.currentShapeIndex = 0;
        this.morphProgress = 0;
        this.handDetected = false;
        this.interactionCount = 0;
        this.transitionTriggered = false;

        // Mathematical shapes
        this.shapes = [
            { name: 'WHALE FALL', fn: this.whaleFallShape.bind(this) },
            { name: 'WHALE', fn: this.whaleShape.bind(this) },
            { name: 'FISH SCHOOL', fn: this.fishSchoolShape.bind(this) },
            { name: 'FRACTAL', fn: this.fractalShape.bind(this) },
            { name: 'MÖBIUS STRIP', fn: this.mobiusStripShape.bind(this) },
            { name: 'PENROSE TRIANGLE', fn: this.penroseTriangleShape.bind(this) },
            { name: 'CARTESIAN HEART', fn: this.cartesianHeartShape.bind(this) }
        ];

        this.init();
        this.setupHandTracking();
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
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Create particle system
        this.createParticles();

        // Stats
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;

        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }

    createParticles() {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(this.particleCount * 3);
        const velocities = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);

        // Initialize particles in whale fall formation
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const pos = this.whaleFallShape(i / this.particleCount);

            positions[i3] = pos.x;
            positions[i3 + 1] = pos.y;
            positions[i3 + 2] = pos.z;

            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;

            // Colorful ocean colors - varied like fish and sea life
            const colorType = Math.random();
            if (colorType < 0.3) {
                // Cyan/turquoise - tropical fish
                colors[i3] = 0.0 + Math.random() * 0.3;
                colors[i3 + 1] = 0.8 + Math.random() * 0.2;
                colors[i3 + 2] = 0.9 + Math.random() * 0.1;
            } else if (colorType < 0.5) {
                // Deep blue - whale colors
                colors[i3] = 0.0 + Math.random() * 0.2;
                colors[i3 + 1] = 0.3 + Math.random() * 0.4;
                colors[i3 + 2] = 0.7 + Math.random() * 0.3;
            } else if (colorType < 0.65) {
                // Purple/violet - deep sea creatures
                colors[i3] = 0.5 + Math.random() * 0.3;
                colors[i3 + 1] = 0.1 + Math.random() * 0.3;
                colors[i3 + 2] = 0.8 + Math.random() * 0.2;
            } else if (colorType < 0.8) {
                // Green/teal - sea life
                colors[i3] = 0.1 + Math.random() * 0.3;
                colors[i3 + 1] = 0.7 + Math.random() * 0.3;
                colors[i3 + 2] = 0.5 + Math.random() * 0.3;
            } else {
                // Orange/coral - tropical accent
                colors[i3] = 1.0;
                colors[i3 + 1] = 0.4 + Math.random() * 0.3;
                colors[i3 + 2] = 0.1 + Math.random() * 0.2;
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // Glowing particle material with varied sizes
        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // Store original positions for morphing
        this.originalPositions = positions.slice();
        this.targetPositions = new Float32Array(this.particleCount * 3);
    }

    // Mathematical Shape: Whale Fall (particles falling like marine snow)
    whaleFallShape(t) {
        const theta = t * Math.PI * 8;
        const phi = t * Math.PI * 4;
        const r = 20 + Math.sin(t * 10) * 5;

        return {
            x: r * Math.cos(theta) * Math.sin(phi),
            y: 30 - t * 60 + Math.sin(t * 20) * 3, // Falling motion
            z: r * Math.sin(theta) * Math.sin(phi)
        };
    }

    // Organic Shape: Whale
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

    // Organic Shape: Fish School
    fishSchoolShape(t) {
        // Multiple fish swimming in formation
        const fishIndex = Math.floor(t * 8); // 8 fish in the school
        const localT = (t * 8) % 1;

        const angle = (fishIndex / 8) * Math.PI * 2;
        const radius = 12 + Math.sin(localT * Math.PI) * 3;
        const swimPhase = localT * Math.PI * 4;

        // Fish body position
        const x = radius * Math.cos(angle) + Math.sin(swimPhase) * 4;
        const y = Math.sin(swimPhase * 0.5) * 5 + Math.cos(localT * Math.PI) * 3;
        const z = radius * Math.sin(angle) + Math.cos(swimPhase) * 2;

        // Add swimming motion
        const swimWave = Math.sin(t * 50) * 0.5;

        return {
            x: x + swimWave,
            y: y,
            z: z - swimWave * 0.5
        };
    }

    // Mathematical Shape: Fractal (3D Sierpinski-like)
    fractalShape(t) {
        const iterations = 5;
        let x = 0, y = 0, z = 0;
        let scale = 20;

        for (let i = 0; i < iterations; i++) {
            const choice = Math.floor(t * Math.pow(3, i)) % 3;
            scale /= 2;

            if (choice === 0) {
                x += scale;
            } else if (choice === 1) {
                y += scale;
            } else {
                z += scale;
            }
        }

        return { x: x - 10, y: y - 10, z: z - 10 };
    }

    // Mathematical Shape: Möbius Strip
    mobiusStripShape(t) {
        const u = t * Math.PI * 2;
        const v = (t * 2 - 1) * 3;
        const R = 15;

        return {
            x: (R + v * Math.cos(u / 2)) * Math.cos(u),
            y: (R + v * Math.cos(u / 2)) * Math.sin(u),
            z: v * Math.sin(u / 2)
        };
    }

    // Mathematical Shape: Penrose Triangle
    penroseTriangleShape(t) {
        const angle = t * Math.PI * 2;
        const side = Math.floor(t * 3);
        const localT = (t * 3) % 1;
        const r = 15;

        let x, y, z;
        if (side === 0) {
            x = r * Math.cos(angle);
            y = r * Math.sin(angle);
            z = localT * 10 - 5;
        } else if (side === 1) {
            x = r * Math.cos(angle + Math.PI * 2 / 3);
            y = r * Math.sin(angle + Math.PI * 2 / 3);
            z = localT * 10 - 5;
        } else {
            x = r * Math.cos(angle + Math.PI * 4 / 3);
            y = r * Math.sin(angle + Math.PI * 4 / 3);
            z = localT * 10 - 5;
        }

        return { x, y, z };
    }

    // Mathematical Shape: Cartesian Heart
    cartesianHeartShape(t) {
        const u = t * Math.PI * 2;
        const scale = 8;

        const x = scale * (16 * Math.pow(Math.sin(u), 3));
        const y = scale * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u));
        const z = scale * Math.sin(u) * Math.cos(u) * 5;

        return { x, y: y - 5, z };
    }

    morphToNextShape() {
        const nextShapeIndex = (this.currentShapeIndex + 1) % this.shapes.length;
        const nextShape = this.shapes[nextShapeIndex].fn;

        // Calculate target positions
        for (let i = 0; i < this.particleCount; i++) {
            const pos = nextShape(i / this.particleCount);
            this.targetPositions[i * 3] = pos.x;
            this.targetPositions[i * 3 + 1] = pos.y;
            this.targetPositions[i * 3 + 2] = pos.z;
        }

        this.currentShapeIndex = nextShapeIndex;
        this.morphProgress = 0;

        // Update UI
        document.getElementById('currentShape').textContent = this.shapes[nextShapeIndex].name;
    }

    updateParticles(time) {
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;

        // Morph to target shape
        if (this.morphProgress < 1) {
            this.morphProgress += 0.01;
            const easeProgress = this.easeInOutCubic(this.morphProgress);

            for (let i = 0; i < this.particleCount; i++) {
                const i3 = i * 3;
                positions[i3] += (this.targetPositions[i3] - positions[i3]) * 0.05;
                positions[i3 + 1] += (this.targetPositions[i3 + 1] - positions[i3 + 1]) * 0.05;
                positions[i3 + 2] += (this.targetPositions[i3 + 2] - positions[i3 + 2]) * 0.05;
            }
        }

        // Ocean-like rolling motion
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const wave = Math.sin(time * 0.001 + i * 0.01) * 0.03;
            const surge = Math.cos(time * 0.0015 + i * 0.008) * 0.02;

            positions[i3] += wave;
            positions[i3 + 1] += surge;
            positions[i3 + 2] += Math.sin(time * 0.002 + i * 0.012) * 0.025;

            // Add velocity for trailing effect
            positions[i3] += velocities[i3];
            positions[i3 + 1] += velocities[i3 + 1];
            positions[i3 + 2] += velocities[i3 + 2];

            // Damping
            velocities[i3] *= 0.98;
            velocities[i3 + 1] *= 0.98;
            velocities[i3 + 2] *= 0.98;
        }

        this.particles.geometry.attributes.position.needsUpdate = true;

        // Rotate entire system for dynamic view
        this.particles.rotation.y = time * 0.0001;
        this.particles.rotation.x = Math.sin(time * 0.0002) * 0.2;
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    handleHandInteraction(handLandmarks) {
        if (!handLandmarks) return;

        this.handDetected = true;
        this.interactionCount++;

        // Update status
        document.getElementById('handStatus').textContent = 'DETECTED';

        // Get palm center
        const palm = handLandmarks[9];
        const handX = (palm.x - 0.5) * 100;
        const handY = (0.5 - palm.y) * 100;
        const handZ = -palm.z * 50;

        // Apply force to nearby particles
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.particles.geometry.attributes.velocity.array;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const dx = positions[i3] - handX;
            const dy = positions[i3 + 1] - handY;
            const dz = positions[i3 + 2] - handZ;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < 20) {
                const force = (1 - dist / 20) * 0.5;
                velocities[i3] += (dx / dist) * force;
                velocities[i3 + 1] += (dy / dist) * force;
                velocities[i3 + 2] += (dz / dist) * force;
            }
        }

        // Trigger shape morph on interaction
        if (this.interactionCount % 120 === 0) {
            this.morphToNextShape();
        }

        // Trigger transition after sufficient interaction
        if (this.interactionCount > 300 && !this.transitionTriggered) {
            this.triggerTransition();
        }
    }

    triggerTransition() {
        this.transitionTriggered = true;

        // Fade out instruction overlay
        document.getElementById('instructionOverlay').classList.add('hidden');
        document.querySelector('.stats-panel').classList.add('transitioning');
        document.body.classList.add('transitioning');

        // Transition to underwater scene
        setTimeout(() => {
            window.location.href = 'ocean.html';
        }, 2000);
    }

    setupHandTracking() {
        const video = document.getElementById('handVideo');
        const canvas = document.getElementById('handCanvas');

        const hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                this.handleHandInteraction(results.multiHandLandmarks[0]);
            } else {
                this.handDetected = false;
                document.getElementById('handStatus').textContent = 'WAITING';
            }
        });

        const camera = new Camera(video, {
            onFrame: async () => {
                await hands.send({ image: video });
            },
            width: 640,
            height: 480
        });

        camera.start();
    }

    updateStats(time) {
        this.frameCount++;

        if (time - this.lastTime > 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (time - this.lastTime));
            this.frameCount = 0;
            this.lastTime = time;

            document.getElementById('fps').textContent = this.fps;
        }

        document.getElementById('particleCount').textContent = this.particleCount.toLocaleString();
    }

    animate() {
        const time = performance.now();

        this.updateParticles(time);
        this.updateStats(time);
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(() => this.animate());
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new WhaleFallParticles();
});
