# React Error #310 Analysis - "Rendered more hooks than during the previous render"

## المشكلة (The Problem)
React Error #310 يحدث عندما يتغير عدد الـ hooks التي يتم استدعاؤها بين الـ renders المختلفة في نفس المكون (Component).

## السبب الفعلي المكتشف (Actual Root Cause Found)

### المشكلة الرئيسية: Early Returns بعد Hooks في `ChatPageClient`

في ملف `app/[locale]/messages/[conversationId]/page-client.tsx`:

```tsx
export default function ChatPageClient(...) {
  const { user, loading } = useAuth();  // Hook 1
  const [messages, setMessages] = useState(...);  // Hook 2
  useEffect(...);  // Hook 3

  if (loading) return <LoadingState />;  // ⚠️ Early return بعد hooks
  if (!user) return <ErrorState />;  // ⚠️ Early return بعد hooks
  
  return <ChatBox />;  // Render ChatBox فقط عندما loading=false و user موجود
}
```

**المشكلة:** هذا الكود صحيح من ناحية React Rules، لكن المشكلة الحقيقية هي أن `ChatBox` مكون كبير يحتوي على 8 hooks، وعندما يتغير `loading` أو `user`، يتغير الـ render path، مما قد يسبب hydration mismatch بين server و client.

### المشكلة الثانية: LanguageProvider و SSR Mismatch

`LanguageProvider` يستخدم `useEffect` لقراءة `localStorage` بعد الـ mount:

```tsx
export function LanguageProvider({ children, defaultLanguage = 'ar' }) {
  const [language, setLanguageState] = useState(defaultLanguage);
  
  useEffect(() => {
    // قراءة من localStorage - يختلف بين server و client
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);
  
  // ...
}
```

**المشكلة:** 
- Server render: `language = 'ar'` (default)
- Client render (بعد hydration): `language = savedLanguage` (من localStorage)
- هذا يسبب hydration mismatch → React يعيد render → قد يسبب Error #310

### المشكلة الثالثة: ClientOnly Component Pattern

`ClientOnly` يستخدم early return:

```tsx
export default function ClientOnly({ children }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;  // ⚠️
  return <>{children}</>;
}
```

عندما يتم استخدامه في `app/[locale]/page.tsx`:

```tsx
<ClientOnly>
  <HomePageClient ... />
</ClientOnly>
```

**المشكلة:** `HomePageClient` يحتوي على hooks، وعندما `hasMounted = false` (في server render أو أول client render)، يتم return `null`، مما يعني أن `HomePageClient` لا يتم render → hooks الخاصة به لا يتم استدعاؤها. ثم عندما `hasMounted = true`، يتم render `HomePageClient` → hooks الخاصة به يتم استدعاؤها. هذا يغير عدد الـ hooks بين renders!

## السبب المحتمل (Expected Cause)

### 1. **Early Returns After Hooks** ⚠️
المشكلة الأساسية: مكونات تعيد القيمة مبكراً (`early return`) بعد استدعاء hooks، مما قد يسبب اختلاف في عدد الـ hooks بين الـ renders.

**مثال من `ChatPageClient`:**
```tsx
export default function ChatPageClient(...) {
  const { user, loading } = useAuth();  // Hook 1
  const [messages, setMessages] = useState(...);  // Hook 2
  useEffect(...);  // Hook 3

  if (loading) return <LoadingState />;  // ⚠️ Early return
  if (!user) return <ErrorState />;  // ⚠️ Early return
  
  return <ChatBox />;  // Normal return
}
```

**المشكلة:** عندما يتغير `loading` من `true` إلى `false`، أو `user` من `null` إلى object، React يعيد الـ render، ولكن إذا كان هناك hooks إضافية في المسار العادي (normal path) بعد الـ early returns، فسيحدث الخطأ.

### 2. **Conditional Hook Calls Based on Locale/Language** ⚠️
مكونات تستدعي hooks بشكل مشروط بناءً على `locale` أو `language`:

```tsx
// ❌ خطأ - hooks مشروطة
if (locale === 'ar') {
  const { t } = useLanguage();  // Hook فقط للعربية
}
const data = useData();  // Hook دائماً
```

### 3. **Server-Side Rendering (SSR) Mismatch** ⚠️
اختلاف في عدد الـ hooks بين الـ server render والـ client render:

- Server: 3 hooks
- Client: 4 hooks (بعد hydration)

هذا يسبب hydration mismatch → React Error #310

### 4. **LanguageProvider/LanguageContext Issues** ⚠️
`LanguageProvider` أو `useLanguage()` قد يسبب مشاكل إذا:
- يتم استدعاؤه بشكل مشروط
- يختلف عدد الـ hooks داخله بين الـ renders
- يعيد render بشكل مختلف على server vs client

## الحل المباشر (Direct Solution)

