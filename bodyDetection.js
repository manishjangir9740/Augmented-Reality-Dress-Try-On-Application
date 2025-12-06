// Body Detection using MediaPipe Pose
class BodyDetection {
    constructor() {
        this.pose = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasCtx = null;
        this.isInitialized = false;
        this.landmarks = null;
        this.lastLandmarks = null;
        this.smoothingFactor = CONFIG.overlay.smoothingFactor;
        this.onResultsCallback = null;
    }

    async initialize(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.canvasCtx = canvasElement.getContext('2d');

        try {
            // Initialize MediaPipe Pose
            this.pose = new Pose({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
                }
            });

            this.pose.setOptions(CONFIG.pose);

            // Set up results callback
            this.pose.onResults((results) => this.onResults(results));

            // Initialize camera
            await this.initializeCamera();

            this.isInitialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing body detection:', error);
            return false;
        }
    }

    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: CONFIG.camera.width,
                    height: CONFIG.camera.height,
                    facingMode: CONFIG.camera.facingMode,
                    frameRate: CONFIG.camera.frameRate
                },
                audio: false
            });

            this.videoElement.srcObject = stream;
            
            return new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    this.videoElement.play();
                    this.canvasElement.width = this.videoElement.videoWidth;
                    this.canvasElement.height = this.videoElement.videoHeight;
                    resolve();
                };
            });
        } catch (error) {
            console.error('Error accessing camera:', error);
            throw error;
        }
    }

    async startDetection() {
        if (!this.isInitialized) {
            console.error('Body detection not initialized');
            return;
        }

        // Start camera processing
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                await this.pose.send({ image: this.videoElement });
            },
            width: CONFIG.camera.width,
            height: CONFIG.camera.height
        });

        await this.camera.start();
    }

    onResults(results) {
        // Store landmarks with optional smoothing (optimized)
        if (results.poseLandmarks) {
            // Skip smoothing if factor is 0 for better performance
            if (this.smoothingFactor > 0 && this.lastLandmarks) {
                // Apply smoothing to reduce jitter
                this.landmarks = this.smoothLandmarks(
                    results.poseLandmarks,
                    this.lastLandmarks
                );
            } else {
                // Direct assignment - fastest
                this.landmarks = results.poseLandmarks;
            }
            this.lastLandmarks = this.landmarks;
        } else {
            this.landmarks = null;
        }

        // Callback to main app with results
        if (this.onResultsCallback) {
            this.onResultsCallback({
                landmarks: this.landmarks,
                image: results.image,
                detected: !!this.landmarks
            });
        }
    }

    smoothLandmarks(current, previous) {
        if (!previous) return current;

        return current.map((landmark, index) => {
            const prev = previous[index];
            return {
                x: landmark.x * (1 - this.smoothingFactor) + prev.x * this.smoothingFactor,
                y: landmark.y * (1 - this.smoothingFactor) + prev.y * this.smoothingFactor,
                z: landmark.z * (1 - this.smoothingFactor) + prev.z * this.smoothingFactor,
                visibility: landmark.visibility
            };
        });
    }

    getLandmarks() {
        return this.landmarks;
    }

    // Get specific body points
    getBodyPoints() {
        if (!this.landmarks) return null;

        return {
            // Face
            nose: this.landmarks[0],
            leftEye: this.landmarks[2],
            rightEye: this.landmarks[5],
            leftEar: this.landmarks[7],
            rightEar: this.landmarks[8],

            // Shoulders
            leftShoulder: this.landmarks[11],
            rightShoulder: this.landmarks[12],

            // Arms
            leftElbow: this.landmarks[13],
            rightElbow: this.landmarks[14],
            leftWrist: this.landmarks[15],
            rightWrist: this.landmarks[16],

            // Torso
            leftHip: this.landmarks[23],
            rightHip: this.landmarks[24],

            // Legs
            leftKnee: this.landmarks[25],
            rightKnee: this.landmarks[26],
            leftAnkle: this.landmarks[27],
            rightAnkle: this.landmarks[28]
        };
    }

    // Calculate body dimensions for dress fitting
    getBodyDimensions() {
        const points = this.getBodyPoints();
        if (!points) return null;

        const width = this.canvasElement.width;
        const height = this.canvasElement.height;

        // Calculate shoulder width
        const shoulderWidth = Math.hypot(
            (points.leftShoulder.x - points.rightShoulder.x) * width,
            (points.leftShoulder.y - points.rightShoulder.y) * height
        );

        // Calculate torso height (shoulder center to hip center)
        const shoulderCenterY = (points.leftShoulder.y + points.rightShoulder.y) / 2;
        const hipCenterY = (points.leftHip.y + points.rightHip.y) / 2;
        const torsoHeight = Math.abs((hipCenterY - shoulderCenterY) * height);

        // Calculate center point between shoulders
        const shoulderCenter = {
            x: (points.leftShoulder.x + points.rightShoulder.x) / 2,
            y: (points.leftShoulder.y + points.rightShoulder.y) / 2
        };

        // Calculate body angle (shoulder tilt from horizontal)
        // Using atan2(dy, dx) to get the angle from horizontal
        let bodyAngle = Math.atan2(
            points.rightShoulder.y - points.leftShoulder.y,
            points.rightShoulder.x - points.leftShoulder.x
        );

        // Calculate body rotation (front/side view detection)
        const shoulderDepth = Math.abs(points.leftShoulder.z - points.rightShoulder.z);
        const hipDepth = Math.abs(points.leftHip.z - points.rightHip.z);
        const avgDepth = (shoulderDepth + hipDepth) / 2;

        // Visibility check
        const visibility = (
            points.leftShoulder.visibility +
            points.rightShoulder.visibility +
            points.leftHip.visibility +
            points.rightHip.visibility
        ) / 4;

        return {
            shoulderWidth,
            torsoHeight,
            shoulderCenter,
            bodyAngle,
            width,
            height,
            points,
            depth: avgDepth,
            visibility
        };
    }

    setResultsCallback(callback) {
        this.onResultsCallback = callback;
    }

    async flipCamera() {
        const currentMode = CONFIG.camera.facingMode;
        CONFIG.camera.facingMode = currentMode === 'user' ? 'environment' : 'user';

        // Stop current camera
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }

        // Reinitialize with new facing mode
        await this.initializeCamera();
        await this.startDetection();
    }

    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BodyDetection;
}

