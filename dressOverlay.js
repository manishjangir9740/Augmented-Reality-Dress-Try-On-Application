// Dress Overlay System - Handles rendering dresses on detected body
class DressOverlay {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.currentDress = null;
        this.dressImage = null;
        this.isLoading = false;
        this.imageCache = new Map();
        this.currentColor = null;
        this.currentSize = 'M';
        this.accessories = [];
        this.accessoryImages = new Map();
    }

    async loadDress(dressData, color = null) {
        if (!dressData) {
            this.currentDress = null;
            this.dressImage = null;
            return;
        }

        this.isLoading = true;
        this.currentDress = dressData;

        // Check if it's a custom image
        if (dressData.isCustom) {
            // Load custom image directly
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    this.dressImage = img;
                    this.imageCache.set(dressData.id, img);
                    this.isLoading = false;
                    resolve();
                };

                img.onerror = () => {
                    console.error('Failed to load custom dress image');
                    this.isLoading = false;
                    reject(new Error('Failed to load custom dress image'));
                };

                img.src = dressData.overlay;
            });
        }

        // Use selected color or base color for generated dresses
        const selectedColor = color || dressData.baseColor;
        const cacheKey = `${dressData.id}_${selectedColor}`;

        // Check cache first
        if (this.imageCache.has(cacheKey)) {
            this.dressImage = this.imageCache.get(cacheKey);
            this.isLoading = false;
            return;
        }

        // Generate new dress image with selected color
        const imageData = ImageGenerator.generateDressImage(selectedColor, dressData.type, 'full');

        // Load image
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.dressImage = img;
                this.imageCache.set(cacheKey, img);
                this.isLoading = false;
                resolve();
            };

            img.onerror = () => {
                console.error('Failed to load dress image');
                this.isLoading = false;
                reject(new Error('Failed to load dress image'));
            };

            img.src = imageData;
        });
    }

    renderDress(bodyDimensions) {
        if (!this.dressImage || !bodyDimensions || this.isLoading) {
            return;
        }

        const ctx = this.ctx;
        const { shoulderWidth, shoulderCenter, points, width, height, torsoHeight } = bodyDimensions;

        ctx.save();

        // Get actual body landmarks in pixels
        const leftShoulder = { x: points.leftShoulder.x * width, y: points.leftShoulder.y * height };
        const rightShoulder = { x: points.rightShoulder.x * width, y: points.rightShoulder.y * height };
        const leftHip = { x: points.leftHip.x * width, y: points.leftHip.y * height };
        const rightHip = { x: points.rightHip.x * width, y: points.rightHip.y * height };
        
        // Calculate positions
        const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
        const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipCenterY = (leftHip.y + rightHip.y) / 2;

        // Apply size multiplier
        const sizeMultiplier = CONFIG.overlay.sizeMultipliers[this.currentSize] || 1.0;
        
        // Make dress wider to cover body properly
        const dressWidth = shoulderWidth * 2.0 * CONFIG.overlay.scaleFactor * sizeMultiplier;
        const aspectRatio = this.dressImage.height / this.dressImage.width;
        let dressHeight = dressWidth * aspectRatio;
        
        // Ensure dress covers from shoulders to well below hips
        const bodyLength = hipCenterY - shoulderCenterY;
        if (dressHeight < bodyLength * 0.5) {
            dressHeight = bodyLength * 0.5;
        }

        // Position dress
        // The dress image has neckline at ~2-5% from top
        // Align that neckline (not the very top) with the body's shoulder/neck area
        const dressNecklineOffset = dressHeight * 0.20; // 3% from top is the neckline
        const dressLeft = shoulderCenterX - (dressWidth / 2);
        const dressTop = shoulderCenterY - dressNecklineOffset; // Move up so neckline aligns with shoulders

        ctx.globalAlpha = CONFIG.overlay.opacity;

        // Draw dress directly - no rotation, just proper positioning
        ctx.drawImage(
            this.dressImage,
            dressLeft,      // Center horizontally
            dressTop,       // Align neckline with shoulders
            dressWidth,
            dressHeight
        );

        ctx.restore();

        // Render accessories
        this.renderAccessories(bodyDimensions);
    }

    getHueRotation(color) {
        const colors = {
            '#ff3366': 0,
            '#cc0033': 20,
            '#ff6699': -20,
            '#ff0033': 10
        };
        return colors[color] || 0;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getCurrentDress() {
        return this.currentDress;
    }

    // Advanced rendering with body shape fitting and angle support
    renderAdvancedDress(bodyDimensions) {
        if (!this.dressImage || !bodyDimensions || this.isLoading) {
            return;
        }

        const ctx = this.ctx;
        const { points, width, height, bodyAngle } = bodyDimensions;

        ctx.save();

        try {
            // Get key body points in pixel coordinates
            const leftShoulder = { x: points.leftShoulder.x * width, y: points.leftShoulder.y * height };
            const rightShoulder = { x: points.rightShoulder.x * width, y: points.rightShoulder.y * height };
            const leftHip = { x: points.leftHip.x * width, y: points.leftHip.y * height };
            const rightHip = { x: points.rightHip.x * width, y: points.rightHip.y * height };

            // Calculate shoulder center (this is where dress should start)
            const shoulderCenterX = (leftShoulder.x + rightShoulder.x) / 2;
            const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
            
            // Calculate hip center
            const hipCenterY = (leftHip.y + rightHip.y) / 2;

            // Calculate measurements
            const shoulderWidth = Math.hypot(
                rightShoulder.x - leftShoulder.x,
                rightShoulder.y - leftShoulder.y
            );
            
            const torsoHeight = hipCenterY - shoulderCenterY;
            
            // Calculate 3D depth for perspective
            const shoulderDepth = Math.abs(points.leftShoulder.z - points.rightShoulder.z);
            const perspectiveScale = Math.max(0.65, 1 - (shoulderDepth * 0.7));
            
            // Apply size multiplier
            const sizeMultiplier = CONFIG.overlay.sizeMultipliers[this.currentSize] || 1.0;
            
            // Calculate dress dimensions
            const dressWidth = shoulderWidth * 2.2 * CONFIG.overlay.scaleFactor * sizeMultiplier * perspectiveScale;
            const aspectRatio = this.dressImage.height / this.dressImage.width;
            let dressHeight = dressWidth * aspectRatio;
            
            // Ensure dress covers full torso + extra
            if (dressHeight < torsoHeight * 1.8) {
                dressHeight = torsoHeight * 1.8;
            }

            // Calculate final dimensions with perspective
            const finalWidth = dressWidth * perspectiveScale;
            const finalHeight = dressHeight * perspectiveScale;
            
            // Align dress neckline with body shoulders
            const dressNecklineOffset = finalHeight * 0.03; // 3% from top is the neckline
            const dressLeft = shoulderCenterX - (finalWidth / 2);
            const dressTop = shoulderCenterY - dressNecklineOffset;
            
            ctx.globalAlpha = CONFIG.overlay.opacity;

            // Draw dress directly - no rotation, proper body alignment
            ctx.drawImage(
                this.dressImage,
                dressLeft,       // Center horizontally
                dressTop,        // Align neckline with shoulders
                finalWidth,
                finalHeight
            );
        } catch (error) {
            console.error('Error in advanced dress rendering:', error);
        }

        ctx.restore();

        // Render accessories
        this.renderAccessories(bodyDimensions);
    }

    renderAccessories(bodyDimensions) {
        if (!bodyDimensions || this.accessories.length === 0) return;

        const { points, width, height } = bodyDimensions;
        const ctx = this.ctx;

        this.accessories.forEach(accessory => {
            const img = this.accessoryImages.get(accessory.id);
            if (!img) return;

            ctx.save();

            try {
                if (accessory.anchorPoint === 'eyes') {
                    // Glasses - position between eyes
                    const leftEye = { x: points.leftEye.x * width, y: points.leftEye.y * height };
                    const rightEye = { x: points.rightEye.x * width, y: points.rightEye.y * height };
                    const centerX = (leftEye.x + rightEye.x) / 2;
                    const centerY = (leftEye.y + rightEye.y) / 2;
                    const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
                    
                    // Calculate eye angle for proper rotation - negate because video is mirrored
                    const eyeAngle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

                    ctx.globalAlpha = 0.9;
                    ctx.translate(centerX, centerY);
                    ctx.rotate(-eyeAngle);
                    ctx.drawImage(img, -eyeDistance * 0.9, -eyeDistance * 0.3, eyeDistance * 1.8, eyeDistance * 0.6);
                } else if (accessory.anchorPoint === 'head') {
                    // Hat - position above head
                    const nose = { x: points.nose.x * width, y: points.nose.y * height };
                    const leftEar = { x: points.leftEar.x * width, y: points.leftEar.y * height };
                    const rightEar = { x: points.rightEar.x * width, y: points.rightEar.y * height };
                    const headWidth = Math.hypot(rightEar.x - leftEar.x, rightEar.y - leftEar.y) * 1.3;
                    
                    // Calculate head tilt - negate because video is mirrored
                    const headAngle = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);

                    ctx.globalAlpha = 0.95;
                    ctx.translate(nose.x, nose.y - headWidth * 0.5);
                    ctx.rotate(-headAngle);
                    ctx.drawImage(img, -headWidth * 0.6, -headWidth * 0.5, headWidth * 1.2, headWidth * 0.7);
                }
            } catch (error) {
                console.error('Error rendering accessory:', error);
            }

            ctx.restore();
        });
    }

    addAccessory(accessory) {
        if (!this.accessories.find(a => a.id === accessory.id)) {
            this.accessories.push(accessory);
            this.loadAccessoryImage(accessory);
        }
    }

    removeAccessory(accessoryId) {
        this.accessories = this.accessories.filter(a => a.id !== accessoryId);
    }

    clearAccessories() {
        this.accessories = [];
    }

    async loadAccessoryImage(accessory) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.accessoryImages.set(accessory.id, img);
                resolve();
            };

            img.onerror = () => {
                console.warn('Failed to load accessory:', accessory.name);
                resolve();
            };

            img.src = accessory.overlay;
        });
    }

    async setColor(color) {
        this.currentColor = color;
        // Reload dress with new color
        if (this.currentDress) {
            await this.loadDress(this.currentDress, color);
        }
    }

    setSize(size) {
        this.currentSize = size;
    }

    // Preload all dress images for smooth switching
    async preloadAllDresses(dresses) {
        const promises = dresses.map(dress => {
            return new Promise((resolve) => {
                if (this.imageCache.has(dress.id)) {
                    resolve();
                    return;
                }

                const img = new Image();
                img.crossOrigin = 'anonymous';
                
                img.onload = () => {
                    this.imageCache.set(dress.id, img);
                    resolve();
                };

                img.onerror = () => {
                    console.warn('Failed to preload dress:', dress.name);
                    resolve(); // Don't reject, just continue
                };

                img.src = dress.overlay;
            });
        });

        await Promise.all(promises);
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DressOverlay;
}

