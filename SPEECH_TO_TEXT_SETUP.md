# 🎤 Speech-to-Text Setup Guide - الباندا المستشار

## 📋 Overview

المساعد الصوتي (الباندا المستشار) يستخدم **Google Cloud Speech-to-Text API** لتحويل الصوت إلى نص.

## 🔑 Environment Variables Required

### Backend (server/.env)

أضف أحد المتغيرات التالية:

```bash
# Option 1: Use dedicated Speech-to-Text API Key (Recommended)
GOOGLE_SPEECH_API_KEY=your_google_speech_api_key_here

# Option 2: Fallback to Gemini API Key (if Speech-to-Text is enabled in same project)
GEMINI_API_KEY=your_gemini_api_key_here
```

**ملاحظة:** إذا كان `GEMINI_API_KEY` موجوداً فقط، سيتم استخدامه كـ fallback. لكن يُنصح بإضافة `GOOGLE_SPEECH_API_KEY` منفصلاً.

## 🌐 Service Used

**Google Cloud Speech-to-Text API**
- **Endpoint:** `https://speech.googleapis.com/v1/speech:recognize`
- **Supported Languages:** Arabic (ar-SA), English (en-US), Chinese (zh-CN)
- **Audio Format:** WebM Opus (from browser MediaRecorder)
- **Max File Size:** 10MB

## 📝 How to Get API Key

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Cloud Speech-to-Text API**

### Step 2: Create API Key
1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key
4. (Optional) Restrict the key to **Cloud Speech-to-Text API** only

### Step 3: Add to Environment Variables
Add the key to `server/.env`:
```bash
GOOGLE_SPEECH_API_KEY=AIzaSy...your_key_here
```

## 🚀 Features

### Frontend (FounderChatPanel)
- ✅ Microphone button (🎤) appears if browser supports MediaRecorder
- ✅ Click to start recording, click again to stop
- ✅ Visual feedback during recording (pulsing red button)
- ✅ Automatic transcription and message sending

### Backend (API)
- ✅ `/api/v1/speech/transcribe` - Transcribe audio to text
- ✅ `/api/v1/speech/status` - Check if Speech-to-Text is available
- ✅ Supports Arabic, English, and Chinese
- ✅ File size limit: 10MB
- ✅ Authentication required (FOUNDER or ADMIN role)

## 🔧 Testing

### Test Speech-to-Text Status
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://banda-chao.onrender.com/api/v1/speech/status
```

### Expected Response (if configured):
```json
{
  "success": true,
  "available": true,
  "message": "Speech-to-Text service is available"
}
```

### Expected Response (if NOT configured):
```json
{
  "success": true,
  "available": false,
  "message": "Speech-to-Text service is not configured. Set GOOGLE_SPEECH_API_KEY or GEMINI_API_KEY environment variable."
}
```

## ⚠️ Troubleshooting

### Issue: Microphone button doesn't appear
**Solution:** Check browser compatibility. Modern browsers (Chrome, Edge, Firefox) support MediaRecorder.

### Issue: "Speech-to-Text service is not configured"
**Solution:** Add `GOOGLE_SPEECH_API_KEY` or `GEMINI_API_KEY` to `server/.env` and restart the backend server.

### Issue: "Failed to transcribe audio"
**Possible Causes:**
1. API key is invalid or expired
2. API quota exceeded
3. Audio format not supported
4. Network error

**Solution:**
- Verify API key in Google Cloud Console
- Check API quota and billing
- Ensure audio is clear and not too long
- Check backend logs for detailed error messages

## 📚 Documentation

- [Google Cloud Speech-to-Text API](https://cloud.google.com/speech-to-text/docs)
- [MediaRecorder API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

## ✅ Checklist

- [ ] Google Cloud project created
- [ ] Cloud Speech-to-Text API enabled
- [ ] API key created and copied
- [ ] `GOOGLE_SPEECH_API_KEY` added to `server/.env`
- [ ] Backend server restarted
- [ ] Test microphone button in Founder Dashboard
- [ ] Verify transcription works

---

**Last Updated:** December 2024  
**Maintained by:** Banda Chao Development Team

