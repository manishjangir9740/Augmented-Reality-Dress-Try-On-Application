// UI Controller - Handles all UI interactions and updates
class UIController {
    constructor() {
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            appContainer: document.getElementById('app-container'),
            arStatus: document.getElementById('ar-status'),
            statusText: document.getElementById('status-text'),
            statusDot: document.querySelector('.status-dot'),
            instructions: document.getElementById('instructions'),
            carousel: document.getElementById('dress-carousel'),
            carouselPrev: document.getElementById('carousel-prev'),
            carouselNext: document.getElementById('carousel-next'),
            flipCameraBtn: document.getElementById('flip-camera-btn'),
            saveBtn: document.getElementById('save-btn'),
            clearBtn: document.getElementById('clear-btn'),
            applyBtn: document.getElementById('apply-btn'),
            customizeBtn: document.getElementById('customize-btn'),
            customizationPanel: document.getElementById('customization-panel'),
            colorOptions: document.getElementById('color-options'),
            sizeOptions: document.getElementById('size-options'),
            accessoriesPanel: document.getElementById('accessories-panel'),
            accessoriesGrid: document.getElementById('accessories-grid'),
            selectionTitle: document.getElementById('selection-title')
        };

        this.selectedDress = null;
        this.selectedColor = null;
        this.selectedSize = 'M';
        this.selectedAccessories = [];
        this.currentTab = 'dresses';
        
        this.onDressSelectCallback = null;
        this.onClearCallback = null;
        this.onSaveCallback = null;
        this.onFlipCameraCallback = null;
        this.onColorChangeCallback = null;
        this.onSizeChangeCallback = null;
        this.onAccessorySelectCallback = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Carousel navigation
        this.elements.carouselPrev.addEventListener('click', () => this.scrollCarousel('left'));
        this.elements.carouselNext.addEventListener('click', () => this.scrollCarousel('right'));

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Button actions
        this.elements.flipCameraBtn.addEventListener('click', () => {
            if (this.onFlipCameraCallback) {
                this.onFlipCameraCallback();
            }
        });

        this.elements.saveBtn.addEventListener('click', () => {
            if (this.onSaveCallback) {
                this.onSaveCallback();
            }
        });

        this.elements.clearBtn.addEventListener('click', () => {
            this.clearSelection();
            if (this.onClearCallback) {
                this.onClearCallback();
            }
        });

        this.elements.applyBtn.addEventListener('click', () => {
            if (this.onSaveCallback) {
                this.onSaveCallback();
            }
        });

        this.elements.customizeBtn.addEventListener('click', () => {
            this.toggleCustomization();
        });

