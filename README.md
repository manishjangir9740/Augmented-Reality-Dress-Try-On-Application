# AR Virtual Try-On System

Real-time augmented reality dress try-on application using AI body detection.

## Features

- ✅ Real-time body detection (33 landmarks)
- ✅ 8 different outfits
- ✅ Color customization (4 colors per outfit)
- ✅ Size selection (XS to XXL)
- ✅ Accessories (glasses, hats)
- ✅ Works at any angle
- ✅ Save photos
- ✅ Flip camera

## Quick Start

### Local Development

1. **Start Server**
```bash
python -m http.server 8000
# OR
npx http-server -p 8000 -c-1
```

2. **Open Browser**
```
http://localhost:8000
```

3. **Allow Camera** - Click "Allow" when prompted

4. **Use Application**

### Deploy to Vercel (Live Production)

**Option 1: Via Website (Easiest)**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Project"
3. Upload your project folder or connect GitHub
4. Click "Deploy"
5. Done! Your app will be live in 1-2 minutes

**Option 2: Via CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option 3: GitHub Auto-Deploy**
1. Push code to GitHub
2. Connect repository to Vercel
3. Auto-deploys on every push

See `DEPLOYMENT.txt` for detailed instructions.
   - Select outfit from carousel
   - Click "Customize" to change color/size
   - Switch to "Accessories" tab for glasses/hats
   - Save photos with camera button

## Requirements

- Modern browser (Chrome, Edge, Firefox)
- Camera access
- Internet connection (for MediaPipe libraries)

## Technology

- HTML5, CSS3, JavaScript
- Google MediaPipe Pose Detection
- Canvas 2D Rendering

## Configuration

Edit `config.js` to customize:
- Camera settings (resolution, FPS)
- Detection sensitivity
- Overlay appearance
- Add more outfits/accessories

## Project Structure

```
├── index.html          - Main app
├── styles.css          - Styling
├── config.js           - Settings
├── bodyDetection.js    - AI tracking
├── dressOverlay.js     - AR rendering
├── ui.js               - User interface
└── app.js              - Main controller
```

## Troubleshooting

**Camera not working?**
- Check browser permissions
- Use HTTPS or localhost
- Refresh page

**Body not detected?**
- Improve lighting
- Stand 2-3 feet from camera
- Show full upper body
  
<img width="632" height="884" alt="Screenshot 2025-12-06 072728" src="https://github.com/user-attachments/assets/cf0c3887-0b4c-430e-b7d5-f6e75f7dd179" />


## License

Created for ADtip Company Assignment
