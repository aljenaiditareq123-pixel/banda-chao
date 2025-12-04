/**
 * Speech-to-Text Service using Google Cloud Speech-to-Text API
 * Converts audio to text for voice input in the Panda Advisor
 */

/**
 * Convert audio blob to text using Google Speech-to-Text API
 * @param audioBlob - The audio blob from the browser's MediaRecorder
 * @param languageCode - Language code (default: 'ar-SA' for Arabic)
 * @returns The transcribed text
 */
export async function transcribeAudio(
  audioBlob: Blob,
  languageCode: string = 'ar-SA'
): Promise<string> {
  const GOOGLE_SPEECH_API_KEY = process.env.GOOGLE_SPEECH_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!GOOGLE_SPEECH_API_KEY) {
    throw new Error('GOOGLE_SPEECH_API_KEY or GEMINI_API_KEY is not set in environment variables');
  }

  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);
    
    // Prepare request for Google Speech-to-Text API
    const requestBody = {
      config: {
        encoding: 'WEBM_OPUS', // Common format from MediaRecorder
        sampleRateHertz: 48000,
        languageCode: languageCode,
        alternativeLanguageCodes: ['en-US', 'ar-SA', 'zh-CN'], // Support multiple languages
        enableAutomaticPunctuation: true,
        model: 'latest_long', // Best for longer audio
      },
      audio: {
        content: base64Audio.split(',')[1], // Remove data:audio/webm;base64, prefix
      },
    };

    // Call Google Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Speech-to-Text API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    
    // Extract transcribed text
    if (data.results && data.results.length > 0 && data.results[0].alternatives) {
      const transcript = data.results[0].alternatives[0].transcript;
      return transcript.trim();
    }

    return ''; // No transcription found
  } catch (error: any) {
    console.error('[Speech-to-Text] Error:', error);
    throw new Error(`Speech-to-Text failed: ${error.message}`);
  }
}

/**
 * Convert Blob to Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Check if Speech-to-Text is available (API key exists)
 */
export function isSpeechToTextAvailable(): boolean {
  return !!(process.env.GOOGLE_SPEECH_API_KEY || process.env.GEMINI_API_KEY);
}

