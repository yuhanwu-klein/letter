# 🌊 Ocean Hand Tracker - Interactive Water Ripples

A mesmerizing, minimalist web-based hand tracking application that combines MediaPipe Hands with realistic WebGL water simulation. Experience a pure, immersive ocean view where your hand movements create beautiful ripples across the water!

## Features

- **🎨 Pure Minimalist Design** - Nothing but ocean and sky - no UI clutter
- **🌅 Ocean Perspective View** - Immersive full-screen ocean scene with sky, horizon, and perspective depth
- **🌊 Realistic Ocean Simulation** - Beautiful WebGL-rendered water with dynamic waves
- **☁️ Atmospheric Sky** - Gradient sky with subtle clouds and sun glow at horizon
- **💧 Interactive Ripples** - Hand movements generate realistic water ripples with perspective scaling
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

### Ocean Perspective View
The app creates a realistic ocean scene with:
- **Sky gradient** - Beautiful gradient from deep blue at top to light blue at horizon
- **Horizon line** - Clear separation between sky and ocean at 35% from top
- **Sun glow** - Warm atmospheric glow near the horizon
- **Subtle clouds** - Animated cloud patterns in the sky
- **Perspective depth** - Waves appear smaller and denser near the horizon, larger in foreground

### Ocean Simulation
The ocean background uses WebGL shaders to create:
- **Base waves** - Continuous animated water surface with perspective-adjusted frequencies
- **Dynamic ripples** - Physics-based ripple propagation with perspective scaling
- **Realistic colors** - Gradient from deep water to shallow water with foam on peaks
- **Atmospheric perspective** - Water darkens toward horizon for depth perception
- **Sky reflection** - Horizon area reflects the sky for added realism
- **Shimmer effects** - Light reflection simulation stronger in foreground

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
