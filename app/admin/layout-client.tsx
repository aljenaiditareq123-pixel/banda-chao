'use client';

/**
 * ULTRA-SIMPLE ADMIN LAYOUT - SAFE MODE
 * This is a minimal version to prove the page works.
 * All complex logic (sidebar, navigation, session management) has been removed.
 * Once this works, we'll gradually add features back.
 */
export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-10 bg-red-100 text-black min-h-screen" dir="rtl">
      <h1 className="text-2xl font-bold mb-4">ADMIN LAYOUT IS WORKING (SAFE MODE)</h1>
      <div className="bg-white p-4 rounded shadow">
        {children}
      </div>
    </div>
  );
}
