import { redirect } from 'next/navigation';

export default function ProductsNewPage() {
  // حالياً نحول هذه الصفحة إلى مسار أكثر أماناً
  redirect('/login?redirect=/products/new');
}
