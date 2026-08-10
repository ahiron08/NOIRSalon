# How to Add Your Own Intro Video

## Quick Steps

### 1. Prepare Your Video

**Requirements:**
- Format: MP4 (H.264 encoding)
- Duration: 4-6 seconds (optimal)
- Resolution: 1920x1080 (Full HD) or higher
- File size: Under 10MB for fast loading
- Aspect ratio: 16:9 (landscape)

### 2. Optimize Your Video (If Needed)

**Option A: Use HandBrake (Recommended)**
1. Download from: https://handbrake.fr
2. Open your video file
3. Settings:
   - Format: MP4
   - Video Codec: H.264 (x264)
   - Framerate: 30fps
   - Resolution: 1920x1080
   - Quality: RF 23 (good balance)
4. Start encode

**Option B: Use Online Tool**
- Visit: https://cloudconvert.com/mp4-converter
- Upload your video
- Select MP4 with H.264
- Convert and download

### 3. Replace the Video

Simply replace the existing file:
```
d:\NOIR\client\public\videos\intro.mp4
```

With your new video file (keep the same name: `intro.mp4`).

### 4. Test It

```bash
cd d:\NOIR\client
npm run dev
```

Open http://localhost:5173 and your video will play automatically!

## Video Ideas for NOIR Salon

1. **Brand Reveal**: NOIR logo animation with elegant transitions
2. **Service Preview**: Quick cuts of hair, makeup, spa treatments
3. **Atmosphere**: Luxury salon interior, ambient lighting
4. **Before/After**: Dramatic transformations (keep it classy)
5. **Typography**: Text animations with luxury feel

## Tips

- **Skip Button**: Click "Skip Intro" (bottom right) to skip the video
- **Poster Image**: Add `intro-poster.jpg` in `public/images/` for slow connections
- **Loading**: Video loads from cache after first visit
- **Mobile**: Video plays on all devices (mobile-friendly)

## Troubleshooting

**Video not playing?**
- Check browser console for errors
- Ensure video is MP4 format
- Try a shorter video (under 10MB)
- Check file permissions

**Video too large?**
- Compress with HandBrake
- Reduce resolution to 1280x720
- Lower bitrate to 2-4 Mbps

**Video looks blurry?**
- Use 1920x1080 or higher resolution
- Ensure source footage is high quality

## Need Help?

Check the video specifications in:
```
d:\NOIR\client\public\videos\README.md
```