# 🌊 Underwater Hand Tracker - Interactive Water Ripples

A mesmerizing, minimalist web-based hand tracking application that combines MediaPipe Hands with realistic WebGL underwater simulation. Experience an immersive underwater view looking up at the water surface, where your hand movements create beautiful ripples through the transparent water!

## Features

- **🎨 Pure Minimalist Design** - Immersive underwater experience with no UI clutter
- **🌊 Underwater Perspective** - Camera positioned underwater looking up at the surface
- **💎 Transparent Water** - Dynamic transparency based on viewing angle and depth
- **🌅 True 3D Ocean Scene** - Fully 3D geometry with depth, perspective, and realistic rendering
- **🌊 Real 3D Waves** - 150x150 mesh grid with vertex displacement for ultra-smooth wave motion
- **☀️ Underwater Lighting** - Sunlight penetrating from above with realistic scattering
- **✨ Caustics Effect** - Animated light patterns dancing on the background
- **🌟 God Rays** - Volumetric sun rays piercing through the water surface
- **🌈 Fresnel Effect** - Realistic water transparency based on viewing angle
- **💧 3D Interactive Ripples** - Hand movements create real geometric ripples through transparent water
- **🌫️ Underwater Fog** - Atmospheric depth with deep blue-green murk in the distance
- **👋 Real-time hand tracking** using MediaPipe Hands
- **🤲 Multi-hand support** - Tracks up to 2 hands simultaneously with ripples from each
- **📹 Minimal Camera View** - Tiny camera feed in top-left corner with hover zoom effect
- **✨ Visual feedback** - Skeleton overlay on camera feed showing tracked hand landmarks
- **🎨 Color-coded hands** - Left hand (green), Right hand (red)

## How to Use

### Option 1: Open Directly in Browser

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Allow camera access when prompted
3. Enjoy the immersive underwater view filling your entire screen
4. Move your hands to create beautiful ripples through the transparent water!
5. Watch the caustics dance and god rays shimmer as waves move above
6. The tiny camera in the top-left shows your hand tracking (hover to zoom)

**Pro tip**: Wave your hands, make circles, or create patterns to see mesmerizing ripple effects! The underwater perspective creates a unique, meditative experience as you look up at the water surface from below.

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

### Physically-Based Wave System
Realistic ocean motion using Gerstner waves:
- **Gerstner Waves** - 5 layered physically-based waves using trochoid mathematics for authentic ocean motion
- **Wave Physics** - Wave speed calculated from gravity and wavelength (c = √(g/k))
- **Circular Motion** - Water particles move in circular paths, creating realistic rolling waves
- **Horizontal Displacement** - Waves have both vertical and horizontal motion like real ocean waves
- **Detail Layers** - Additional small sine waves for surface texture and fine detail
- **Vertex Displacement** - Each vertex moves based on combined wave calculations in 3D space
- **Smooth Normals** - Per-vertex normals computed from neighboring vertices for proper lighting
- **Dynamic Animation** - Multiple wave directions and speeds create complex, natural ocean behavior

### Advanced Underwater Lighting and Materials
Photorealistic underwater rendering with specialized lighting techniques:
- **Top-Down Lighting** - Sunlight penetrates from above, illuminating water from the surface
- **Blinn-Phong Specular** - Soft specular highlights with sun-colored reflections (16-64 power range)
- **Schlick's Fresnel** - Physically-accurate transparency based on viewing angle
- **Dynamic Transparency** - Water opacity varies from 30-70% based on Fresnel and depth
- **Enhanced Subsurface Scattering** - Light penetration from above creates realistic underwater glow
- **Diffuse Shading** - Higher ambient term (50%) for underwater atmosphere
- **Depth-Based Colors** - Realistic color transition from light to deep water blues
- **Minimal Foam** - Reduced foam visibility from underwater perspective
- **Underwater Fog** - Distance fades to deep blue-green murk (not sky)
- **Caustics Effect** - Animated light patterns from surface waves
- **God Rays** - Volumetric sun rays penetrating water surface
- **Color Variation** - Subtle noise adds natural underwater color variation

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
