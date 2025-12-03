// 3D Ocean Water Simulation with WebGL
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

        // Ocean mesh parameters
        this.gridSize = 150; // 150x150 grid for smoother ocean surface
        this.oceanScale = 60.0; // Size of ocean in world units

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.initShaders();
        this.initBuffers();
        this.initMatrices();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.updateProjectionMatrix();
    }

    initMatrices() {
        // Camera setup - positioned underwater looking up at surface
        this.cameraPos = [0, -5, 0];
        this.cameraTarget = [0, 2, -8];
        this.cameraUp = [0, 1, 0];

        this.updateProjectionMatrix();
        this.updateViewMatrix();
    }

    updateProjectionMatrix() {
        const aspect = this.canvas.width / this.canvas.height;
        const fov = 60 * Math.PI / 180;
        const near = 0.1;
        const far = 1000;

        this.projectionMatrix = this.perspective(fov, aspect, near, far);
    }

    updateViewMatrix() {
        this.viewMatrix = this.lookAt(
            this.cameraPos,
            this.cameraTarget,
            this.cameraUp
        );
    }

    // Matrix helper functions
    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }

    lookAt(eye, center, up) {
        const z = this.normalize([eye[0] - center[0], eye[1] - center[1], eye[2] - center[2]]);
        const x = this.normalize(this.cross(up, z));
        const y = this.cross(z, x);

        return [
            x[0], y[0], z[0], 0,
            x[1], y[1], z[1], 0,
            x[2], y[2], z[2], 0,
            -this.dot(x, eye), -this.dot(y, eye), -this.dot(z, eye), 1
        ];
    }

    normalize(v) {
        const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / len, v[1] / len, v[2] / len];
    }

    cross(a, b) {
        return [
            a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0]
        ];
    }

    dot(a, b) {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    initShaders() {
        // Vertex shader for 3D ocean mesh
        const vertexShaderSource = `
            attribute vec3 a_position;
            uniform mat4 u_projection;
            uniform mat4 u_view;
            uniform float u_time;
            uniform vec3 u_ripples[${this.maxRipples}];
            uniform int u_rippleCount;

            varying vec3 v_position;
            varying vec3 v_normal;
            varying float v_waveHeight;

            // Gerstner Wave function for realistic ocean waves
            vec3 gerstnerWave(vec2 pos, float time, vec2 direction, float wavelength, float steepness) {
                float k = 2.0 * 3.14159 / wavelength;
                float c = sqrt(9.8 / k);
                vec2 d = normalize(direction);
                float f = k * (dot(d, pos) - c * time);
                float a = steepness / k;

                return vec3(
                    d.x * a * cos(f),
                    a * sin(f),
                    d.y * a * cos(f)
                );
            }

            // Combined wave function with multiple Gerstner waves - smoother ocean
            vec3 wave(vec2 pos, float time) {
                vec3 wavePos = vec3(0.0);

                // Layer multiple Gerstner waves with gentler parameters for smooth ocean
                wavePos += gerstnerWave(pos, time * 0.5, vec2(1.0, 0.0), 15.0, 0.15);
                wavePos += gerstnerWave(pos, time * 0.45, vec2(0.7, 0.7), 12.0, 0.12);
                wavePos += gerstnerWave(pos, time * 0.6, vec2(0.0, 1.0), 18.0, 0.10);
                wavePos += gerstnerWave(pos, time * 0.4, vec2(-0.5, 0.8), 20.0, 0.10);
                wavePos += gerstnerWave(pos, time * 0.55, vec2(0.6, -0.3), 10.0, 0.08);

                // Add very subtle detail waves for smooth texture
                wavePos.y += sin(pos.x * 1.2 + time * 0.8) * 0.04;
                wavePos.y += sin(pos.y * 0.9 - time * 0.6) * 0.03;
                wavePos.y += sin((pos.x + pos.y) * 0.5 + time * 0.5) * 0.02;

                return wavePos;
            }

            // Ripple function
            float ripple(vec2 pos, vec2 center, float time) {
                float dist = length(pos - center);
                float rippleTime = time * 2.0;

                if (rippleTime < 0.0) return 0.0;

                float rippleFreq = 15.0;
                float rippleSpeed = 5.0;
                float decay = exp(-rippleTime * 1.2);

                float r = sin((dist - rippleTime * rippleSpeed) * rippleFreq) * decay;
                r *= smoothstep(8.0, 0.0, dist);

                return r * 0.5;
            }

            void main() {
                vec3 pos = a_position;

                // Calculate Gerstner wave displacement
                vec3 waveDisplacement = wave(pos.xz, u_time);
                pos += waveDisplacement;

                // Add ripples from hand movement
                float rippleHeight = 0.0;
                for (int i = 0; i < ${this.maxRipples}; i++) {
                    if (i >= u_rippleCount) break;

                    vec2 rippleCenter = u_ripples[i].xy * 60.0 - 30.0; // Map to world coords
                    float rippleTime = u_time - u_ripples[i].z;
                    rippleHeight += ripple(pos.xz, rippleCenter, rippleTime);
                }
                pos.y += rippleHeight;

                v_waveHeight = waveDisplacement.y + rippleHeight;

                // Calculate normal by sampling nearby points for smooth lighting
                float delta = 0.15;
                vec3 wL = wave(pos.xz + vec2(-delta, 0.0), u_time);
                vec3 wR = wave(pos.xz + vec2(delta, 0.0), u_time);
                vec3 wD = wave(pos.xz + vec2(0.0, -delta), u_time);
                vec3 wU = wave(pos.xz + vec2(0.0, delta), u_time);

                // Create tangent and bitangent for proper normal calculation
                vec3 tangent = normalize(vec3(2.0 * delta, wR.y - wL.y, 0.0));
                vec3 bitangent = normalize(vec3(0.0, wU.y - wD.y, 2.0 * delta));
                vec3 normal = normalize(cross(bitangent, tangent));

                v_normal = normal;
                v_position = pos;

                gl_Position = u_projection * u_view * vec4(pos, 1.0);
            }
        `;

        // Fragment shader with lighting
        const fragmentShaderSource = `
            precision highp float;

            varying vec3 v_position;
            varying vec3 v_normal;
            varying float v_waveHeight;

            uniform float u_time;
            uniform vec3 u_cameraPos;

            // Realistic ocean shader properties
            vec3 baseColor = vec3(0.02, 0.52, 0.65);  // Tropical ocean blue
            vec3 depthColor = vec3(0.0, 0.12, 0.32);  // Deep ocean blue
            vec3 shallowColor = vec3(0.1, 0.65, 0.75); // Shallow water cyan
            float normalStrength = 0.8;
            float causticsStrength = 1.2;
            vec2 causticsSpeed = vec2(0.08, 0.08);
            float depthFade = 4.0;
            float refractionStrength = 0.05;

            // Sky colors for reflections
            vec3 skyTop = vec3(0.4, 0.6, 0.95);
            vec3 skyHorizon = vec3(0.7, 0.85, 1.0);
            vec3 sunColor = vec3(1.0, 0.95, 0.8);

            // Procedural noise function for normal map generation
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            // Smooth noise
            float smoothNoise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);

                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));

                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            // Multi-octave noise for realistic ocean texture
            float oceanNoise(vec2 p, float time) {
                float total = 0.0;
                float frequency = 1.0;
                float amplitude = 1.0;
                float maxValue = 0.0;

                // 4 octaves for detailed ocean texture
                for(int i = 0; i < 4; i++) {
                    vec2 offset = vec2(time * 0.02 * float(i + 1), time * 0.015 * float(i + 1));
                    total += smoothNoise(p * frequency + offset) * amplitude;
                    maxValue += amplitude;
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }

                return total / maxValue;
            }

            // Procedural normal map (realistic ocean surface distortion)
            vec3 proceduralNormalMap(vec2 uv, float time) {
                float scale = 6.0;
                vec2 p = uv * scale;

                // Use multi-octave noise for realistic ocean texture
                float epsilon = 0.02;
                float n = oceanNoise(p, time);
                float nx = oceanNoise(p + vec2(epsilon, 0.0), time);
                float ny = oceanNoise(p + vec2(0.0, epsilon), time);

                // Calculate normal from height differences
                vec3 normal = vec3(
                    (n - nx) * normalStrength * 2.5,
                    1.0,
                    (n - ny) * normalStrength * 2.5
                );
                return normalize(normal);
            }

            // Realistic ocean caustics pattern (animated light through water)
            float proceduralCaustics(vec2 uv, float time) {
                // Create flowing caustic patterns using Voronoi-like technique
                vec2 causticsUV1 = uv * 4.0 + time * causticsSpeed * 0.8;
                vec2 causticsUV2 = uv * 3.5 - time * causticsSpeed * 0.6;

                // Primary caustic layer with organic pattern
                float caustic1 = abs(sin(causticsUV1.x * 2.5 + sin(causticsUV1.y * 3.0 + time * 0.25)));
                caustic1 *= abs(cos(causticsUV1.y * 2.0 + cos(causticsUV1.x * 2.5 - time * 0.3)));

                // Secondary caustic layer with different flow
                float caustic2 = abs(sin(causticsUV2.y * 2.8 + sin(causticsUV2.x * 2.2 + time * 0.3)));
                caustic2 *= abs(cos(causticsUV2.x * 2.3 + cos(causticsUV2.y * 2.7 - time * 0.25)));

                // Combine layers
                float caustics = caustic1 * 0.6 + caustic2 * 0.4;
                caustics = pow(caustics, 1.8); // Sharpen caustic edges

                // Add fine detail caustics
                vec2 detailUV = uv * 8.0 + time * causticsSpeed * 0.4;
                float detail = smoothNoise(detailUV);
                caustics *= (0.8 + detail * 0.4);

                // Create more defined caustic network
                caustics = smoothstep(0.2, 0.8, caustics);

                return caustics * causticsStrength;
            }

            void main() {
                float time = u_time;

                // ✅ Procedural normal map for smooth ocean surface distortion
                vec2 surfaceUV = v_position.xz * 0.15;
                vec3 proceduralNormal = proceduralNormalMap(surfaceUV, time);

                // Blend procedural normal with wave normal for smooth realistic surface
                vec3 blendedNormal = normalize(v_normal * 0.7 + proceduralNormal * 0.3);

                // ✅ Refraction distortion (matching Unity shader)
                // Use normal map to distort UV coordinates for caustics and reflections
                vec2 refractionOffset = proceduralNormal.xz * refractionStrength;

                // Lighting setup - sunlight from above penetrating water
                vec3 lightDir = normalize(vec3(0.3, 1.0, 0.2));
                vec3 viewDir = normalize(u_cameraPos - v_position);
                vec3 halfDir = normalize(lightDir + viewDir);

                // Enhanced Fresnel effect for realistic transparency
                float F0 = 0.02;
                float fresnel = F0 + (1.0 - F0) * pow(1.0 - max(dot(viewDir, blendedNormal), 0.0), 5.0);

                // ✅ Smooth depth-based color gradient (matching Unity shader lerp)
                float depth = clamp(v_position.y / depthFade, 0.0, 1.0);
                depth = smoothstep(0.0, 1.0, depth); // Smooth transition

                // Multi-layered color blending for realistic ocean appearance
                vec3 waterColor = mix(depthColor, baseColor, depth);
                waterColor = mix(waterColor, shallowColor, depth * 0.3); // Add shallow highlights

                // Add subtle wave height color variation
                float waveColorFactor = v_waveHeight * 0.2 + 0.5;
                waterColor = mix(waterColor, baseColor * 1.1, waveColorFactor * 0.15);

                // Soft diffuse lighting for smooth ocean
                float NdotL = max(dot(blendedNormal, lightDir), 0.0);
                float diffuse = NdotL * 0.4 + 0.6; // Higher ambient for smooth look

                // ✅ Realistic ocean caustics with refraction distortion
                vec2 causticsUV = v_position.xz * 0.12 + refractionOffset;
                float caustics = proceduralCaustics(causticsUV, time);

                // Modulate caustics by lighting and depth
                caustics *= (NdotL * 0.7 + 0.3) * smoothstep(0.0, 0.6, depth);

                // Soft specular highlights for smooth ocean surface
                float NdotH = max(dot(blendedNormal, halfDir), 0.0);
                float specularPower = mix(20.0, 80.0, fresnel);
                float spec = pow(NdotH, specularPower);
                vec3 specular = spec * sunColor * 0.35;

                // Enhanced subsurface scattering for tropical ocean
                float scatterLight = max(dot(blendedNormal, lightDir), 0.0);
                vec3 subsurface = vec3(0.12, 0.45, 0.55) * pow(scatterLight, 1.8) * 0.5;

                // Apply smooth lighting
                waterColor *= diffuse;

                // ✅ Add ocean caustics with realistic color
                waterColor += vec3(caustics * 0.6, caustics * 0.9, caustics);

                // Add soft subsurface scattering
                waterColor += subsurface;

                // Add subtle specular highlights
                waterColor += specular;

                // ✅ Soft sky reflection with refraction distortion
                vec3 skyReflection = mix(skyHorizon, skyTop, 0.4);
                waterColor = mix(waterColor, skyReflection, fresnel * 0.12);

                // Smooth underwater fog - distance fades to deep ocean blue
                float dist = length(v_position.xz);
                float fog = smoothstep(20.0, 55.0, dist);
                vec3 fogColor = vec3(0.01, 0.18, 0.35); // Deep ocean blue
                waterColor = mix(waterColor, fogColor, fog * 0.6);

                // ✅ Add natural color variation with refraction
                vec2 noiseUV = v_position.xz * 0.3 + refractionOffset * 2.0;
                float colorNoise = oceanNoise(noiseUV, time * 0.1) * 0.015;
                waterColor += vec3(colorNoise * 0.8, colorNoise, colorNoise * 1.2);

                // Ensure smooth realistic brightness
                waterColor = clamp(waterColor, 0.0, 1.0);

                // ✅ Smooth dynamic transparency for realistic ocean water
                float transparency = mix(0.35, 0.65, fresnel);

                // Adjust transparency smoothly based on distance and depth
                float distFactor = smoothstep(0.0, 35.0, dist);
                transparency = mix(transparency, 0.48, distFactor * 0.5);

                // Depth affects transparency
                transparency = mix(transparency, 0.42, depth * 0.3);

                gl_FragColor = vec4(waterColor, transparency);
            }
        `;

        // Sky background shader (simple)
        const skyVertexSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                gl_Position = vec4(a_position, 0.999, 1.0); // Far back
            }
        `;

        const skyFragmentSource = `
            precision mediump float;
            varying vec2 v_uv;
            uniform float u_time;

            void main() {
                // Underwater ambient colors - darker blues/greens
                vec3 deepWater = vec3(0.0, 0.1, 0.2);
                vec3 lightWater = vec3(0.1, 0.3, 0.5);

                float gradient = v_uv.y;
                vec3 skyColor = mix(deepWater, lightWater, gradient * 0.7);

                // Add animated caustics effect (light patterns from water surface)
                float caustics1 = sin(v_uv.x * 15.0 + u_time * 0.3) * sin(v_uv.y * 12.0 - u_time * 0.25);
                float caustics2 = sin(v_uv.x * 12.0 - u_time * 0.2) * cos(v_uv.y * 15.0 + u_time * 0.35);
                float caustics = (caustics1 + caustics2) * 0.5;
                caustics = smoothstep(-0.3, 0.8, caustics) * 0.15;
                skyColor += vec3(caustics * 0.8, caustics, caustics * 1.2);

                // Sun rays from surface (god rays effect)
                vec2 sunPos = vec2(0.5, 0.7);
                vec2 toSun = v_uv - sunPos;
                float rayAngle = atan(toSun.y, toSun.x);
                float rayDist = length(toSun);

                float rays = sin(rayAngle * 12.0 + u_time * 0.1) * 0.5 + 0.5;
                rays *= smoothstep(0.8, 0.0, rayDist);
                rays *= smoothstep(0.0, 0.2, rayDist);
                skyColor += vec3(rays * 0.3, rays * 0.4, rays * 0.5);

                // Bright area where sun penetrates water surface
                float sunGlow = smoothstep(0.4, 0.0, length(v_uv - sunPos));
                skyColor += vec3(sunGlow * 0.3, sunGlow * 0.4, sunGlow * 0.5);

                gl_FragColor = vec4(skyColor, 1.0);
            }
        `;

        // Compile shaders
        const waterVertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const waterFragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        const skyVertexShader = this.createShader(this.gl.VERTEX_SHADER, skyVertexSource);
        const skyFragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, skyFragmentSource);

        // Create programs
        this.waterProgram = this.createProgram(waterVertexShader, waterFragmentShader);
        this.skyProgram = this.createProgram(skyVertexShader, skyFragmentShader);

        // Get attribute and uniform locations for water
        this.waterAttribs = {
            position: this.gl.getAttribLocation(this.waterProgram, 'a_position')
        };

        this.waterUniforms = {
            projection: this.gl.getUniformLocation(this.waterProgram, 'u_projection'),
            view: this.gl.getUniformLocation(this.waterProgram, 'u_view'),
            time: this.gl.getUniformLocation(this.waterProgram, 'u_time'),
            ripples: this.gl.getUniformLocation(this.waterProgram, 'u_ripples'),
            rippleCount: this.gl.getUniformLocation(this.waterProgram, 'u_rippleCount'),
            cameraPos: this.gl.getUniformLocation(this.waterProgram, 'u_cameraPos')
        };

        // Get locations for sky
        this.skyAttribs = {
            position: this.gl.getAttribLocation(this.skyProgram, 'a_position')
        };

        this.skyUniforms = {
            time: this.gl.getUniformLocation(this.skyProgram, 'u_time')
        };
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

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    initBuffers() {
        // Create ocean mesh grid
        const vertices = [];
        const indices = [];

        const halfSize = this.oceanScale / 2;
        const step = this.oceanScale / this.gridSize;

        // Generate vertices
        for (let z = 0; z <= this.gridSize; z++) {
            for (let x = 0; x <= this.gridSize; x++) {
                vertices.push(
                    x * step - halfSize,  // x
                    0,                     // y (will be displaced by waves)
                    z * step - halfSize    // z
                );
            }
        }

        // Generate indices for triangles
        for (let z = 0; z < this.gridSize; z++) {
            for (let x = 0; x < this.gridSize; x++) {
                const topLeft = z * (this.gridSize + 1) + x;
                const topRight = topLeft + 1;
                const bottomLeft = (z + 1) * (this.gridSize + 1) + x;
                const bottomRight = bottomLeft + 1;

                // Two triangles per quad
                indices.push(topLeft, bottomLeft, topRight);
                indices.push(topRight, bottomLeft, bottomRight);
            }
        }

        this.vertexCount = indices.length;

        // Create buffers
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        // Sky quad (fullscreen)
        const skyVertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
        ]);

        this.skyBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.skyBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, skyVertices, this.gl.STATIC_DRAW);
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

        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        // Clear canvas
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Render sky first
        this.renderSky();

        // Render water
        this.renderWater();

        // Clean up old ripples (older than 2 seconds)
        this.ripples = this.ripples.filter(r => (this.time - r[2]) < 2.0);

        requestAnimationFrame(() => this.animate());
    }

    renderSky() {
        this.gl.useProgram(this.skyProgram);
        this.gl.disable(this.gl.DEPTH_TEST);

        // Bind sky buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.skyBuffer);
        this.gl.enableVertexAttribArray(this.skyAttribs.position);
        this.gl.vertexAttribPointer(this.skyAttribs.position, 2, this.gl.FLOAT, false, 0, 0);

        // Set uniforms
        this.gl.uniform1f(this.skyUniforms.time, this.time);

        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    renderWater() {
        this.gl.enable(this.gl.DEPTH_TEST);

        // Enable blending for water transparency
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.useProgram(this.waterProgram);

        // Bind vertex buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.enableVertexAttribArray(this.waterAttribs.position);
        this.gl.vertexAttribPointer(this.waterAttribs.position, 3, this.gl.FLOAT, false, 0, 0);

        // Bind index buffer
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Set uniforms
        this.gl.uniformMatrix4fv(this.waterUniforms.projection, false, this.projectionMatrix);
        this.gl.uniformMatrix4fv(this.waterUniforms.view, false, this.viewMatrix);
        this.gl.uniform1f(this.waterUniforms.time, this.time);
        this.gl.uniform3fv(this.waterUniforms.cameraPos, this.cameraPos);

        // Pass ripple data
        const rippleData = new Float32Array(this.maxRipples * 3);
        for (let i = 0; i < this.ripples.length && i < this.maxRipples; i++) {
            rippleData[i * 3] = this.ripples[i][0];
            rippleData[i * 3 + 1] = this.ripples[i][1];
            rippleData[i * 3 + 2] = this.ripples[i][2];
        }
        this.gl.uniform3fv(this.waterUniforms.ripples, rippleData);
        this.gl.uniform1i(this.waterUniforms.rippleCount, this.ripples.length);

        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, this.vertexCount, this.gl.UNSIGNED_SHORT, 0);
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
