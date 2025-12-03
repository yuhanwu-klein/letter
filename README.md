# 🌊 Ocean Hand Tracker - Interactive Water Ripples

A mesmerizing, minimalist web-based hand tracking application that combines MediaPipe Hands with realistic WebGL water simulation. Experience a pure, immersive ocean view where your hand movements create beautiful ripples across the water!

## Features

- **🎨 Pure Minimalist Design** - Nothing but ocean and sky - no UI clutter
- **🌅 True 3D Ocean Scene** - Fully 3D geometry with depth, perspective, and realistic rendering
- **🌊 Real 3D Waves** - 100x100 mesh grid with vertex displacement for authentic wave motion
- **💡 Advanced Lighting** - Diffuse lighting, specular highlights, and sun reflections
- **🌈 Fresnel Effect** - Realistic water-sky reflections at grazing angles
- **☁️ Atmospheric Sky** - Gradient sky with subtle clouds and sun glow
- **💧 3D Interactive Ripples** - Hand movements create real geometric ripples in 3D space
- **🌫️ Distance Fog** - Atmospheric depth with fog blending water into horizon
- **👋 Real-time hand tracking** using MediaPipe Hands
- **🤲 Multi-hand support** - Tracks up to 2 hands simultaneously with ripples from each
- **📹 Minimal Camera View** - Tiny camera feed in top-left corner with hover zoom effect
- **✨ Visual feedback** - Skeleton overlay on camera feed showing tracked hand landmarks
- **🎨 Color-coded hands** - Left hand (green), Right hand (red)

## How to Use

### Option 1: Open Directly in Browser

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Allow camera access when prompted
3. Enjoy the pure ocean view filling your entire screen
4. Move your hands to create beautiful ripples across the water!
5. The tiny camera in the top-left shows your hand tracking (hover to zoom)

**Pro tip**: Wave your hands, make circles, or create patterns to see mesmerizing ripple effects! The experience is designed to be meditative and immersive.

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

### True 3D Ocean Rendering
The ocean is a real 3D mesh rendered in WebGL:
- **Mesh Geometry** - 100x100 vertex grid (10,201 vertices) forming the ocean surface
- **Vertex Shader** - Displaces each vertex based on wave functions in 3D space
- **3D Camera** - Perspective projection with adjustable FOV looking down at the ocean
- **Real Depth** - Proper depth testing and z-buffering for authentic 3D appearance

### Advanced Wave System
Multiple wave frequencies combine for realistic motion:
- **Layered Waves** - 4 different sine waves with varying frequencies and speeds
- **Vertex Displacement** - Each vertex moves up/down based on wave calculations
- **Normal Calculation** - Per-vertex normals computed for proper lighting
- **Dynamic Animation** - Continuous wave motion creates living, breathing ocean

### Realistic Lighting Model
- **Directional Light** - Simulated sun from upper right casting light across water
- **Diffuse Shading** - Wave slopes receive different amounts of light
- **Specular Highlights** - Bright sun reflections on wave peaks
- **Fresnel Effect** - Water reflects sky more at shallow viewing angles
- **Distance Fog** - Far water blends into horizon for atmospheric depth

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

This app embraces minimalism for a meditative, immersive experience:
- **No UI clutter** - Just ocean, sky, and your hands
- **Natural interaction** - Move your hands naturally; ripples follow
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
