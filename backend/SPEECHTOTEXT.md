# Speech-to-Text (Voice Transcription) Documentation

## Overview
Voice transcription feature allows users to speak food names into the microphone, which are automatically converted to text and searched in the food database.

## Flow Diagram

```
Mobile App (CalorieScreen)
    ↓
1. User holds microphone button
    ↓
2. expo-av records audio (M4A format)
    ↓
3. User releases button
    ↓
4. Audio sent to backend: POST /api/food/transcribe
    ↓
Backend (TranscribeService)
    ↓
5. Receives M4A audio buffer
    ↓
6. ffmpeg converts M4A → WAV (16kHz, mono, LINEAR16)
    ↓
7. Send WAV to Google Cloud Speech-to-Text API
    ↓
8. Returns transcript text
    ↓
9. Transcribed text shows in input field
    ↓
10. Auto-search for food by name
```

## Components

### Frontend: Mobile App (CalorieScreen.js)

**Audio Recording:**
- Uses `expo-av` library's `Audio.Recording` API
- Records in HIGH_QUALITY preset (M4A/AAC format, ~44-48kHz)
- Press-and-hold on microphone button triggers recording
- Visual feedback: "🔴 Recording..." text + red mic icon

**Audio Upload:**
- Reads M4A file via `FileSystem.readAsStringAsync()` with base64 encoding
- Sends to backend via FormData multipart upload
- Audio sent to `POST /api/food/transcribe`

**Result Handling:**
- Transcribed text displayed in input field
- Automatic search triggered via `searchFoodWithText()`
- Clears input after search completes or shows preview

### Backend: Food API

**Route: `POST /api/food/transcribe`**
```javascript
router.post("/transcribe", 
  upload.single("audio"), 
  FoodController.transcribeAudio
);
```
- Accepts multipart form data with `audio` field
- No authentication required (public endpoint)
- Uses multer with in-memory storage

**FoodController.transcribeAudio():**
- Validates audio file exists
- Passes buffer to TranscribeService
- Returns JSON: `{ transcript: "ข้อความที่แปลงได้" }`

### Backend: TranscribeService

**Key Functions:**

1. **convertM4AtoWAV(inputBuffer)**
   - Takes M4A audio buffer from mobile
   - Uses ffmpeg to convert to WAV format
   - Output specs: 16kHz sample rate, mono channel, LINEAR16 encoding
   - Returns converted WAV buffer

2. **transcribeAudio(audioBuffer)**
   - Converts M4A → WAV using ffmpeg
   - Encodes WAV to base64
   - Sends to Google Cloud Speech-to-Text API
   - Parses results and returns transcribed text
   - Error handling for conversion and API failures

## Dependencies

### NPM Packages
```json
{
  "fluent-ffmpeg": "^2.1.3",
  "@ffmpeg-installer/ffmpeg": "latest",
  "@google-cloud/speech": "^5.x"
}
```

### System Requirements
- FFmpeg binary (included via @ffmpeg-installer/ffmpeg)
- Google Cloud credentials file (ooaauth-457522-119674c940f0.json)

## Google Cloud Setup

**Requirements:**
1. Google Cloud Project with Speech-to-Text API enabled
2. Service account with credentials JSON file
3. File placed at: `backend/ooaauth-457522-119674c940f0.json`

**API Configuration:**
```javascript
const config = {
  encoding: "LINEAR16",      // Audio format after conversion
  sampleRateHertz: 16000,    // 16kHz sample rate
  languageCode: "th-TH",     // Thai language
  audioChannelCount: 1,      // Mono audio
};
```

## Audio Format Journey

| Stage | Format | Sample Rate | Channels | Codec |
|-------|--------|------------|----------|-------|
| 1. Mobile Recording | M4A/AAC | 44-48kHz | Stereo | AAC |
| 2. Backend Input | M4A (base64) | 44-48kHz | Stereo | AAC |
| 3. After FFmpeg | WAV | 16kHz | Mono | PCM/LINEAR16 |
| 4. Google Cloud | WAV (base64) | 16kHz | Mono | LINEAR16 |
| 5. Output | Text | - | - | UTF-8 |

## Error Handling

**Common Errors & Solutions:**

1. **"Cannot find ffmpeg"**
   - Solution: `npm install @ffmpeg-installer/ffmpeg` + set path in code

2. **"Audio buffer size: 0"**
   - Solution: Ensure mobile app uses proper FileSystem API with base64 encoding

3. **"Cloud Speech-to-Text API not enabled"**
   - Solution: Enable API in Google Cloud Console

4. **Empty transcription results**
   - Possible: Audio quality too low, wrong language code
   - Check: Sample rate, encoding, language config

## Testing

**Manual Testing Steps:**
1. Start backend server
2. Open mobile app on CalorieScreen
3. Hold microphone button and speak food name (e.g., "ข้าวมัน")
4. Release button
5. Verify:
   - Console shows: "Converting M4A to WAV..."
   - Transcribed text appears in input field
   - Food search executes automatically
   - Results display

**Server Logs to Watch:**
```
🎤 Transcribe request - file size: [size]
🎤 Audio buffer size: [size]
🔄 Converting M4A to WAV...
✅ Conversion complete, WAV size: [size]
📤 Sending to Google Cloud...
✅ Google response: [results]
✅ Transcribed: [text]
```

## Performance Notes

- FFmpeg conversion takes ~0.5-1 second
- Google Cloud API call takes ~1-2 seconds
- Total latency: ~2-3 seconds from release to search results
- No caching (fresh transcription each time)

## Future Improvements

- Add retry logic for failed conversions
- Cache ffmpeg path detection
- Support multiple languages (currently Thai only)
- Add audio quality validation
- Implement request timeout handling
- Consider WebSocket for real-time streaming transcription
