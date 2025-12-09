'use client';

import { useState } from 'react';
import Card from '@/components/common/Card';
import Button from '@/components/Button';

interface SocialConnection {
  id: string;
  platform: 'TIKTOK' | 'YOUTUBE' | 'INSTAGRAM';
  connected: boolean;
  username?: string;
  expires_at?: string;
}

interface SocialConnectProps {
  locale: string;
  connections: SocialConnection[];
  onConnect: (platform: 'TIKTOK' | 'YOUTUBE' | 'INSTAGRAM') => void;
  onDisconnect: (connectionId: string) => void;
}

export default function SocialConnect({ locale, connections, onConnect, onDisconnect }: SocialConnectProps) {
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);

  const platforms = [
    { id: 'TIKTOK' as const, name: 'TikTok', icon: '🎵', color: 'bg-black text-white' },
    { id: 'YOUTUBE' as const, name: 'YouTube', icon: '▶️', color: 'bg-red-600 text-white' },
    { id: 'INSTAGRAM' as const, name: 'Instagram', icon: '📷', color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  ];

  const texts = {
    ar: {
      title: 'استوديو التواصل الاجتماعي',
      description: 'اتصل بحساباتك على TikTok و YouTube لنشر المحتوى مباشرة من لوحة التحكم',
      connect: 'اتصل',
      connected: 'متصل',
      disconnect: 'قطع الاتصال',
      disconnecting: 'جاري قطع الاتصال...',
      notConnected: 'غير متصل',
      connectedAs: 'متصل كـ',
      expires: 'ينتهي في',
      connectDescription: 'انقر للاتصال وبدء النشر مباشرة',
    },
    en: {
      title: 'Social Studio',
      description: 'Connect your TikTok and YouTube accounts to post content directly from the dashboard',
      connect: 'Connect',
      connected: 'Connected',
      disconnect: 'Disconnect',
      disconnecting: 'Disconnecting...',
      notConnected: 'Not Connected',
      connectedAs: 'Connected as',
      expires: 'Expires',
      connectDescription: 'Click to connect and start posting directly',
    },
    zh: {
      title: '社交工作室',
      description: '连接您的 TikTok 和 YouTube 账户，直接从仪表板发布内容',
      connect: '连接',
      connected: '已连接',
      disconnect: '断开连接',
      disconnecting: '断开中...',
      notConnected: '未连接',
      connectedAs: '已连接为',
      expires: '过期',
      connectDescription: '点击连接并开始直接发布',
    },
  };

  const t = texts[locale as keyof typeof texts] || texts.en;

  const getConnection = (platform: 'TIKTOK' | 'YOUTUBE' | 'INSTAGRAM') => {
    return connections.find(c => c.platform === platform);
  };

  const formatExpiry = (expiresAt?: string) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return locale === 'ar' ? 'منتهي' : 'Expired';
    if (daysLeft < 7) return `${daysLeft} ${locale === 'ar' ? 'أيام' : 'days'}`;
    return date.toLocaleDateString(locale);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-sm text-gray-600 mt-1">{t.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const connection = getConnection(platform.id);
          const isConnected = connection?.connected || false;

          return (
            <Card key={platform.id}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{platform.name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isConnected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isConnected ? t.connected : t.notConnected}
                    </span>
                  </div>
                </div>

                {isConnected && connection ? (
                  <div className="space-y-3">
                    {connection.username && (
                      <p className="text-sm text-gray-600">
                        {t.connectedAs} <span className="font-medium">{connection.username}</span>
                      </p>
                    )}
                    {connection.expires_at && (
                      <p className="text-xs text-gray-500">
                        {t.expires}: {formatExpiry(connection.expires_at)}
                      </p>
                    )}
                    <Button
                      variant="text"
                      className="w-full text-sm text-red-600 hover:text-red-700"
                      disabled={disconnectingId === connection.id}
                      onClick={() => {
                        if (confirm(locale === 'ar' ? 'هل تريد قطع الاتصال؟' : 'Disconnect this account?')) {
                          setDisconnectingId(connection.id);
                          onDisconnect(connection.id);
                        }
                      }}
                    >
                      {disconnectingId === connection.id ? t.disconnecting : t.disconnect}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">{t.connectDescription}</p>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => {
                        alert(locale === 'ar' 
                          ? 'ميزة الاتصال بـ ' + platform.name + ' قريباً!'
                          : locale === 'zh'
                          ? platform.name + ' 连接功能即将推出！'
                          : platform.name + ' connection coming soon!');
                      }}
                    >
                      {t.connect}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {connections.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <p className="text-sm text-blue-800">
              {locale === 'ar'
                ? '💡 نصيحة: بعد الاتصال، يمكنك نشر المحتوى مباشرة من لوحة التحكم دون مغادرة الموقع'
                : locale === 'zh'
                ? '💡 提示：连接后，您可以直接从仪表板发布内容，无需离开网站'
                : '💡 Tip: Once connected, you can post content directly from the dashboard without leaving the site'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
