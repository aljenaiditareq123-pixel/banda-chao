import Providers from '@/components/Providers';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = params;
  
  // Ensure locale is valid, default to 'zh' if not
  const validLocale = (locale === 'zh' || locale === 'ar' || locale === 'en') ? locale : 'zh';

  return (
    <Providers initialLocale={validLocale} showHeader={true} showChatWidget={true}>
      {children}
    </Providers>
  );
}

