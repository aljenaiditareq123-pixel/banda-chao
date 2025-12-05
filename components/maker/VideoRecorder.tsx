'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/Button';
import { videosAPI } from '@/lib/api';

interface VideoRecorderProps {
  locale: string;
  type: 'SHORT' | 'LONG';
  onSuccess?: () => void;
  onCancel?: () => void;
}

type RecordingState = 'idle' | 'requesting-permission' | 'ready' | 'recording' | 'preview' | 'uploading' | 'success' | 'error';

export default function VideoRecorder({ locale, type, onSuccess, onCancel }: VideoRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const maxDuration = type === 'SHORT' ? 60 : 1800; // 60 seconds for SHORT, 30 minutes for LONG

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedVideo) {
        URL.revokeObjectURL(recordedVideo);
      }
    };
  }, [recordedVideo]);

  const requestPermission = async () => {
    try {
      setState('requesting-permission');
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setState('ready');
    } catch (err: unknown) {
      console.error('Error requesting permission:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera/microphone';
      setError(errorMessage);
      setState('error');
    }
  };

  const startRecording = () => {
    if (!streamRef.current || state !== 'ready') return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      startTimeRef.current = Date.now();
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        setState('preview');
      };

      mediaRecorder.start();
      setState('recording');

      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
        if (seconds >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    } catch (err: unknown) {
      console.error('Error starting recording:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const handleUpload = async () => {
    if (!recordedVideo || !title.trim()) {
      setError(t.titleRequired);
      return;
    }

    try {
      setState('uploading');
      setError(null);
      setUploadProgress(0);

      // Get the video blob
      const response = await fetch(recordedVideo);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('video', blob, `video-${Date.now()}.webm`);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('type', type);
      formData.append('duration', duration.toString());

      // Simulate progress (since we don't have actual upload progress from API)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await videosAPI.upload(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setState('success');
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 1500);
      } else {
        setError(result.error || t.uploadFailed);
        setState('preview');
      }
    } catch (err: unknown) {
      console.error('Error uploading video:', err);
      const errorMessage = err instanceof Error ? err.message : t.uploadFailed;
      setError(errorMessage);
      setState('preview');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleRetake = () => {
    // Cleanup
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setRecordedVideo(null);
    setTitle('');
    setDescription('');
    setDuration(0);
    setError(null);
    chunksRef.current = [];
    setState('idle');
  };

  const handleCancel = () => {
    // Cleanup
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const texts = {
    ar: {
      title: 'تسجيل فيديو',
      titlePlaceholder: 'عنوان الفيديو',
      descriptionPlaceholder: 'وصف الفيديو (اختياري)',
      startRecording: 'بدء التسجيل',
      stopRecording: 'إيقاف التسجيل',
      upload: 'رفع الفيديو',
      retake: 'إعادة التسجيل',
      cancel: 'إلغاء',
      recording: 'جاري التسجيل...',
      ready: 'جاهز للتسجيل',
      preview: 'معاينة الفيديو',
      uploading: 'جاري الرفع...',
      success: 'تم رفع الفيديو بنجاح!',
      maxDuration: type === 'SHORT' ? 'الحد الأقصى: 60 ثانية' : 'الحد الأقصى: 30 دقيقة',
      shortVideo: 'فيديو قصير (30-60 ثانية)',
      longVideo: 'فيديو طويل (15-30 دقيقة)',
      requestPermission: 'السماح بالكاميرا والميكروفون',
      requestingPermission: 'جاري طلب الإذن...',
      titleRequired: 'الرجاء إدخال عنوان للفيديو',
      uploadFailed: 'فشل رفع الفيديو',
      permissionDenied: 'تم رفض الإذن. يرجى السماح بالوصول إلى الكاميرا والميكروفون.',
      helperText: type === 'SHORT' 
        ? 'سجّل فيديو قصير (30-60 ثانية) لعرض منتجاتك'
        : 'سجّل فيديو طويل (15-30 دقيقة) لشرح تفصيلي عن منتجاتك',
    },
    en: {
      title: 'Record Video',
      titlePlaceholder: 'Video Title',
      descriptionPlaceholder: 'Video Description (optional)',
      startRecording: 'Start Recording',
      stopRecording: 'Stop Recording',
      upload: 'Upload Video',
      retake: 'Retake',
      cancel: 'Cancel',
      recording: 'Recording...',
      ready: 'Ready to Record',
      preview: 'Video Preview',
      uploading: 'Uploading...',
      success: 'Video uploaded successfully!',
      maxDuration: type === 'SHORT' ? 'Max: 60 seconds' : 'Max: 30 minutes',
      shortVideo: 'Short Video (30-60 seconds)',
      longVideo: 'Long Video (15-30 minutes)',
      requestPermission: 'Allow Camera & Microphone',
      requestingPermission: 'Requesting permission...',
      titleRequired: 'Please enter a video title',
      uploadFailed: 'Failed to upload video',
      permissionDenied: 'Permission denied. Please allow access to camera and microphone.',
      helperText: type === 'SHORT'
        ? 'Record a short video (30-60 seconds) to showcase your products'
        : 'Record a long video (15-30 minutes) for detailed product explanations',
    },
    zh: {
      title: '录制视频',
      titlePlaceholder: '视频标题',
      descriptionPlaceholder: '视频描述（可选）',
      startRecording: '开始录制',
      stopRecording: '停止录制',
      upload: '上传视频',
      retake: '重新录制',
      cancel: '取消',
      recording: '录制中...',
      ready: '准备录制',
      preview: '视频预览',
      uploading: '上传中...',
      success: '视频上传成功！',
      maxDuration: type === 'SHORT' ? '最长：60秒' : '最长：30分钟',
      shortVideo: '短视频（30-60秒）',
      longVideo: '长视频（15-30分钟）',
      requestPermission: '允许摄像头和麦克风',
      requestingPermission: '请求权限中...',
      titleRequired: '请输入视频标题',
      uploadFailed: '上传视频失败',
      permissionDenied: '权限被拒绝。请允许访问摄像头和麦克风。',
      helperText: type === 'SHORT'
        ? '录制短视频（30-60秒）展示您的产品'
        : '录制长视频（15-30分钟）详细解释您的产品',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-xs md:text-sm text-gray-600">{t.maxDuration}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {state === 'success' && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
          <div className="text-2xl mb-2">✅</div>
          <p className="font-medium">{t.success}</p>
        </div>
      )}

      {/* State: Idle - Initial state */}
      {state === 'idle' && (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-gray-600 text-sm md:text-base px-4">{t.helperText}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={requestPermission}
              className="flex-1"
            >
              {t.requestPermission}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={handleCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* State: Requesting Permission */}
      {state === 'requesting-permission' && (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-600">{t.requestingPermission}</p>
            </div>
          </div>
        </div>
      )}

      {/* State: Ready - Camera active, ready to record */}
      {state === 'ready' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
              {t.ready}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={startRecording}
              className="flex-1"
            >
              {t.startRecording}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={handleCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* State: Recording */}
      {state === 'recording' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">{t.recording}</span>
              <span className="text-sm font-mono">{formatTime(duration)}</span>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-xs text-center">
              {t.maxDuration}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={stopRecording}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {t.stopRecording}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={handleCancel} disabled>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* State: Preview - Video recorded, ready to upload */}
      {state === 'preview' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={recordedVideo || undefined}
              controls
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
              {t.preview} • {formatTime(duration)}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.titlePlaceholder} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.descriptionPlaceholder}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.descriptionPlaceholder}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={!title.trim()}
              className="flex-1"
            >
              {t.upload}
            </Button>
            <Button variant="secondary" onClick={handleRetake}>
              {t.retake}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={handleCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* State: Uploading */}
      {state === 'uploading' && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={recordedVideo || undefined}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="font-medium">{t.uploading}</p>
                {uploadProgress > 0 && (
                  <div className="mt-4 w-48 mx-auto">
                    <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs mt-2">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State: Error */}
      {state === 'error' && (
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-gray-600 text-sm">{error || t.permissionDenied}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={requestPermission}
              className="flex-1"
            >
              {t.requestPermission}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={handleCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

