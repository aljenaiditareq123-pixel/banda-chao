import React from 'react';

type VideoPlayerProps = {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
};

const baseContainerClass =
  'relative w-full overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_45px_160px_-70px_rgba(14,116,144,0.6)]';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, title, className }) => {
  return (
    <div className={`${baseContainerClass} ${className ?? ''}`}>
      <video
        controls
        poster={poster}
        className="h-full w-full max-h-[520px] object-cover"
        aria-label={title ?? 'Product video'}
      >
        <source src={src} type="video/mp4" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
    </div>
  );
};

export default VideoPlayer;
