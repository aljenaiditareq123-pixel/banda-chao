"use client";

import FounderCommandCenterLayout from "@/components/founder/FounderCommandCenterLayout";
import DocumentList from "@/components/founder/DocumentList";

export default function FounderDocumentsPageClient() {
  return (
    <FounderCommandCenterLayout currentPage="documents">
      <div className="h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Core Documents
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Access and manage the six foundational documents of Banda Chao
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
          <DocumentList compact={false} />
        </div>
      </div>
    </FounderCommandCenterLayout>
  );
}
