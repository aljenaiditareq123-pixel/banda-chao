'use client';

import Card from '@/components/common/Card';
import Button from '@/components/Button';
import Link from 'next/link';

interface AboutPageClientProps {
  locale: string;
}

export default function AboutPageClient({ locale }: AboutPageClientProps) {
  const content = {
    ar: {
      title: 'عن Banda Chao',
      vision: {
        title: 'رؤيتنا',
        text: 'Banda Chao هي منصة اجتماعية تجارية عالمية تربط الحرفيين المستقلين من حول العالم بالمشترين. نؤمن بأن كل حرفي يستحق منصة عادلة لعرض إبداعه وربطه مباشرة مع جمهوره.',
      },
      mission: {
        title: 'رسالتنا',
        text: 'تمكين الحرفيين من بناء أعمالهم الخاصة، وربطهم مباشرة مع المشترين في جميع أنحاء العالم، مع توفير تجربة اجتماعية غنية تعزز الثقة والشفافية.',
      },
      values: {
        title: 'قيمنا',
        items: [
          {
            title: 'العدالة (Fairness)',
            description: 'نؤمن بمنصة عادلة حيث يحصل كل حرفي على فرصة متساوية للنجاح.',
            icon: '⚖️',
          },
          {
            title: 'الثقة (Trust)',
            description: 'نبني الثقة من خلال الشفافية والاتصال المباشر بين الحرفيين والمشترين.',
            icon: '🤝',
          },
          {
            title: 'الذكاء (Intelligence)',
            description: 'نستخدم الذكاء الاصطناعي لمساعدة الحرفيين والمشترين في اتخاذ قرارات أفضل.',
            icon: '🧠',
          },
          {
            title: 'اجتماعي + تجاري (Social+Commerce)',
            description: 'نجمع بين القوة الاجتماعية للمحتوى والتجارة الإلكترونية لخلق تجربة فريدة.',
            icon: '🌐',
          },
        ],
      },
      whyUAE: {
        title: 'لماذا الإمارات / RAKEZ؟',
        text: 'الإمارات العربية المتحدة، وخاصة RAKEZ، توفر بيئة مثالية للأعمال التجارية الدولية. موقع استراتيجي يربط الشرق الأوسط بآسيا، مع قوانين أعمال مرنة ودعم حكومي قوي للشركات الناشئة.',
      },
      whyChinaME: {
        title: 'لماذا الصين + الشرق الأوسط؟',
        text: 'الصين هي أكبر سوق للحرف اليدوية في العالم، والشرق الأوسط لديه تقليد غني في الحرف اليدوية. نجمع بين القوتين لخلق جسر ثقافي وتجاري يربط الحرفيين والمشترين من كلا المنطقتين.',
      },
      team: {
        title: 'فريق العمل',
        founder: {
          name: 'طارق الجنيدي',
          role: 'المؤسس والرئيس التنفيذي',
          description: 'مؤسس Banda Chao، رائد أعمال شغوف بتمكين الحرفيين وربط الثقافات. رسالته الإنسانية هي خلق منصة عادلة حيث يمكن لكل حرفي أن يزدهر ويشارك إبداعه مع العالم.',
          message: 'نؤمن بأن الإبداع لا يعرف حدوداً، وأن كل حرفي يستحق فرصة لعرض موهبته للعالم.',
        },
      },
    },
    en: {
      title: 'About Banda Chao',
      vision: {
        title: 'Our Vision',
        text: 'Banda Chao is a global social-commerce platform connecting independent artisans worldwide with buyers. We believe every maker deserves a fair platform to showcase their creativity and connect directly with their audience.',
      },
      mission: {
        title: 'Our Mission',
        text: 'Empower artisans to build their own businesses, connecting them directly with buyers around the world, while providing a rich social experience that fosters trust and transparency.',
      },
      values: {
        title: 'Our Values',
        items: [
          {
            title: 'Fairness',
            description: 'We believe in a fair platform where every artisan gets an equal opportunity to succeed.',
            icon: '⚖️',
          },
          {
            title: 'Trust',
            description: 'We build trust through transparency and direct connection between artisans and buyers.',
            icon: '🤝',
          },
          {
            title: 'Intelligence',
            description: 'We use artificial intelligence to help artisans and buyers make better decisions.',
            icon: '🧠',
          },
          {
            title: 'Social+Commerce',
            description: 'We combine the social power of content with e-commerce to create a unique experience.',
            icon: '🌐',
          },
        ],
      },
      whyUAE: {
        title: 'Why UAE / RAKEZ?',
        text: 'The United Arab Emirates, especially RAKEZ, provides an ideal environment for international business. A strategic location connecting the Middle East with Asia, with flexible business laws and strong government support for startups.',
      },
      whyChinaME: {
        title: 'Why China + Middle East?',
        text: 'China is the world&apos;s largest market for handicrafts, and the Middle East has a rich tradition in craftsmanship. We bring together both strengths to create a cultural and commercial bridge connecting artisans and buyers from both regions.',
      },
      team: {
        title: 'Our Team',
        founder: {
          name: 'Tareq Aljenaidi',
          role: 'Founder & CEO',
          description: 'Founder of Banda Chao, an entrepreneur passionate about empowering artisans and connecting cultures. His humanitarian mission is to create a fair platform where every artisan can thrive and share their creativity with the world.',
          message: 'We believe that creativity knows no boundaries, and that every artisan deserves a chance to showcase their talent to the world.',
        },
      },
    },
    zh: {
      title: '关于 Banda Chao',
      vision: {
        title: '我们的愿景',
        text: 'Banda Chao 是一个全球社交商务平台，连接世界各地的独立手工艺人与买家。我们相信每个手工艺人都应该有一个公平的平台来展示他们的创造力，并直接与他们的观众联系。',
      },
      mission: {
        title: '我们的使命',
        text: '赋能手工艺人建立自己的业务，直接与世界各地的买家联系，同时提供丰富的社交体验，促进信任和透明度。',
      },
      values: {
        title: '我们的价值观',
        items: [
          {
            title: '公平',
            description: '我们相信一个公平的平台，每个手工艺人都有平等的机会取得成功。',
            icon: '⚖️',
          },
          {
            title: '信任',
            description: '我们通过透明度和手工艺人与买家之间的直接联系建立信任。',
            icon: '🤝',
          },
          {
            title: '智能',
            description: '我们使用人工智能帮助手工艺人和买家做出更好的决策。',
            icon: '🧠',
          },
          {
            title: '社交+商务',
            description: '我们将内容的社会力量与电子商务相结合，创造独特的体验。',
            icon: '🌐',
          },
        ],
      },
      whyUAE: {
        title: '为什么选择阿联酋 / RAKEZ？',
        text: '阿拉伯联合酋长国，特别是 RAKEZ，为国际业务提供了理想的环境。连接中东与亚洲的战略位置，灵活的商业法律以及政府对初创企业的强有力支持。',
      },
      whyChinaME: {
        title: '为什么选择中国 + 中东？',
        text: '中国是世界上最大的手工艺品市场，中东在手工艺方面有着丰富的传统。我们将两种优势结合在一起，创建一个连接两个地区手工艺人和买家的文化和商业桥梁。',
      },
      team: {
        title: '我们的团队',
        founder: {
          name: '塔里克·朱奈迪',
          role: '创始人兼首席执行官',
          description: 'Banda Chao 的创始人，一位热衷于赋能手工艺人和连接文化的企业家。他的人道主义使命是创建一个公平的平台，让每个手工艺人都能茁壮成长，与世界分享他们的创造力。',
          message: '我们相信创造力没有界限，每个手工艺人都应该有机会向世界展示他们的才能。',
        },
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.en;

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t.title}</h1>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.vision.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.vision.text}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.mission.title}</h2>
              <p className="text-gray-600 leading-relaxed">{t.mission.text}</p>
            </div>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t.values.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.values.items.map((value, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Why UAE / RAKEZ */}
        <Card className="mb-12">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.whyUAE.title}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{t.whyUAE.text}</p>
          </div>
        </Card>

        {/* Why China + Middle East */}
        <Card className="mb-12">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t.whyChinaME.title}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{t.whyChinaME.text}</p>
          </div>
        </Card>

        {/* Team */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t.team.title}</h2>
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 md:p-8">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mx-auto mb-2 flex items-center justify-center text-5xl text-white">
                  👤
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">{t.team.founder.name}</h3>
                <p className="text-sm md:text-base text-gray-500">{t.team.founder.role}</p>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-2 max-w-xl">
                  {t.team.founder.description}
                </p>
                <div className="mt-4 w-full bg-blue-50 border border-blue-100 text-blue-800 rounded-xl px-4 py-3 text-sm leading-relaxed">
                  <p className="italic">&quot;{t.team.founder.message}&quot;</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href={`/${locale}`}>
            <Button variant="primary" className="px-8 py-3 text-lg">
              {locale === 'ar' ? 'العودة للصفحة الرئيسية' : locale === 'zh' ? '返回首页' : 'Back to Home'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

