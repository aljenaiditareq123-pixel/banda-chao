import VideoCard from "@/components/VideoCard";

// Mock data
const longVideos = [
  {
    id: "1",
    userId: "user1",
    title: "长视频示例 1 - 完整教程",
    thumbnail: "https://via.placeholder.com/1280x720",
    videoUrl: "",
    duration: 600,
    views: 25000,
    likes: 1200,
    comments: 89,
    createdAt: new Date().toISOString(),
    type: "long" as const,
  },
  {
    id: "2",
    userId: "user2",
    title: "长视频示例 2 - 深度解析",
    thumbnail: "https://via.placeholder.com/1280x720",
    videoUrl: "",
    duration: 1200,
    views: 18900,
    likes: 980,
    comments: 76,
    createdAt: new Date().toISOString(),
    type: "long" as const,
  },
  {
    id: "3",
    userId: "user3",
    title: "长视频示例 3 - 纪录片",
    thumbnail: "https://via.placeholder.com/1280x720",
    videoUrl: "",
    duration: 1800,
    views: 32000,
    likes: 2100,
    comments: 156,
    createdAt: new Date().toISOString(),
    type: "long" as const,
  },
];

export default function LongVideosPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">长视频</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {longVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
