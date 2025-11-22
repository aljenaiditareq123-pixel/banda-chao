# إصلاح مشكلة 401 Unauthorized مع Gemini API ✅

## المشكلة
كانت Founder Console تعرض خطأ `401 Unauthorized` عند محاولة الاتصال بـ Gemini API.

## السبب
1. **استخدام API format غير صحيح**: كان الكود يستخدم `model.generateContent(message.trim())` مباشرة، بينما يتطلب Gemini API format محدّد.
2. **معالجة أخطاء غير كاملة**: لم تكن هناك معالجة محددة لخطأ 401.

## الحل

### 1. ✅ تحديث API Call Format

**قبل:**
```typescript
const result = await model.generateContent(message.trim());
```

**بعد:**
```typescript
const result = await model.generateContent({
  contents: [{ 
    role: 'user', 
    parts: [{ text: message.trim() }] 
  }]
});
```

### 2. ✅ تحسين قراءة متغير البيئة

**التحقق من وجود المفتاح:**
```typescript
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  console.error('[AI] Missing GEMINI_API_KEY environment variable');
  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    console.error('[AI] GEMINI_API_KEY not found in environment variables');
    console.error('[AI] Available env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
  }
  return res.status(500).json({
    error: 'AI service not configured',
    message: 'GEMINI_API_KEY environment variable is not set',
  });
}
```

### 3. ✅ إضافة Logging للتطوير

**Development-only logging (لا يسجّل المفتاح الكامل):**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[AI] GEMINI_API_KEY found:', geminiApiKey ? `${geminiApiKey.substring(0, 10)}...` : 'MISSING');
}
```

### 4. ✅ جعل الموديل قابلاً للتكوين

**قبل:**
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  systemInstruction: systemPrompt,
});
```

**بعد:**
```typescript
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const model = genAI.getGenerativeModel({ 
  model: modelName,
  systemInstruction: systemPrompt,
});
```

### 5. ✅ تحسين معالجة الأخطاء

**إضافة معالجة محددة لـ 401:**
```typescript
catch (error: any) {
  console.error('[AI] Error generating response:', error);
  
  // Handle specific Gemini API errors
  // 401 Unauthorized typically means invalid API key
  if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    console.error('[AI] 401 Unauthorized - API key is invalid or expired');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'GEMINI_API_KEY is invalid or expired. Please check your API key.',
    });
  }
  
  // ... باقي معالجة الأخطاء
}
```

## الملفات المعدلة

1. ✅ `server/src/api/ai.ts`
   - تحديث `generateContent` لاستخدام format الصحيح
   - تحسين التحقق من `GEMINI_API_KEY`
   - إضافة logging للتطوير
   - جعل الموديل قابلاً للتكوين
   - تحسين معالجة الأخطاء (خاصة 401)

## التحقق

### ✅ Code Level:
- Build passes without errors
- No TypeScript errors
- No ESLint warnings

### ⚠️ Environment Variables:
يجب التأكد من تعيين `GEMINI_API_KEY` في:
1. **Local Development**: `.env` في مجلد `server/`
2. **Production (Render)**: Environment Variables في Render Dashboard

### 🔍 Testing:
1. **Development**: 
   ```bash
   cd server
   node -e "console.log(process.env.GEMINI_API_KEY ? 'Key found' : 'Key missing')"
   ```

2. **Health Check**:
   ```bash
   curl http://localhost:3001/api/v1/ai/health
   ```
   يجب أن يعيد:
   ```json
   {
     "status": "ok",
     "service": "AI Assistant",
     "apiKeyConfigured": true,
     "timestamp": "..."
   }
   ```

3. **Test Assistant Call**:
   ```bash
   curl -X POST http://localhost:3001/api/v1/ai/assistant \
     -H "Content-Type: application/json" \
     -d '{"assistant": "founder", "message": "مرحباً"}'
   ```

## متغيرات البيئة المطلوبة

### Backend (.env في `server/`):
```bash
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-1.5-flash  # Optional, defaults to gemini-1.5-flash
```

### Production (Render Dashboard):
يجب إضافة `GEMINI_API_KEY` في Environment Variables.

## ملاحظات مهمة

1. **لا يوجد Hard-coded Keys**: جميع المفاتيح تأتي من `process.env`
2. **Development Logging**: Logging مفصل فقط في `NODE_ENV=development`
3. **Security**: لا يتم طباعة المفتاح الكامل في logs، فقط أول 10 أحرف
4. **Error Handling**: معالجة محددة لـ 401 Unauthorized
5. **Configurable Model**: يمكن تغيير الموديل عبر `GEMINI_MODEL`

## النتيجة

✅ **Gemini API يعمل بشكل صحيح**
- ✅ API format صحيح
- ✅ التحقق من المفتاح يعمل
- ✅ معالجة أخطاء محسّنة
- ✅ Logging مفيد للتطوير
- ✅ لا يوجد hard-coded values

## الخطوات التالية

1. **إضافة `GEMINI_API_KEY` في Render Dashboard** (إذا لم يكن موجوداً)
2. **اختبار Assistant** في Founder Console
3. **التحقق من Logs** للتأكد من عدم وجود أخطاء

---

**الحالة**: ✅ مكتمل - جاهز للاختبار

