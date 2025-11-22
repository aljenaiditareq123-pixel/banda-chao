"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FounderCommandCenterLayout from "@/components/founder/FounderCommandCenterLayout";
import FounderChatPanel from "@/components/founder/FounderChatPanel";
import ModeSelector from "@/components/founder/ModeSelector";

type FounderOperatingMode = 
  | 'STRATEGY_MODE'
  | 'PRODUCT_MODE' 
  | 'TECH_MODE'
  | 'MARKETING_MODE'
  | 'CHINA_MODE';

export default function FounderPageClient() {
  const { user, loading } = useAuth();
  const [currentMode, setCurrentMode] = useState<FounderOperatingMode>('STRATEGY_MODE');

  // Note: Auth check is handled by FounderRoute wrapper in app/founder/page.tsx
  // This component only renders if user is authenticated and is FOUNDER
  // No need for additional auth checks here

  return (
    <FounderCommandCenterLayout currentPage="dashboard">
      <div className="h-full flex flex-col">
        {/* Welcome Section */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🐼</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  Welcome back, Tariq!
                </h1>
                <p className="text-white/90">
                  Ready to build the world's first neutral social commerce platform?
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-90">Today's Focus</p>
                <p className="font-semibold">China Market Strategy</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-90">Active Sessions</p>
                <p className="font-semibold">3 Conversations</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-sm opacity-90">Platform Status</p>
                <p className="font-semibold">All Systems Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mb-6">
          <ModeSelector
            currentMode={currentMode}
            onModeChange={setCurrentMode}
          />
        </div>
        
        {/* Main Chat Interface */}
        <div className="flex-1 min-h-0">
          <FounderChatPanel 
            assistantId="founder"
            currentMode={currentMode}
          />
        </div>
      </div>
    </FounderCommandCenterLayout>
  );
}
