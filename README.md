# 🌊 Letter From Deep Sea - Interactive Ocean Journey

A mesmerizing two-part interactive experience combining Three.js particle systems with MediaPipe hand tracking. Begin with "Letter From Deep Sea" - a message from the abyss told through particles, then dive into a realistic WebGL underwater simulation.

## 🌟 Experience Overview

### Part 1: Letter From Deep Sea (index.html)
Begin your journey in the abyss with 35,000 interactive particles that morph between mathematical shapes:
- **Whale Fall Formation** - Particles cascading like marine snow, delivering the ocean's letter
- **Mathematical Beauty** - Seamless morphing between fractal geometry, Möbius strips, Penrose triangles, and Cartesian hearts
- **Hand Interaction** - Your movements influence the particle flow and trigger shape transformations
- **Real-time Stats** - Flat-design panel showing FPS, particle count, shape, and interaction status
- **Smooth Transition** - After interaction, smoothly transitions to the underwater scene

### Part 2: Underwater Scene (ocean.html)
Dive into a photorealistic underwater view with:
- **Immersive Underwater Perspective** - Camera positioned underwater looking up at the surface
- **Realistic Ocean Simulation** - WebGL rendering with Gerstner waves and refraction
- **Interactive Ripples** - Hand movements create geometric ripples through transparent water

## Features

### 📜 Letter From Deep Sea Intro
- **35,000 Particles** - Real-time rendering with glow and trailing effects
- **5 Mathematical Shapes** - Whale Fall, Fractal, Möbius Strip, Penrose Triangle, Cartesian Heart
- **Pure Black Interface** - Minimalist design with cyan particle glow
- **Hand-Driven Morphing** - Shapes transform based on your interactions
- **Ocean-like Motion** - Particles roll and surge like underwater currents
- **Flat Stats Panel** - Real-time FPS and particle system status
- **Smooth Transitions** - Beautiful fade from abyss to ocean

### 🌊 Underwater Scene
- **🎨 Pure Minimalist Design** - Immersive underwater experience with no UI clutter
- **🌊 Underwater Perspective** - Camera positioned underwater looking up at the surface
- **💎 Smooth Transparent Water** - Ultra-smooth waves with dynamic transparency based on viewing angle and depth
- **🌅 True 3D Ocean Scene** - Fully 3D geometry with depth, perspective, and photorealistic rendering
- **🌊 Gentle Ocean Waves** - 150x150 mesh grid with smooth Gerstner waves for realistic gentle ocean motion
- **🎨 Realistic Ocean Texture** - Multi-octave procedural noise creates perfect ocean surface appearance
- **🌈 Tropical Ocean Colors** - Authentic blue-green water colors from shallow cyan to deep ocean blue
- **☀️ Soft Underwater Lighting** - Gentle sunlight penetrating from above with smooth ambient illumination
- **✨ Realistic Caustics** - Organic flowing light patterns mimicking real underwater caustics
- **🌟 God Rays** - Volumetric sun rays piercing through the water surface
- **🌈 Fresnel Effect** - Physically-accurate water transparency based on viewing angle
- **💧 3D Interactive Ripples** - Hand movements create gentle geometric ripples through smooth transparent water
- **🌫️ Smooth Underwater Fog** - Gradual atmospheric depth fading to deep ocean blue
- **👋 Real-time hand tracking** using MediaPipe Hands
- **🤲 Multi-hand support** - Tracks up to 2 hands simultaneously with ripples from each
- **📹 Minimal Camera View** - Tiny camera feed in top-left corner with hover zoom effect
- **✨ Visual feedback** - Skeleton overlay on camera feed showing tracked hand landmarks
- **🎨 Color-coded hands** - Left hand (green), Right hand (red)

## How to Use

### 🌟 Complete Experience (Recommended)

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Allow camera access when prompted
3. **Part 1 - Letter From Deep Sea:**
   - Watch 35,000 particles cascade in the darkness, forming a message from the abyss
   - Move your hand to interact with the particle system
   - Particles will respond to your movements with force
   - Shapes will automatically morph through 5 mathematical forms
   - Continue interacting for ~10 seconds
4. **Part 2 - Underwater Scene:**
   - Experience a smooth transition from abyss to ocean
   - Automatically transitions to the immersive underwater view
   - Move your hands to create ripples through transparent water
   - Watch caustics dance and god rays shimmer above

**Pro tip**: Wave your hands near particles to push them away. The more you interact, the faster shapes morph. After sufficient interaction, you'll smoothly transition to the underwater scene!

### 🌊 Direct to Underwater (Skip Intro)

1. Simply open `ocean.html` in a modern web browser
2. Allow camera access when prompted
3. Enjoy the immersive underwater view filling your entire screen
4. Move your hands to create beautiful ripples through the transparent water!

### Option 2: Using a Local Server

For better performance and fewer browser restrictions, serve the files using a local HTTP server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then open your browser and navigate to: `http://localhost:8000`

## Requirements

- Modern web browser with WebRTC support
- Webcam
- Internet connection (for loading MediaPipe libraries from CDN)

## Technology Stack

- **WebGL** - Hardware-accelerated ocean and ripple rendering with custom shaders
- **MediaPipe Hands** - Google's machine learning hand tracking solution
- **Vanilla JavaScript** - No frameworks required, pure performance
- **HTML5 Canvas** - For drawing hand landmarks overlay
- **WebRTC** - For webcam access

## How It Works

