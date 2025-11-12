'use client';

const commitSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

function shouldShowPanel() {
  if (process.env.NODE_ENV === 'development') {
    return true;
  }
  if (!vercelUrl) {
    return false;
  }
  return vercelUrl.includes('vercel.app');
}

export default function DevPanel() {
  if (!shouldShowPanel()) {
    return null;
  }

  const shortSha = commitSha ? commitSha.slice(0, 7) : 'local';
  const displayUrl = vercelUrl ? `https://${vercelUrl.replace(/^https?:\/\//, '')}` : null;

  return (
    <div className="fixed bottom-6 left-6 z-40 bg-black/70 text-white text-xs leading-relaxed px-3 py-2 rounded-xl shadow-lg backdrop-blur">
      <div>Deployment: {shortSha}</div>
      {displayUrl ? (
        <div className="truncate max-w-[200px]">
          URL:{' '}
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-emerald-200 hover:text-emerald-100"
          >
            {displayUrl}
          </a>
        </div>
      ) : (
        <div className="text-gray-400">Environment: Development</div>
      )}
    </div>
  );
}

