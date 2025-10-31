import VideoCard from "@/components/VideoCard";

// Mock data
const shortVideos = [
  {
    id: "1",
    userId: "user1",
    title: "短视频示例 1 - 美食分享",
    thumbnail: "https://via.placeholder.com/640x360",
    videoUrl: "",
    duration: 30,
    views: 12500,
    likes: 850,
    comments: 45,
    createdAt: new Date().toISOString(),
    type: "short" as const,
  },
  {
    id: "2",
    userId: "user2",
    title: "短视频示例 2 - 日常生活",
    thumbnail: "https://via.placeholder.com/640x360",
    videoUrl: "",
    duration: 45,
    views: 8900,
    likes: 620,
    comments: 32,
    createdAt: new Date().toISOString(),
    type: "short" as const,
  },
  {
    id: "3",
    userId: "user3",
    title: "短视频示例 3 - 旅行记录",
    thumbnail: "https://via.placeholder.com/640x360",
    videoUrl: "",
    duration: 60,
    views: 15200,
    likes: 1100,
    comments: 67,
    createdAt: new Date().toISOString(),
    type: "short" as const,
  },
];

export default function ShortVideosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">短视频</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shortVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