### True 3D Underwater Rendering
The scene uses a real 3D mesh rendered in WebGL with underwater perspective:
- **High-Resolution Mesh** - 150x150 vertex grid (22,801 vertices) for ultra-smooth water surface
- **Vertex Shader** - Displaces each vertex based on physically-accurate wave functions in 3D space
- **Underwater Camera** - Perspective projection positioned below water surface looking up
- **Real Depth** - Proper depth testing and z-buffering for authentic 3D appearance
- **Alpha Blending** - WebGL transparency with SRC_ALPHA blending for realistic water clarity

### Smooth Physically-Based Wave System
Gentle, realistic ocean motion using optimized Gerstner waves:
- **Smooth Gerstner Waves** - 5 layered waves with reduced steepness (0.08-0.15) for gentle ocean motion
- **Longer Wavelengths** - 10-20 unit wavelengths create smooth, rolling ocean surface
- **Slower Animation** - Wave speeds reduced by 40-60% for calmer, more realistic ocean
- **Wave Physics** - Wave speed calculated from gravity and wavelength (c = √(g/k))
- **Circular Motion** - Water particles move in circular paths, creating realistic rolling waves
- **Horizontal Displacement** - Waves have both vertical and horizontal motion like real ocean waves
- **Subtle Detail Layers** - Very gentle sine waves (0.02-0.04 amplitude) for fine surface texture
- **Vertex Displacement** - Each vertex moves based on combined wave calculations in 3D space
- **Smooth Normals** - Per-vertex normals computed from neighboring vertices for proper lighting
- **Multi-directional Flow** - Multiple wave directions create complex, natural ocean behavior

### Advanced Underwater Lighting and Materials
Photorealistic underwater rendering with Unity shader-inspired techniques:
- **Refraction Distortion** - Normal maps distort caustics and background for realistic light refraction (refractionStrength: 0.05)
- **Soft Ambient Lighting** - Gentle sunlight from above with 60% ambient term for smooth underwater atmosphere
- **Multi-Octave Normal Maps** - 4-octave procedural noise creates realistic ocean surface texture
- **Realistic Ocean Colors** - Tropical blue-green palette: Shallow (0.1, 0.65, 0.75) → Base (0.02, 0.52, 0.65) → Deep (0.0, 0.12, 0.32)
- **Multi-Layer Color Blending** - Smooth depth gradients with wave height variation for natural appearance
- **Organic Caustics Pattern** - Voronoi-like flowing caustics with refraction distortion for realistic underwater light
- **Smooth Transparency** - Water opacity varies 35-65% based on Fresnel, depth, and distance
- **Soft Specular Highlights** - Gentle sun reflections (20-80 power range) for smooth ocean surface
- **Schlick's Fresnel** - Physically-accurate transparency based on viewing angle
- **Enhanced Subsurface Scattering** - Tropical ocean light penetration (cyan-tinted) for realistic glow
- **Smooth Fog Transitions** - Gradual atmospheric depth fading to deep ocean blue (20-55 unit range)
- **Refracted Color Variation** - Multi-octave noise with refraction distortion adds realistic color variation
- **Blended Normal Maps** - 70% wave normals + 30% procedural for smooth realistic surface
- **God Rays** - Volumetric sun rays penetrating water surface in background
- **Depth-Modulated Effects** - Caustics and transparency smoothly vary with depth for realism

### 3D Interactive Ripples
Hand-triggered ripples are real geometric deformations:
- **Vertex Deformation** - Ripples displace actual mesh vertices in 3D
- **Radial Propagation** - Ripples spread outward from hand position
- **Natural Decay** - Exponential falloff over distance and time
- **Multi-ripple Support** - Up to 50 simultaneous ripples can interact

### Hand Movement Detection
The app tracks your hand position in 3D space and:
1. Detects hand movement by comparing positions between frames
2. Triggers ripples when movement exceeds a threshold (prevents noise)
3. Creates ripples at the palm center and all 5 fingertips for dramatic effect
4. Maps hand coordinates from camera space to screen space for accurate ripple placement

### Ripple Physics
Each ripple:
- Propagates outward at realistic wave speed
- Decays exponentially over ~2 seconds
- Interferes with other ripples naturally
- Respects distance falloff for realistic spreading

## Design Philosophy

This app embraces minimalism for a meditative, immersive underwater experience:
- **No UI clutter** - Just transparent water, underwater atmosphere, and your hands
- **Underwater Perspective** - Experience the unique view from beneath the ocean surface
- **Natural interaction** - Move your hands naturally; ripples flow through transparent water
- **Atmospheric Effects** - Caustics, god rays, and underwater fog create immersion
- **Mirrored camera** - Camera feed is mirrored for intuitive control
- **Hover to inspect** - Hover over the small camera to see hand tracking details

## Hand Tracking

The app silently tracks 21 landmarks per hand including:
- Wrist (landmark 0)
- Thumb tip (landmark 4)
- Index finger tip (landmark 8)
- Middle finger tip (landmark 12)
- Ring finger tip (landmark 16)
- Pinky tip (landmark 20)

Each landmark shows x, y, and z coordinates (z indicates depth).

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires HTTPS in production (or localhost for development)

## Privacy

All hand tracking is performed locally in your browser. No video or data is sent to any server.

## Troubleshooting

**Camera not working?**
- Make sure you allowed camera permissions
- Check if another application is using the camera
- Try refreshing the page

**Tracking is slow or laggy?**
- Close other tabs/applications
- Ensure good lighting
- Try reducing modelComplexity in app.js (change from 1 to 0)

**No hands detected?**
- Ensure good lighting conditions
- Keep hands clearly visible to camera
- Try adjusting the distance from the camera

## License

MIT
