# Audio Transcription

A mobile application for audio and video transcription using speech recognition. Built with Ionic Angular and FastAPI backend powered by OpenAI Whisper.

## Description

Audio Transcription is a cross-platform mobile application that converts speech to text from various sources:
- **Microphone Recording**: Record audio directly from your device
- **Audio Files**: Import local audio files (MP3, WAV, WebM, etc.)
- **Video Files**: Extract and transcribe audio from video files

The app uses OpenAI's Whisper AI model for accurate speech recognition and provides multiple export options including Word, PDF, and plain text formats.

## Technologies

### Frontend
- **Ionic Framework** - Cross-platform mobile UI framework
- **Angular 20** - TypeScript-based web application framework
- **Capacitor** - Native runtime for building cross-platform apps
- **RxJS** - Reactive programming library
- **Ionicons** - Premium icon set

### Backend
- **FastAPI** - Modern Python web framework for building APIs
- **Whisper** - OpenAI's speech recognition model
- **Pydub** - Audio processing library
- **CORS Middleware** - Cross-Origin Resource Sharing support

### Export Libraries
- **jsPDF** - PDF generation
- **docx** - Microsoft Word document generation
- **file-saver** - Client-side file saving

### Native Features
- **@capacitor/clipboard** - Copy to clipboard functionality
- **@capacitor/haptics** - Haptic feedback
- **@capacitor/keyboard** - Keyboard management
- **@capacitor/status-bar** - Status bar styling

## Architecture

```
┌─────────────────────┐
│   Mobile App        │
│   (Ionic/Angular)   │
│   - Record Audio    │
│   - Import Files    │
│   - Display Results │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────┐
│   FastAPI Backend   │
│   - /transcribe     │
└──────────┬──────────┘
           │
    ┌──────▼──────┐
    │   Whisper   │
    │     AI      │
    │  (Speech→   │
    │    Text)    │
    └──────┬──────┘
           │
    ┌──────▼──────┐
    │   Pydub     │
    │  (Audio     │
    │ Processing) │
    └─────────────┘
```

## Features

- 🎙️ **Live Recording** - Record audio directly from device microphone with real-time timer
- 📂 **File Import** - Import audio and video files from device storage
- 🎬 **Video Support** - Extract and transcribe audio from video files
- 🎵 **Audio Preview** - Preview recorded or imported audio before transcription
- 📝 **Text Editing** - Edit transcribed text directly in the app
- 📋 **Copy to Clipboard** - Quick copy functionality for transcribed text
- 💾 **Multiple Export Formats**:
  - Microsoft Word (.docx)
  - PDF (.pdf)
  - Plain Text (.txt)
- ⏱️ **Recording Timer** - Visual timer during audio recording
- 🎨 **Modern UI** - Glass morphism design with smooth animations
- 📱 **Cross-platform** - Works on iOS and Android

## Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn
- pip (Python package manager)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/Imr2DS/audio-transcription.git
cd audio-transcription

# Install dependencies
npm install

# Build the app
npm run build

# Sync with Capacitor
npx cap sync
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn whisper pydub python-multipart
```

**Note**: Whisper requires FFmpeg to be installed on your system:
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

## Run Instructions

### Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend server will start on `http://0.0.0.0:8000`

### Start Frontend App

#### Web Development
```bash
# Start Ionic development server
npm start
# or
ionic serve
```

The app will open at `http://localhost:8100`

#### Android
```bash
# Build and sync
npm run build
npx cap sync android

# Open in Android Studio
npx cap open android

# Run on device/emulator from Android Studio
```

#### iOS (macOS only)
```bash
# Build and sync
npm run build
npx cap sync ios

# Open in Xcode
npx cap open ios

# Run on device/simulator from Xcode
```

## Configuration

### Backend API URL

Update the API URL in `src/app/home/home.page.ts`:

```typescript
this.http.post<any>('http://YOUR_IP:8000/transcribe', formData)
```

