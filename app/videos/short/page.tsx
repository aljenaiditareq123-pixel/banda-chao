import VideoCard from "@/components/VideoCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 12;

interface PageProps {
  searchParams: {
    page?: string;
  };
}

export default async function ShortVideosPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const currentPage = parseInt(searchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Fetch total count
  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'short');

  const totalVideos = count || 0;
  const totalPages = Math.ceil(totalVideos / ITEMS_PER_PAGE);

  // Fetch videos for current page
  const { data: shortVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('type', 'short')
    .order('created_at', { ascending: false })
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  const formattedVideos = (shortVideos || []).map((video: any) => ({
    id: video.id,
    userId: video.user_id,
    title: video.title,
    thumbnail: video.thumbnail_url,
    videoUrl: video.video_url,
    duration: video.duration,
    views: video.views || 0,
    likes: video.likes || 0,
    comments: 0,
    createdAt: video.created_at,
    type: video.type as 'short',
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">短视频</h1>
        
        {formattedVideos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {formattedVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {currentPage > 1 && (
                  <Link
                    href={`/videos/short?page=${currentPage - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    上一页
                  </Link>
                )}

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <Link
                          key={page}
                          href={`/videos/short?page=${page}`}
                          className={`px-4 py-2 rounded-lg transition ${
                            page === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </Link>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                {currentPage < totalPages && (
                  <Link
                    href={`/videos/short?page=${currentPage + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    下一页
                  </Link>
                )}
              </div>
            )}

            <div className="text-center mt-4 text-gray-600">
              显示第 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalVideos)} 条，共 {totalVideos} 条
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无内容
          </div>
        )}
      </div>
    </div>
  );
}
