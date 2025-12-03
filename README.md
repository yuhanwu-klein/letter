# Hand Movement Tracker

A web-based hand tracking application using MediaPipe Hands that tracks hand movements through your webcam in real-time.

## Features

- **Real-time hand tracking** using MediaPipe Hands
- **Multi-hand support** - tracks up to 2 hands simultaneously
- **Visual feedback** with skeleton overlay on video feed
- **Color-coded hands** - Left hand (green), Right hand (red)
- **Live statistics** - FPS counter and hand count
- **Landmark coordinates** - Real-time display of key hand landmarks (wrist, fingertips)
- **Start/Stop controls** - Toggle tracking on/off

## How to Use

### Option 1: Open Directly in Browser

1. Simply open `index.html` in a modern web browser (Chrome, Firefox, Edge, Safari)
2. Allow camera access when prompted
3. Show your hand(s) to the camera
4. Watch the skeleton tracking overlay appear on your hands!

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

- **MediaPipe Hands** - Google's hand tracking solution
- **Vanilla JavaScript** - No frameworks required
- **HTML5 Canvas** - For drawing hand landmarks
- **WebRTC** - For webcam access

## Controls

- **Stop/Start Tracking Button** - Toggle hand tracking on/off
- The video feed is mirrored for a natural experience

## Hand Landmarks

The app displays coordinates for 6 key landmarks per hand:
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