### الحل 1: إزالة ClientOnly من HomePage (الأولوية)

`app/[locale]/page.tsx` يستخدم `ClientOnly` بشكل غير صحيح. يجب استخدام `dynamic` import مع `ssr: false` بدلاً من ذلك:

```tsx
// ❌ خطأ - الحالي
return (
  <ClientOnly>
    <HomePageClient ... />
  </ClientOnly>
);

// ✅ صحيح - يجب أن يكون
import dynamic from 'next/dynamic';
const HomePageClient = dynamic(() => import('@/components/home/HomePageClient'), { ssr: false });

return <HomePageClient ... />;
```

### الحل 2: إصلاح ChatPageClient - استخدام Conditional Rendering

بدلاً من early returns، استخدم conditional rendering:

```tsx
// ❌ خطأ - الحالي
export default function ChatPageClient(...) {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(...);
  useEffect(...);
  
  if (loading) return <LoadingState />;
  if (!user) return <ErrorState />;
  return <ChatBox />;
}

// ✅ صحيح - يجب أن يكون
export default function ChatPageClient(...) {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(...);
  useEffect(...);
  
  // Conditional rendering بدلاً من early returns
  if (loading) {
    return <LoadingState />;
  }
  
  if (!user) {
    return <ErrorState />;
  }
  
  // هذا path دائماً موجود، لكن ChatBox يتم render فقط عندما user موجود
  return <ChatBox ... />;
}
```

**ملاحظة:** في الواقع، early returns في هذا المثال صحيحة من ناحية React Rules، لكن المشكلة الحقيقية هي في `ClientOnly` wrapper!

### الحل 3: التأكد من أن LanguageProvider يستخدم dynamic import

`ClientLanguageProvider` يستخدم `dynamic` import بالفعل، وهذا صحيح. لكن يجب التأكد من أنه مستخدم في جميع الأماكن.

## الحلول الموصى بها الأخرى (Other Recommended Solutions)

### الحل 1: Move All Hooks Before Any Conditional Logic
```tsx
// ✅ صحيح - جميع الـ hooks قبل أي conditional logic
export default function ChatPageClient(...) {
  // جميع الـ hooks أولاً
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(...);
  const { t } = useLanguage();
  useEffect(...);
  
  // ثم الـ conditional logic
  if (loading) return <LoadingState />;
  if (!user) return <ErrorState />;
  
  return <ChatBox />;
}
```

### الحل 2: Use Conditional Rendering Instead of Early Returns
```tsx
// ✅ صحيح - conditional rendering بدلاً من early returns
export default function ChatPageClient(...) {
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState(...);
  useEffect(...);
  
  return (
    <>
      {loading && <LoadingState />}
      {!loading && !user && <ErrorState />}
      {!loading && user && <ChatBox />}
    </>
  );
}
```

### الحل 3: Ensure Consistent Hook Calls in LanguageProvider
```tsx
// ✅ صحيح - hooks ثابتة دائماً
export function LanguageProvider({ children, defaultLanguage = 'ar' }) {
  const [language, setLanguageState] = useState(defaultLanguage);  // دائماً
  useEffect(...);  // دائماً
  
  // لا hooks مشروطة هنا
  return <LanguageContext.Provider>...</LanguageContext.Provider>;
}
```

### الحل 4: Use `useSafeLanguage` Instead of `useLanguage` When Context May Be Missing
```tsx
// ✅ صحيح - safe hook
import { useSafeLanguage } from '@/hooks/useSafeLanguage';

export default function MyComponent() {
  const { language, t } = useSafeLanguage();  // لا يرمي error إذا كان context غير موجود
  // ...
}
```

## الخطوات التالية (Next Steps)

1. **فحص جميع المكونات التي تستخدم early returns بعد hooks**
2. **التأكد من أن جميع hooks مستدعاة قبل أي conditional logic**
3. **فحص LanguageProvider و LanguageContext للتأكد من عدم وجود hooks مشروطة**
4. **استخدام React DevTools للتحقق من عدد الـ hooks في كل render**
5. **تشغيل التطبيق في development mode للحصول على error messages أكثر وضوحاً**

## الملفات المشبوهة (Suspicious Files)

1. `app/[locale]/messages/[conversationId]/page-client.tsx` - early returns بعد hooks
2. `components/home/HomePageClient.tsx` - استخدام `useMounted()` مع conditional logic
3. `contexts/LanguageContext.tsx` - قد يكون هناك hydration mismatch
4. أي مكون يستخدم `useLanguage()` مع conditional rendering

## ملاحظات إضافية (Additional Notes)

- React Error #310 يحدث فقط في production (minified code)
- في development mode، React يعطي error message أكثر وضوحاً
- الحل الأفضل هو **ضمان نفس عدد الـ hooks في كل render**
- استخدام ESLint plugin `react-hooks/rules-of-hooks` لمنع هذه المشاكل
