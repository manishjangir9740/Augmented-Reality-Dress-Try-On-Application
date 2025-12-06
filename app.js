// Main Application Controller
class ARVirtualTryOnApp {
    constructor() {
        this.bodyDetection = null;
        this.dressOverlay = null;
        this.ui = null;
        this.isRunning = false;
        this.currentBodyDimensions = null;
        this.frameCount = 0;
        this.skipFrames = 1; // Skip 1 frame = process every 2nd frame for better performance
    }

    async initialize() {
        try {
            // Initialize UI Controller
            this.ui = new UIController();

            // Get DOM elements
            const videoElement = document.getElementById('camera-feed');
            const canvasElement = document.getElementById('output-canvas');

            // Generate images for all dresses
            await this.generateDressImages();

            // Generate images for all accessories
            await this.generateAccessoryImages();

            // Initialize Body Detection
            this.bodyDetection = new BodyDetection();
            const initSuccess = await this.bodyDetection.initialize(videoElement, canvasElement);

            if (!initSuccess) {
                throw new Error('Failed to initialize body detection');
            }

            // Initialize Dress Overlay
            this.dressOverlay = new DressOverlay(canvasElement);

            // Set up callbacks
            this.setupCallbacks();

            // Load dress catalog
            this.ui.loadDressCatalog(CONFIG.dresses);

            // Load accessories
            if (CONFIG.accessories) {
                this.ui.loadAccessories(CONFIG.accessories);
            }

            // Preload all dress images
            await this.dressOverlay.preloadAllDresses(CONFIG.dresses);

            // Start detection
            await this.bodyDetection.startDetection();

            // Hide loading screen
            this.ui.hideLoading();

            this.isRunning = true;

            console.log('AR Virtual Try-On System initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showError('Failed to initialize AR system. Please check camera permissions.');
        }
    }

    setupCallbacks() {
        // Body detection results callback
        this.bodyDetection.setResultsCallback((results) => {
            this.onBodyDetectionResults(results);
        });

        // UI callbacks
        this.ui.onDressSelect((dress) => {
            this.onDressSelected(dress);
        });

        this.ui.onClear(() => {
            this.onClearDress();
        });

        this.ui.onSave(() => {
            this.onSavePhoto();
        });

        this.ui.onFlipCamera(() => {
            this.onFlipCamera();
        });

        this.ui.onColorChange((color) => {
            this.onColorChange(color);
        });

        this.ui.onSizeChange((size) => {
            this.onSizeChange(size);
        });

        this.ui.onAccessorySelect((accessory, action) => {
            this.onAccessorySelect(accessory, action);
        });
    }

    onBodyDetectionResults(results) {
        if (!this.isRunning) return;

        // Frame skipping for performance (if enabled)
        this.frameCount++;
        if (this.frameCount % (this.skipFrames + 1) !== 0) {
            return;
        }

        // Update AR status
        this.ui.updateARStatus(results.detected);

        // Clear canvas
        this.dressOverlay.clear();

        // If body detected, get dimensions and render
        if (results.detected) {
            this.currentBodyDimensions = this.bodyDetection.getBodyDimensions();
            
            if (this.currentBodyDimensions) {
                // Render dress if selected
                if (this.dressOverlay.getCurrentDress()) {
                    this.dressOverlay.renderDress(this.currentBodyDimensions);
                } else {
                    // Render accessories even without dress
                    this.dressOverlay.renderAccessories(this.currentBodyDimensions);
                }
            }
        } else {
            this.currentBodyDimensions = null;
        }
    }

    async onDressSelected(dress) {
        try {
            // Load dress with base color
            await this.dressOverlay.loadDress(dress, dress.baseColor);
            console.log('Dress loaded:', dress.name);
        } catch (error) {
            console.error('Error loading dress:', error);
            this.ui.showToast('Failed to load dress');
        }
    }

    onClearDress() {
        this.dressOverlay.loadDress(null);
        this.dressOverlay.clearAccessories();
        this.ui.showToast('All cleared');
    }

    async onColorChange(color) {
        await this.dressOverlay.setColor(color);
        this.ui.showToast('Color changed');
    }

    onSizeChange(size) {
        this.dressOverlay.setSize(size);
        this.ui.showToast(`Size: ${size}`);
    }

    onAccessorySelect(accessory, action) {
        if (action === 'add') {
            this.dressOverlay.addAccessory(accessory);
            this.ui.showToast(`${accessory.name} added`);
        } else {
            this.dressOverlay.removeAccessory(accessory.id);
            this.ui.showToast(`${accessory.name} removed`);
        }
    }

    async onSavePhoto() {
        try {
            const canvas = document.getElementById('output-canvas');
            const video = document.getElementById('camera-feed');

            // Create a temporary canvas to combine video and overlay
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            // Draw video frame (mirrored)
            tempCtx.save();
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.restore();

            // Draw overlay
            tempCtx.drawImage(canvas, 0, 0);

            // Convert to blob and download
            tempCanvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ar-tryon-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);

                this.ui.showToast('Photo saved successfully! 📸');
            }, 'image/png');
        } catch (error) {
            console.error('Error saving photo:', error);
            this.ui.showToast('Failed to save photo');
        }
    }

    async onFlipCamera() {
        try {
            this.ui.showToast('Flipping camera...');
            await this.bodyDetection.flipCamera();
        } catch (error) {
            console.error('Error flipping camera:', error);
            this.ui.showToast('Failed to flip camera');
        }
    }

    async generateDressImages() {
        // First, try to load custom images from dresses folder
        await this.loadCustomDresses();
        
        // Then generate default dresses
        CONFIG.dresses.forEach(dress => {
            if (!dress.isCustom) {
                // Generate thumbnail
                dress.thumbnail = ImageGenerator.generateDressImage(dress.baseColor, dress.type, 'thumb');
                // Generate full image
                dress.overlay = ImageGenerator.generateDressImage(dress.baseColor, dress.type, 'full');
            }
        });
    }

    async loadCustomDresses() {
        try {
            // List ALL custom dress images in assets/dresses folder
            const customDressFiles = [
                'images.png',
                'blazer.png'
                // Add more as you upload new images
            ];
            
            let customId = 100; // Start custom IDs from 100
            const customDresses = [];
            
            customDressFiles.forEach(fileName => {
                const name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
                
                customDresses.push({
                    id: customId++,
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    type: 'dress',
                    baseColor: '#000000',
                    isCustom: true,
                    thumbnail: `assets/dresses/${fileName}`,
                    overlay: `assets/dresses/${fileName}`,
                    colors: [
                        { name: 'Original', value: null }
                    ]
                });
            });
            
            // Insert custom dresses at the beginning of the array
            CONFIG.dresses.unshift(...customDresses);
        } catch (error) {
            console.log('Error loading custom dresses:', error);
        }
    }

    async generateAccessoryImages() {
        CONFIG.accessories.forEach(accessory => {
            // Generate thumbnail
            accessory.thumbnail = ImageGenerator.generateAccessoryImage(accessory.type, accessory.color);
            // Generate overlay
            accessory.overlay = ImageGenerator.generateAccessoryImage(accessory.type, accessory.color);
        });
    }

    stop() {
        this.isRunning = false;
        if (this.bodyDetection) {
            this.bodyDetection.stop();
        }
    }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', async () => {
    app = new ARVirtualTryOnApp();
    await app.initialize();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.stop();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARVirtualTryOnApp;
}

