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

export default function VideoRecorder({ locale, type, onSuccess, onCancel }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      const startTime = Date.now();
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setDuration(seconds);
        if (seconds >= maxDuration) {
          stopRecording();
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError(err.message || 'Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleUpload = async () => {
    if (!recordedVideo || !title) {
      setError(locale === 'ar' ? 'الرجاء إدخال عنوان للفيديو' : 'Please enter a title');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      // Get the video blob
      const response = await fetch(recordedVideo);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append('video', blob, `video-${Date.now()}.webm`);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('duration', duration.toString());

      const result = await videosAPI.upload(formData);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'Failed to upload video');
      }
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message || 'Failed to upload video');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setRecordedVideo(null);
    setTitle('');
    setDescription('');
    setDuration(0);
    chunksRef.current = [];
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
      maxDuration: type === 'SHORT' ? 'الحد الأقصى: 60 ثانية' : 'الحد الأقصى: 30 دقيقة',
      shortVideo: 'فيديو قصير (30-60 ثانية)',
      longVideo: 'فيديو طويل (15-30 دقيقة)',
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
      maxDuration: type === 'SHORT' ? 'Max: 60 seconds' : 'Max: 30 minutes',
      shortVideo: 'Short Video (30-60 seconds)',
      longVideo: 'Long Video (15-30 minutes)',
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
      maxDuration: type === 'SHORT' ? '最长：60秒' : '最长：30分钟',
      shortVideo: '短视频（30-60秒）',
      longVideo: '长视频（15-30分钟）',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.title}</h2>
      <p className="text-sm text-gray-600 mb-4">{t.maxDuration}</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!recordedVideo ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{t.recording}</span>
                <span className="text-sm">{formatTime(duration)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!isRecording ? (
              <Button
                variant="primary"
                onClick={startRecording}
                className="flex-1"
              >
                {t.startRecording}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={stopRecording}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {t.stopRecording}
              </Button>
            )}
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video
              src={recordedVideo}
              controls
              className="w-full h-full object-cover"
            />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleUpload}
              disabled={isUploading || !title}
              className="flex-1"
            >
              {isUploading ? (locale === 'ar' ? 'جاري الرفع...' : 'Uploading...') : t.upload}
            </Button>
            <Button variant="secondary" onClick={handleRetake}>
              {t.retake}
            </Button>
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                {t.cancel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

