import React from "react";

export default function FeedPage() {
  return (
    <main className="min-h-screen px-4 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-3xl">🐼</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Creator Feed (Coming Soon)
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The global social feed for makers and buyers will be implemented here soon. 
            This will be the heart of our social commerce platform.
          </p>
        </div>

        {/* Feature Preview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-2">Short Videos</h3>
            <p className="text-sm text-gray-600">
              Discover artisan stories and product showcases through engaging short-form content.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🛍️</div>
            <h3 className="font-semibold text-gray-900 mb-2">Social Commerce</h3>
            <p className="text-sm text-gray-600">
              Shop directly from posts and support artisans from China, Arabia, and the West.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-2xl mb-3">🌍</div>
            <h3 className="font-semibold text-gray-900 mb-2">Global Community</h3>
            <p className="text-sm text-gray-600">
              Connect with makers and buyers across three cultures in a neutral, safe space.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">
              Development in progress...
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
