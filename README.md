# Mobile Video Recorder POC

A proof-of-concept mobile web application demonstrating video recording, local persistence via IndexedDB, and simulated background uploads.

## Features

- **Video Recording**: Uses `navigator.mediaDevices.getUserMedia` and `MediaRecorder`.
- **Local Persistence**: Videos are stored in IndexedDB (`video-recorder-db`) immediately upon recording. They survive tab closes and reloads.
- **Offline/Resilience**: If an upload fails, the video remains locally on the device.
- **Mock Upload**: Simulates an API upload with random failures to demonstrate error handling.

## Technical Details

### Storage
We use [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) wrapped with the `idb` library for promises support. 
- **Database**: `video-recorder-db`
- **Store**: `videos`
- **Data**: Binary Blobs are stored directly.

### Mobile Limitations & Considerations
- **iOS Safari**: 
  - `MediaRecorder` support is good in recent versions but specific mime-types (like `video/webm`) might be transcoded or wrapped in mp4 on older versions (handled by browser usually).
  - WebM is generally supported for recording now.
  - Storage quotas apply (usually decent, >500MB).
- **Android Chrome**: 
  - Excellent support for `video/webm`.
  - Background recording might pause if tab is backgrounded (OS limitation).

### Running locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Open on mobile:
   - Connect phone to same Wi-Fi.
   - Access `http://YOUR_PC_IP:5173`.
   - Ensure you access via `https` or `localhost` (browsers block camera on insecure http unless it's localhost). 
   - *Note: Vite `npm run dev -- --host` exposes it to network.*

## Future Improvements for Production
- **Service Worker**: For true offline PWA support.
- **Chunked Uploads**: For large files.
- **Compression**: Transcode video on client (using FFmpeg.wasm) to save bandwidth.