        // Hide instructions after timeout
        if (CONFIG.ui.showInstructions) {
            setTimeout(() => {
                this.hideInstructions();
            }, CONFIG.ui.instructionsTimeout);
        }
    }

    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        if (tab === 'accessories') {
            this.elements.carousel.style.display = 'none';
            this.elements.accessoriesPanel.style.display = 'block';
            this.elements.selectionTitle.textContent = 'Select Accessories';
        } else {
            this.elements.carousel.style.display = 'flex';
            this.elements.accessoriesPanel.style.display = 'none';
            this.elements.selectionTitle.textContent = 'Select Your Outfit';
        }
    }

    toggleCustomization() {
        const panel = this.elements.customizationPanel;
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    loadDressCatalog(dresses) {
        this.elements.carousel.innerHTML = '';

        dresses.forEach(dress => {
            const dressItem = document.createElement('div');
            dressItem.className = 'dress-item';
            dressItem.dataset.dressId = dress.id;

            dressItem.innerHTML = `
                <img src="${dress.thumbnail}" alt="${dress.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23ddd%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="dress-name">${dress.name}</div>
            `;

            dressItem.addEventListener('click', () => {
                this.selectDress(dress, dressItem);
            });

            this.elements.carousel.appendChild(dressItem);
        });
    }

    selectDress(dress, element) {
        document.querySelectorAll('.dress-item').forEach(item => {
            item.classList.remove('selected');
        });

        element.classList.add('selected');
        this.selectedDress = dress;

        // Show customization options
        if (dress.colors) {
            this.loadColorOptions(dress.colors);
            this.elements.customizeBtn.style.display = 'block';
        }

        if (this.onDressSelectCallback) {
            this.onDressSelectCallback(dress);
        }

        this.showToast(`${dress.name} selected`);
    }

    loadColorOptions(colors) {
        this.elements.colorOptions.innerHTML = '';
        colors.forEach((colorObj, index) => {
            const colorBtn = document.createElement('div');
            colorBtn.className = 'color-option';
            colorBtn.style.backgroundColor = colorObj.value;
            colorBtn.title = colorObj.name;
            if (index === 0) colorBtn.classList.add('selected');
            
            colorBtn.addEventListener('click', () => {
                document.querySelectorAll('.color-option').forEach(c => c.classList.remove('selected'));
                colorBtn.classList.add('selected');
                this.selectedColor = colorObj.value;
                if (this.onColorChangeCallback) {
                    this.onColorChangeCallback(colorObj.value);
                }
                this.showToast(colorObj.name);
            });
            
            this.elements.colorOptions.appendChild(colorBtn);
        });

        // Load size options
        this.loadSizeOptions();
    }

    loadSizeOptions() {
        this.elements.sizeOptions.innerHTML = '';
        CONFIG.sizes.forEach(size => {
            const sizeBtn = document.createElement('div');
            sizeBtn.className = 'size-option';
            sizeBtn.textContent = size;
            if (size === this.selectedSize) sizeBtn.classList.add('selected');
            
            sizeBtn.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(s => s.classList.remove('selected'));
                sizeBtn.classList.add('selected');
                this.selectedSize = size;
                if (this.onSizeChangeCallback) {
                    this.onSizeChangeCallback(size);
                }
            });
            
            this.elements.sizeOptions.appendChild(sizeBtn);
        });
    }

    loadAccessories(accessories) {
        this.elements.accessoriesGrid.innerHTML = '';
        accessories.forEach(accessory => {
            const item = document.createElement('div');
            item.className = 'accessory-item';
            item.innerHTML = `
                <img src="${accessory.thumbnail}" alt="${accessory.name}">
                <div class="accessory-name">${accessory.name}</div>
            `;
            
            item.addEventListener('click', () => {
                item.classList.toggle('selected');
                if (item.classList.contains('selected')) {
                    this.selectedAccessories.push(accessory);
                    if (this.onAccessorySelectCallback) {
                        this.onAccessorySelectCallback(accessory, 'add');
                    }
                } else {
                    this.selectedAccessories = this.selectedAccessories.filter(a => a.id !== accessory.id);
                    if (this.onAccessorySelectCallback) {
                        this.onAccessorySelectCallback(accessory, 'remove');
                    }
                }
            });
            
            this.elements.accessoriesGrid.appendChild(item);
        });
    }

    clearSelection() {
        document.querySelectorAll('.dress-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('.accessory-item').forEach(item => {
            item.classList.remove('selected');
        });
        this.selectedDress = null;
        this.selectedAccessories = [];
        this.elements.customizeBtn.style.display = 'none';
        this.elements.customizationPanel.style.display = 'none';
    }

    scrollCarousel(direction) {
        const scrollAmount = 150;
        const currentScroll = this.elements.carousel.scrollLeft;

        if (direction === 'left') {
            this.elements.carousel.scrollLeft = currentScroll - scrollAmount;
        } else {
            this.elements.carousel.scrollLeft = currentScroll + scrollAmount;
        }
    }

    updateARStatus(detected) {
        if (detected) {
            this.elements.statusDot.classList.add('active');
            this.elements.statusText.textContent = 'Body detected';
        } else {
            this.elements.statusDot.classList.remove('active');
            this.elements.statusText.textContent = 'Detecting body...';
        }
    }

    hideLoading() {
        this.elements.loadingScreen.style.display = 'none';
        this.elements.appContainer.style.display = 'flex';
    }

    showLoading() {
        this.elements.loadingScreen.style.display = 'flex';
        this.elements.appContainer.style.display = 'none';
    }

    hideInstructions() {
        if (this.elements.instructions) {
            this.elements.instructions.style.opacity = '0';
            setTimeout(() => {
                this.elements.instructions.style.display = 'none';
            }, 300);
        }
    }

    showToast(message, duration = CONFIG.ui.toastDuration) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    onDressSelect(callback) {
        this.onDressSelectCallback = callback;
    }

    onClear(callback) {
        this.onClearCallback = callback;
    }

    onSave(callback) {
        this.onSaveCallback = callback;
    }

    onFlipCamera(callback) {
        this.onFlipCameraCallback = callback;
    }

    onColorChange(callback) {
        this.onColorChangeCallback = callback;
    }

    onSizeChange(callback) {
        this.onSizeChangeCallback = callback;
    }

    onAccessorySelect(callback) {
        this.onAccessorySelectCallback = callback;
    }

    showError(message) {
        this.hideLoading();
        alert('Error: ' + message);
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}

