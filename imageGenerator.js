// Image Generator for Dresses and Accessories
class ImageGenerator {
    static generateDressImage(color, type, size = 'full') {
        const canvas = document.createElement('canvas');
        const width = size === 'thumb' ? 200 : 600;
        const height = size === 'thumb' ? 300 : 800;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, this.lightenColor(color, 15));
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, this.darkenColor(color, 15));

        ctx.fillStyle = gradient;

        // Draw dress shape based on type with better proportions
        ctx.beginPath();
        if (type === 'dress' || type === 'gown') {
            // More realistic dress shape with fitted bodice - drawing top to bottom
            // Neckline/shoulders at top
            ctx.moveTo(width * 0.4, height * 0.02);
            // Left shoulder
            ctx.quadraticCurveTo(width * 0.35, height * 0.05, width * 0.3, height * 0.1);
            // Left side to waist
            ctx.quadraticCurveTo(width * 0.28, height * 0.25, width * 0.27, height * 0.4);
            // Waist to hip
            ctx.quadraticCurveTo(width * 0.25, height * 0.5, width * 0.23, height * 0.6);
            // Hip to hem with flow
            ctx.quadraticCurveTo(width * 0.2, height * 0.75, width * 0.25, height * 0.9);
            ctx.lineTo(width * 0.35, height * 0.98);
            // Bottom hem
            ctx.quadraticCurveTo(width * 0.5, height * 0.99, width * 0.65, height * 0.98);
            // Right side
            ctx.lineTo(width * 0.75, height * 0.9);
            ctx.quadraticCurveTo(width * 0.8, height * 0.75, width * 0.77, height * 0.6);
            ctx.quadraticCurveTo(width * 0.75, height * 0.5, width * 0.73, height * 0.4);
            ctx.quadraticCurveTo(width * 0.72, height * 0.25, width * 0.7, height * 0.1);
            // Right shoulder
            ctx.quadraticCurveTo(width * 0.65, height * 0.05, width * 0.6, height * 0.02);
            ctx.closePath();
        } else if (type === 'suit') {
            // Professional suit jacket - drawing top to bottom
            ctx.moveTo(width * 0.42, height * 0.05);
            // Left lapel
            ctx.lineTo(width * 0.35, height * 0.08);
            ctx.lineTo(width * 0.3, height * 0.2);
            // Left side
            ctx.lineTo(width * 0.28, height * 0.35);
            ctx.lineTo(width * 0.27, height * 0.55);
            ctx.lineTo(width * 0.3, height * 0.75);
            // Bottom
            ctx.lineTo(width * 0.7, height * 0.75);
            // Right side
            ctx.lineTo(width * 0.73, height * 0.55);
            ctx.lineTo(width * 0.72, height * 0.35);
            ctx.lineTo(width * 0.7, height * 0.2);
            // Right lapel
            ctx.lineTo(width * 0.65, height * 0.08);
            ctx.lineTo(width * 0.58, height * 0.05);
            ctx.closePath();
        } else {
            // Casual top with sleeves - drawing top to bottom
            ctx.moveTo(width * 0.4, height * 0.08);
            // Left sleeve
            ctx.quadraticCurveTo(width * 0.25, height * 0.12, width * 0.2, height * 0.22);
            ctx.quadraticCurveTo(width * 0.22, height * 0.28, width * 0.28, height * 0.25);
            // Left side
            ctx.lineTo(width * 0.3, height * 0.35);
            ctx.lineTo(width * 0.28, height * 0.5);
            ctx.lineTo(width * 0.3, height * 0.65);
            // Bottom
            ctx.lineTo(width * 0.7, height * 0.65);
            // Right side
            ctx.lineTo(width * 0.72, height * 0.5);
            ctx.lineTo(width * 0.7, height * 0.35);
            ctx.lineTo(width * 0.72, height * 0.25);
            // Right sleeve
            ctx.quadraticCurveTo(width * 0.78, height * 0.28, width * 0.8, height * 0.22);
            ctx.quadraticCurveTo(width * 0.75, height * 0.12, width * 0.6, height * 0.08);
            ctx.closePath();
        }

        // Fill with gradient
        ctx.fill();

        // Add realistic shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Add outline
        ctx.strokeStyle = this.darkenColor(color, 30);
        ctx.lineWidth = 3;
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Add decorative details
        if (type === 'suit') {
            // Buttons
            ctx.fillStyle = this.lightenColor(color, 50);
            const buttonX = width * 0.52;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(buttonX, height * (0.2 + i * 0.12), width * 0.015, 0, Math.PI * 2);
                ctx.fill();
            }
            // Lapels
            ctx.strokeStyle = this.darkenColor(color, 35);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.42, height * 0.05);
            ctx.lineTo(width * 0.35, height * 0.25);
            ctx.moveTo(width * 0.58, height * 0.05);
            ctx.lineTo(width * 0.65, height * 0.25);
            ctx.stroke();
        } else if (type === 'dress' || type === 'gown') {
            // Waistline accent
            ctx.strokeStyle = this.darkenColor(color, 25);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(width * 0.27, height * 0.4);
            ctx.quadraticCurveTo(width * 0.5, height * 0.42, width * 0.73, height * 0.4);
            ctx.stroke();
        }

        // Add neckline at top
        ctx.fillStyle = this.lightenColor(color, 25);
        ctx.beginPath();
        ctx.ellipse(width * 0.5, height * 0.04, width * 0.08, height * 0.02, 0, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL('image/png');
    }

    static generateAccessoryImage(type, color = '#000000') {
        const canvas = document.createElement('canvas');
        canvas.width = type === 'glasses' ? 200 : 250;
        canvas.height = type === 'glasses' ? 100 : 150;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;

        if (type === 'glasses') {
            // Draw sunglasses
            ctx.fillRect(20, 40, 60, 40);
            ctx.fillRect(120, 40, 60, 40);
            ctx.fillRect(80, 55, 40, 10);
            // Bridge
            ctx.strokeStyle = color;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(50, 60, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(150, 60, 30, 0, Math.PI * 2);
            ctx.stroke();
        } else if (type === 'cap') {
            // Draw cap
            ctx.beginPath();
            ctx.ellipse(125, 80, 80, 40, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(45, 80);
            ctx.lineTo(20, 100);
            ctx.lineTo(90, 100);
            ctx.fill();
        } else if (type === 'hat') {
            // Draw fedora hat
            ctx.beginPath();
            ctx.ellipse(125, 100, 100, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(75, 40, 100, 60);
            ctx.fillStyle = this.lightenColor(color, 20);
            ctx.fillRect(75, 70, 100, 10);
        }

        return canvas.toDataURL('image/png');
    }

    static lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }

    static darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + (R > 0 ? R : 0) * 0x10000 +
            (G > 0 ? G : 0) * 0x100 +
            (B > 0 ? B : 0))
            .toString(16).slice(1);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageGenerator;
}

