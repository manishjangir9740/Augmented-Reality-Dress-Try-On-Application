// Configuration file for AR Virtual Try-On System

const CONFIG = {
    // Camera settings (Optimized for performance)
    camera: {
        width: 480,
        height: 360,
        facingMode: 'user', // 'user' for front camera, 'environment' for back
        frameRate: 24
    },

    // MediaPipe Pose detection settings (optimized for performance)
    pose: {
        modelComplexity: 0, // 0 = fastest, 1 = balanced, 2 = most accurate
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    },

    // Dress overlay settings (Performance optimized)
    overlay: {
        smoothingFactor: 0, // Disabled for maximum performance
        scaleFactor: 1.0, // Base dress size multiplier
        offsetY: 0, // Vertical offset adjustment (not used in direct positioning)
        opacity: 0.95, // Dress opacity for better visibility
        sizeMultipliers: {
            'XS': 0.8,
            'S': 0.9,
            'M': 1.0,
            'L': 1.1,
            'XL': 1.2,
            'XXL': 1.3
        }
    },

    // Available dresses catalog (Reduced for faster loading)
    dresses: [
        {
            id: 1,
            name: 'Red Dress',
            type: 'dress',
            baseColor: '#ff3366',
            colors: [
                { name: 'Rose Red', value: '#ff3366' },
                { name: 'Dark Red', value: '#cc0033' },
                { name: 'Pink', value: '#ff6699' }
            ]
        },
        // {
        //     id: 2,
        //     name: 'Blue Gown',
        //     type: 'gown',
        //     baseColor: '#3366ff',
        //     colors: [
        //         { name: 'Royal Blue', value: '#3366ff' },
        //         { name: 'Navy', value: '#000080' },
        //         { name: 'Sky Blue', value: '#87ceeb' }
        //     ]
        // },
        // {
        //     id: 3,
        //     name: 'Black Suit',
        //     type: 'suit',
        //     baseColor: '#333333',
        //     colors: [
        //         { name: 'Black', value: '#000000' },
        //         { name: 'Gray', value: '#666666' }
        //     ]
        // },
        // {
        //     id: 4,
        //     name: 'Pink Dress',
        //     type: 'dress',
        //     baseColor: '#ffb3d9',
        //     colors: [
        //         { name: 'Pink', value: '#ffb3d9' },
        //         { name: 'Hot Pink', value: '#ff69b4' }
        //     ]
        // },
        // {
        //     id: 5,
        //     name: 'Green Top',
        //     type: 'top',
        //     baseColor: '#66cc99',
        //     colors: [
        //         { name: 'Green', value: '#66cc99' },
        //         { name: 'Mint', value: '#98ff98' }
        //     ]
        // }
    ],

    // Accessories catalog (Reduced for faster loading)
    accessories: [
        {
            id: 'glasses1',
            name: 'Sunglasses',
            type: 'glasses',
            color: '#000000',
            anchorPoint: 'eyes'
        },
        {
            id: 'hat1',
            name: 'Black Cap',
            type: 'cap',
            color: '#000000',
            anchorPoint: 'head'
        },
        {
            id: 'hat2',
            name: 'Hat',
            type: 'hat',
            color: '#8b4513',
            anchorPoint: 'head'
        }
    ],

    // Size options
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    
    // Default size
    defaultSize: 'M',

    // UI settings
    ui: {
        showInstructions: true,
        instructionsTimeout: 10000, // Hide after 10 seconds
        toastDuration: 3000
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

