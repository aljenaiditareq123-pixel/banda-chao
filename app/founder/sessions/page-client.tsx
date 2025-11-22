"use client";

import FounderCommandCenterLayout from "@/components/founder/FounderCommandCenterLayout";
import SessionList from "@/components/founder/SessionList";

export default function FounderSessionsPageClient() {
  return (
    <FounderCommandCenterLayout currentPage="sessions">
      <div className="h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Saved Sessions
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage and review your conversation history with Founder Panda
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <SessionList limit={20} compact={false} />
        </div>
      </div>
    </FounderCommandCenterLayout>
  );
}
