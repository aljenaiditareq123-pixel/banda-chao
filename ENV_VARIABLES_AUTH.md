# 🔐 Environment Variables for Social-Only Authentication

## OWNER PRIVILEGE
```
OWNER_EMAIL=your-email@example.com
```

## THE 8 GATES (Social Providers)

### Gate 1: Google (Global)
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Gate 2: Apple (Global)
```
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=
```

### Gate 3: Huawei ID (HarmonyOS)
```
HUAWEI_CLIENT_ID=
HUAWEI_CLIENT_SECRET=
```

### Gate 4: WeChat (China Social)
```
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

### Gate 5: Alipay (China Commerce)
```
ALIPAY_APP_ID=
ALIPAY_APP_SECRET=
```

### Gate 6: QQ (China Gaming)
```
QQ_APP_ID=
QQ_APP_SECRET=
```

### Gate 7: Douyin (China Video)
```
DOUYIN_CLIENT_KEY=
DOUYIN_CLIENT_SECRET=
```

### Gate 8: Weibo (China Microblogging)
```
WEIBO_CLIENT_ID=
WEIBO_CLIENT_SECRET=
```

## NextAuth Configuration
```
AUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://bandachao.com
```

## HOW TO ADD A 9TH PROVIDER

1. Edit `lib/auth/providers.ts`
2. Add provider config to `PROVIDERS` array:
```typescript
{
  id: 'your-provider',
  name: 'Your Provider',
  icon: 'YourProvider',
  color: '#HEXCOLOR',
  envVars: {
    clientId: 'YOUR_PROVIDER_CLIENT_ID',
    clientSecret: 'YOUR_PROVIDER_CLIENT_SECRET',
  },
  isCustom: true, // if custom OAuth
  customAuthUrl: 'https://oauth.provider.com/authorize',
}
```
3. Add icon to `components/auth/LoginOptions.tsx` BrandIcons
4. Add env vars above
5. Implement `exchangeOAuthCode` in `lib/auth/providers.ts` if custom

Done! Provider auto-registers.

