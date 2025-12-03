// WebGL Water Simulation with Ripple Effects
class WaterSimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.ripples = [];
        this.maxRipples = 50;
        this.time = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initShaders();
        this.initBuffers();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    initShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;

            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            varying vec2 v_uv;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec3 u_ripples[${this.maxRipples}];
            uniform int u_rippleCount;

            // Ocean colors
            vec3 deepWater = vec3(0.0, 0.2, 0.4);
            vec3 shallowWater = vec3(0.0, 0.4, 0.6);
            vec3 foam = vec3(0.7, 0.9, 1.0);

            float wave(vec2 uv, float time) {
                float freq = 3.0;
                float amp = 0.02;

                float w1 = sin(uv.x * freq + time * 0.5) * amp;
                float w2 = sin(uv.y * freq * 1.3 + time * 0.7) * amp;
                float w3 = sin((uv.x + uv.y) * freq * 0.7 + time * 0.3) * amp;

                return w1 + w2 + w3;
            }

            float ripple(vec2 uv, vec2 center, float time, float strength) {
                float dist = length(uv - center);
                float rippleTime = time * 2.0;

                if (rippleTime < 0.0) return 0.0;

                float rippleFreq = 20.0;
                float rippleSpeed = 3.0;
                float decay = exp(-rippleTime * 1.5);

                float r = sin((dist - rippleTime * rippleSpeed) * rippleFreq) * decay * strength;
                r *= smoothstep(0.5, 0.0, dist);

                return r * 0.3;
            }

            void main() {
                vec2 uv = v_uv;
                uv.x *= u_resolution.x / u_resolution.y;

                // Base wave animation
                float waves = wave(uv, u_time);

                // Add ripples from hand movement
                float rippleEffect = 0.0;
                for (int i = 0; i < ${this.maxRipples}; i++) {
                    if (i >= u_rippleCount) break;

                    vec2 ripplePos = u_ripples[i].xy;
                    ripplePos.x *= u_resolution.x / u_resolution.y;
                    float rippleTime = u_time - u_ripples[i].z;

                    rippleEffect += ripple(uv, ripplePos, rippleTime, 1.0);
                }

                // Combine waves and ripples
                float height = waves + rippleEffect;

                // Calculate color based on wave height
                vec3 waterColor = mix(deepWater, shallowWater, height * 10.0 + 0.5);

                // Add foam/highlights on wave peaks
                if (height > 0.03) {
                    waterColor = mix(waterColor, foam, (height - 0.03) * 15.0);
                }

                // Add some shimmer
                float shimmer = sin(uv.x * 50.0 + u_time * 3.0) * sin(uv.y * 50.0 + u_time * 2.5);
                shimmer = shimmer * 0.1 + 0.9;
                waterColor *= shimmer;

                // Vignette effect
                float vignette = 1.0 - length(v_uv - 0.5) * 0.5;
                waterColor *= vignette;

                gl_FragColor = vec4(waterColor, 1.0);
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
            return;
        }

        this.gl.useProgram(this.program);

        // Get attribute and uniform locations
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
        this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.ripplesLocation = this.gl.getUniformLocation(this.program, 'u_ripples');
        this.rippleCountLocation = this.gl.getUniformLocation(this.program, 'u_rippleCount');
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers() {
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }

    addRipple(x, y) {
        // Normalize coordinates to 0-1 range
        const normalizedX = x / this.canvas.width;
        const normalizedY = 1.0 - (y / this.canvas.height);

        // Add ripple with current time
        this.ripples.push([normalizedX, normalizedY, this.time]);

        // Remove old ripples
        if (this.ripples.length > this.maxRipples) {
            this.ripples.shift();
        }
    }

    animate() {
        this.time += 0.016; // ~60fps

        // Clear canvas
        this.gl.clearColor(0.0, 0.2, 0.4, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Set up attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionLocation);
        this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        // Set uniforms
        this.gl.uniform1f(this.timeLocation, this.time);
        this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);

        // Pass ripple data
        const rippleData = new Float32Array(this.maxRipples * 3);
        for (let i = 0; i < this.ripples.length && i < this.maxRipples; i++) {
            rippleData[i * 3] = this.ripples[i][0];
            rippleData[i * 3 + 1] = this.ripples[i][1];
            rippleData[i * 3 + 2] = this.ripples[i][2];
        }
        this.gl.uniform3fv(this.ripplesLocation, rippleData);
        this.gl.uniform1i(this.rippleCountLocation, this.ripples.length);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        // Clean up old ripples (older than 2 seconds)
        this.ripples = this.ripples.filter(r => (this.time - r[2]) < 2.0);

        requestAnimationFrame(() => this.animate());
    }

    getRippleCount() {
        return this.ripples.length;
    }
}

// Initialize water simulation
let waterSim;
window.addEventListener('DOMContentLoaded', () => {
    waterSim = new WaterSimulation('waterCanvas');
});
