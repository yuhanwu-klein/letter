const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const handCountEl = document.getElementById('handCount');
const rippleCountEl = document.getElementById('rippleCount');
const fpsEl = document.getElementById('fps');
const toggleBtn = document.getElementById('toggleBtn');
const landmarksDataEl = document.getElementById('landmarksData');

let isTracking = true;
let lastTime = Date.now();
let frameCount = 0;
let fps = 0;

// Track previous hand positions for movement detection
let previousHandPositions = [];
const movementThreshold = 0.02; // Minimum movement to trigger ripple

// Initialize MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Initialize camera
const camera = new Camera(video, {
    onFrame: async () => {
        if (isTracking) {
            await hands.send({ image: video });
        }
    },
    width: 640,
    height: 480
});

// Start camera
camera.start().then(() => {
    statusEl.textContent = '🌊 Camera ready! Move your hands to create ripples';
    statusEl.style.color = '#006994';
}).catch((error) => {
    statusEl.textContent = 'Error: ' + error.message;
    statusEl.style.color = '#dc3545';
    console.error('Camera error:', error);
});

// Handle results from MediaPipe
function onResults(results) {
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update hand count
    const handCount = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
    handCountEl.textContent = handCount;

    // Track current hand positions
    const currentHandPositions = [];

    // Draw results
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            const handedness = results.multiHandedness[i].label;

            // Get palm center (landmark 0 - wrist)
            const palmCenter = landmarks[0];
            currentHandPositions.push({
                x: palmCenter.x,
                y: palmCenter.y,
                handedness: handedness
            });

            // Check for movement and create ripples
            if (waterSim && previousHandPositions[i]) {
                const prevPos = previousHandPositions[i];
                const dx = palmCenter.x - prevPos.x;
                const dy = palmCenter.y - prevPos.y;
                const movement = Math.sqrt(dx * dx + dy * dy);

                // If hand moved significantly, create ripples
                if (movement > movementThreshold) {
                    // Map hand position to screen coordinates
                    const screenX = palmCenter.x * window.innerWidth;
                    const screenY = palmCenter.y * window.innerHeight;
                    waterSim.addRipple(screenX, screenY);

                    // Add ripples at fingertips for more dramatic effect
                    const fingertips = [4, 8, 12, 16, 20]; // Thumb, index, middle, ring, pinky
                    fingertips.forEach(tipIdx => {
                        const tip = landmarks[tipIdx];
                        const tipX = tip.x * window.innerWidth;
                        const tipY = tip.y * window.innerHeight;
                        waterSim.addRipple(tipX, tipY);
                    });
                }
            }

            // Draw connections
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
                color: handedness === 'Left' ? '#00FF00' : '#FF0000',
                lineWidth: 5
            });

            // Draw landmarks
            drawLandmarks(ctx, landmarks, {
                color: handedness === 'Left' ? '#00FF00' : '#FF0000',
                fillColor: handedness === 'Left' ? '#FFFFFF' : '#FFFF00',
                lineWidth: 2,
                radius: 5
            });

            // Display landmark data
            displayLandmarkData(landmarks, handedness, i);
        }
    } else {
        landmarksDataEl.innerHTML = '<p style="color: #999;">No hands detected</p>';
    }

    // Update previous positions
    previousHandPositions = currentHandPositions;

    // Update ripple count
    if (waterSim) {
        rippleCountEl.textContent = waterSim.getRippleCount();
    }

    ctx.restore();

    // Update FPS
    updateFPS();
}

// Display landmark coordinates
function displayLandmarkData(landmarks, handedness, handIndex) {
    if (handIndex === 0) {
        landmarksDataEl.innerHTML = '';
    }

    const handDiv = document.createElement('div');
    handDiv.style.marginBottom = '15px';

    const handTitle = document.createElement('h4');
    handTitle.textContent = `${handedness} Hand`;
    handTitle.style.color = handedness === 'Left' ? '#00AA00' : '#AA0000';
    handDiv.appendChild(handTitle);

    // Display key landmarks (wrist, thumb tip, index tip, middle tip, ring tip, pinky tip)
    const keyLandmarks = [0, 4, 8, 12, 16, 20];
    const landmarkNames = ['Wrist', 'Thumb Tip', 'Index Tip', 'Middle Tip', 'Ring Tip', 'Pinky Tip'];

    keyLandmarks.forEach((idx, i) => {
        const landmark = landmarks[idx];
        const landmarkDiv = document.createElement('div');
        landmarkDiv.className = 'landmark-item';
        landmarkDiv.textContent = `${landmarkNames[i]}: x=${landmark.x.toFixed(3)}, y=${landmark.y.toFixed(3)}, z=${landmark.z.toFixed(3)}`;
        handDiv.appendChild(landmarkDiv);
    });

    landmarksDataEl.appendChild(handDiv);
}

// Calculate and update FPS
function updateFPS() {
    frameCount++;
    const currentTime = Date.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
        fps = Math.round((frameCount * 1000) / elapsed);
        fpsEl.textContent = fps;
        frameCount = 0;
        lastTime = currentTime;
    }
}

// Toggle tracking
toggleBtn.addEventListener('click', () => {
    isTracking = !isTracking;
    toggleBtn.textContent = isTracking ? 'Stop Tracking' : 'Start Tracking';
    toggleBtn.style.background = isTracking ? 'linear-gradient(135deg, #006994 0%, #0099cc 100%)' : '#dc3545';

    if (!isTracking) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        handCountEl.textContent = '0';
        rippleCountEl.textContent = '0';
        landmarksDataEl.innerHTML = '<p style="color: #999;">Tracking stopped</p>';
        previousHandPositions = [];
    }
});

// Resize canvas when window resizes
window.addEventListener('resize', () => {
    if (video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    }
});
