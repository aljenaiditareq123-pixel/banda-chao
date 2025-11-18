import { redirect } from 'next/navigation';

export default function VideosNewPage() {
  // حالياً نحول هذه الصفحة إلى مسار تسجيل الدخول
  redirect('/login?redirect=/videos/new');
}
