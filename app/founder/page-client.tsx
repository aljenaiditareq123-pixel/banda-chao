"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FounderConsoleLayout from "@/components/founder/FounderConsoleLayout";

export default function FounderPageClient() {
  const { user, loading } = useAuth();
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | undefined>(undefined);

  // Note: Auth check is handled by FounderRoute wrapper in app/founder/page.tsx
  // This component only renders if user is authenticated and is FOUNDER
  // No need for additional auth checks here

  const handleAssistantSelect = (assistantId: string) => {
    setSelectedAssistantId(assistantId);
  };

  return (
    <FounderConsoleLayout
      selectedAssistantId={selectedAssistantId as any}
      onAssistantSelect={handleAssistantSelect}
    />
  );
}
