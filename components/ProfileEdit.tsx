'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { usersAPI } from '@/lib/api';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function ProfileEdit({ profile }: { profile: Profile }) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user || user.id !== profile.id) {
      setError('无权编辑此资料');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if changed
      if (avatar) {
        try {
          const uploadResponse = await usersAPI.uploadAvatar(avatar);
          avatarUrl = uploadResponse.data?.url || uploadResponse.data?.avatarUrl || avatarPreview;
        } catch (uploadError: any) {
          console.warn('Avatar upload failed, continuing with current avatar:', uploadError);
          // If upload fails, keep existing avatar or use preview
          if (avatarPreview) {
            avatarUrl = avatarPreview;
          }
        }
      }

      // Update profile via Express API
      await updateUser({
        name: username || undefined,
        profilePicture: avatarUrl || undefined,
        bio: bio || undefined,
      });

      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.error || error.message || '更新失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 transition"
        title="编辑资料"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">编辑资料</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              头像
            </label>
            {avatarPreview && (
              <div className="mb-2">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="输入用户名"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="介绍一下自己..."
            />
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={() => {
              setIsEditing(false);
              setError(null);
              setUsername(profile.username || '');
              setBio(profile.bio || '');
              setAvatar(null);
              setAvatarPreview(profile.avatar_url);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
