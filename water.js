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

            // Sky colors
            vec3 skyTop = vec3(0.4, 0.6, 0.95);
            vec3 skyHorizon = vec3(0.7, 0.85, 1.0);

            // Ocean colors
            vec3 deepWater = vec3(0.0, 0.2, 0.4);
            vec3 shallowWater = vec3(0.0, 0.4, 0.6);
            vec3 foam = vec3(0.7, 0.9, 1.0);

            // Horizon position (0.0-1.0, where 0.35 means 35% from top)
            float horizonY = 0.35;

            float wave(vec2 uv, float time, float perspective) {
                // Adjust frequency and amplitude based on perspective (distance)
                float freq = 3.0 + perspective * 5.0;
                float amp = 0.02 * (1.0 - perspective * 0.7);

                float w1 = sin(uv.x * freq + time * 0.5) * amp;
                float w2 = sin(uv.y * freq * 1.3 + time * 0.7) * amp;
                float w3 = sin((uv.x + uv.y) * freq * 0.7 + time * 0.3) * amp;

                return w1 + w2 + w3;
            }

            float ripple(vec2 uv, vec2 center, float time, float strength, float perspective) {
                float dist = length(uv - center);
                float rippleTime = time * 2.0;

                if (rippleTime < 0.0) return 0.0;

                float rippleFreq = 20.0;
                float rippleSpeed = 3.0;
                float decay = exp(-rippleTime * 1.5);

                // Scale ripple effect by perspective
                float r = sin((dist - rippleTime * rippleSpeed) * rippleFreq) * decay * strength;
                r *= smoothstep(0.5, 0.0, dist);
                r *= (1.0 - perspective * 0.5); // Reduce ripple visibility at horizon

                return r * 0.3;
            }

            void main() {
                vec2 uv = v_uv;

                // Determine if we're in sky or water region
                if (uv.y < horizonY) {
                    // SKY REGION
                    // Create gradient from top to horizon
                    float skyMix = uv.y / horizonY;
                    vec3 skyColor = mix(skyTop, skyHorizon, skyMix);

                    // Add some subtle clouds
                    float clouds = sin(uv.x * 8.0 + u_time * 0.1) * sin(uv.y * 12.0 + u_time * 0.15);
                    clouds = clouds * 0.05 + 0.05;
                    skyColor += vec3(clouds);

                    // Add sun glow near horizon
                    float sunGlow = smoothstep(0.3, 0.0, length(uv - vec2(0.5, horizonY)));
                    skyColor += vec3(sunGlow * 0.2, sunGlow * 0.15, sunGlow * 0.05);

                    gl_FragColor = vec4(skyColor, 1.0);
                } else {
                    // OCEAN REGION
                    // Perspective calculation - closer to horizon = further away
                    float distFromHorizon = (uv.y - horizonY) / (1.0 - horizonY);
                    float perspective = 1.0 - distFromHorizon;

                    // Adjust UV for aspect ratio
                    vec2 oceanUV = uv;
                    oceanUV.x *= u_resolution.x / u_resolution.y;

                    // Apply perspective stretch to create depth
                    oceanUV.y = horizonY + (uv.y - horizonY) / (1.0 + perspective * 2.0);

                    // Base wave animation with perspective
                    float waves = wave(oceanUV, u_time, perspective);

                    // Add ripples from hand movement
                    float rippleEffect = 0.0;
                    for (int i = 0; i < ${this.maxRipples}; i++) {
                        if (i >= u_rippleCount) break;

                        vec2 ripplePos = u_ripples[i].xy;
                        ripplePos.x *= u_resolution.x / u_resolution.y;

                        // Map ripple position to perspective space
                        float ripplePerspective = 1.0 - (ripplePos.y - horizonY) / (1.0 - horizonY);
                        ripplePos.y = horizonY + (ripplePos.y - horizonY) / (1.0 + ripplePerspective * 2.0);

                        float rippleTime = u_time - u_ripples[i].z;
                        rippleEffect += ripple(oceanUV, ripplePos, rippleTime, 1.0, perspective);
                    }

                    // Combine waves and ripples
                    float height = waves + rippleEffect;

                    // Calculate color based on wave height and distance
                    vec3 waterColor = mix(deepWater, shallowWater, height * 10.0 + 0.5);

                    // Darken water near horizon (atmospheric perspective)
                    waterColor = mix(waterColor, deepWater, perspective * 0.5);

                    // Add foam/highlights on wave peaks
                    if (height > 0.03) {
                        waterColor = mix(waterColor, foam, (height - 0.03) * 15.0);
                    }

                    // Add shimmer that's stronger in foreground
                    float shimmer = sin(oceanUV.x * 50.0 + u_time * 3.0) * sin(oceanUV.y * 50.0 + u_time * 2.5);
                    shimmer = shimmer * 0.1 + 0.9;
                    shimmer = mix(shimmer, 1.0, perspective * 0.7);
                    waterColor *= shimmer;

                    // Reflection of sky at horizon
                    float horizonReflection = smoothstep(0.0, 0.2, perspective);
                    waterColor = mix(waterColor, skyHorizon * 0.6, horizonReflection * 0.3);

                    gl_FragColor = vec4(waterColor, 1.0);
                }
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