Replace `YOUR_IP` with:
- `localhost` for web development
- Your local IP address (e.g., `192.168.1.6`) for mobile device testing
- Your production server URL for deployment

### Capacitor Configuration

The `capacitor.config.ts` file is configured for local development:

```typescript
const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'audio-transcription',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['192.168.1.6']  // Update with your IP
  }
};
```

**Important**: Update `allowNavigation` with your backend server IP address.

## Project Structure

```
audio-transcription/
├── src/
│   ├── app/
│   │   ├── home/
│   │   │   ├── home.page.ts          # Main logic
│   │   │   ├── home.page.html        # UI template
│   │   │   ├── home.page.scss        # Styles
│   │   │   └── home.module.ts        # Module config
│   │   ├── app-routing.module.ts     # Routing
│   │   ├── app.component.ts          # Root component
│   │   └── app.module.ts             # App module
│   ├── assets/                       # Static assets
│   ├── theme/                        # Global styles
│   └── index.html                    # Entry point
├── backend/
│   ├── main.py                       # FastAPI application
│   └── uploads/                      # Temporary file storage
├── android/                          # Android native project
├── capacitor.config.ts               # Capacitor configuration
├── ionic.config.json                 # Ionic configuration
├── angular.json                      # Angular configuration
├── package.json                      # Dependencies
└── README.md
```

## API Endpoints

### POST /transcribe

Transcribe audio or video file to text.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (audio/video file)

**Supported formats:**
- Audio: MP3, WAV, WebM, M4A, OGG, FLAC
- Video: MP4, AVI, MOV, MKV, WebM

**Response:**
```json
{
  "text": "Transcribed text content..."
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/transcribe \
  -F "file=@recording.wav"
```

## Features in Detail

### Recording Audio
1. Tap the microphone button to start recording
2. Speak clearly into your device microphone
3. Tap the stop button (square icon) to finish
4. Audio is automatically sent for transcription

### Importing Files
1. Tap the **Audio** button to import audio files
2. Tap the **Video** button to import video files
3. Select a file from your device
4. Preview the media before transcription
5. Transcription starts automatically

### Exporting Results
1. After transcription, tap the download icon
2. Choose export format:
   - **Word**: Editable .docx document
   - **PDF**: Portable document format
   - **Text**: Plain .txt file
3. File is saved to your device downloads

### Copying Text
- Tap the copy icon to copy transcribed text to clipboard
- Paste anywhere on your device

## Whisper Model

The app uses Whisper's **base** model by default, which provides a good balance between accuracy and speed.

Available models (edit in `backend/main.py`):
- `tiny` - Fastest, least accurate
- `base` - Good balance (default)
- `small` - Better accuracy
- `medium` - High accuracy
- `large` - Best accuracy, slowest

To change the model:
```python
model = whisper.load_model("small")  # Change "base" to desired model
```

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on the correct IP and port
- Update `allowNavigation` in `capacitor.config.ts`
- Check firewall settings allow connections on port 8000

### Audio Recording Not Working
- Grant microphone permissions in device settings
- Test in browser first (Chrome/Safari)
- Check browser console for errors

### Transcription Fails
- Verify FFmpeg is installed: `ffmpeg -version`
- Check audio file format is supported
- Ensure sufficient disk space for temporary files

### Android Build Issues
- Update Android SDK and build tools
- Sync Gradle files in Android Studio
- Clear cache: `./gradlew clean`

## Performance Tips

- Use smaller Whisper models for faster transcription
- Keep audio files under 10 minutes for best performance
- Close other apps during transcription on mobile devices
- Use Wi-Fi for faster file uploads

## Author

**Imr2DS**
- GitHub: [@Imr2DS](https://github.com/Imr2DS)
- Repository: [audio-transcription](https://github.com/Imr2DS/audio-transcription)

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenAI Whisper for speech recognition
- Ionic Framework for cross-platform development
- FastAPI for modern Python API development
- Angular team for the robust framework
- Capacitor for native functionality
