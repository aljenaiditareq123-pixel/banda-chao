import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileEdit from '@/components/ProfileEdit';
import Image from 'next/image';

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  // Get profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !profile) {
    redirect('/');
  }

  // Get user's videos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(12);

  // Get user's products
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(8);

  const isOwnProfile = currentUser?.id === params.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username || 'User'}
                  width={128}
                  height={128}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  unoptimized
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-red-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {(profile.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {isOwnProfile && (
                <ProfileEdit profile={profile} />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.username || '未命名用户'}
              </h1>
              {profile.bio && (
                <p className="text-gray-600 mb-4">{profile.bio}</p>
              )}
              <div className="flex space-x-6 text-sm">
                <div>
                  <span className="font-semibold">{videos?.length || 0}</span>
                  <span className="text-gray-600 ml-1">视频</span>
                </div>
                <div>
                  <span className="font-semibold">{products?.length || 0}</span>
                  <span className="text-gray-600 ml-1">商品</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button className="px-6 py-4 text-sm font-medium text-red-600 border-b-2 border-red-600">
                视频
              </button>
              <button className="px-6 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                商品
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Videos Grid */}
            {videos && videos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video: any) => (
                  <a
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="group relative aspect-video bg-gray-200 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={video.thumbnail_url}
                      alt={video.title}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition">
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                暂无视频
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
