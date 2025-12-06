import { notFound } from 'next/navigation';
import MonitoringPageClient from './page-client';

export default async function MonitoringPage() {
  // Authentication is handled client-side via useAuth hook
  // This page is protected by the client component
  return <MonitoringPageClient />;
}

