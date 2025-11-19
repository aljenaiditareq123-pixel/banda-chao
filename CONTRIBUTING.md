# Banda Chao - Contributing Guide

## Getting Started

1. **Fork the repository**
2. **Clone your fork**:
   ```bash
   git clone https://github.com/your-username/banda-chao.git
   cd banda-chao
   ```

3. **Install dependencies**:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd server
   npm install
   ```

4. **Set up environment variables**:
   - Copy `.env.example` to `.env.local` (frontend)
   - Copy `server/.env.example` to `server/.env` (backend)

5. **Set up database**:
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma db seed
   ```

6. **Run development servers**:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Backend
   cd server
   npm run dev
   ```

## Development Workflow

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Run `npm run lint` before committing
- **Prettier**: Format code automatically (if configured)

### Git Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**:
   - Write clean, readable code
   - Add comments for complex logic
   - Follow existing patterns

3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   ```

4. **Commit**:
   ```bash
   git add -A
   git commit -m "feat: your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Format

Use clear, descriptive commit messages:

```
feat: add product search functionality
fix: resolve checkout payment error
chore: update dependencies
docs: add API documentation
refactor: improve error handling
```

## Code Organization

### Frontend Structure

- `app/[locale]/*` - Locale-aware pages (Server Components)
- `components/*` - Reusable React components
- `contexts/*` - React Context providers
- `lib/*` - Utility functions and API clients
- `types/*` - TypeScript type definitions

### Backend Structure

- `server/src/api/*` - API route handlers
- `server/src/middleware/*` - Express middleware
- `server/src/utils/*` - Utility functions
- `server/prisma/*` - Database schema and migrations

## API Guidelines

### Always Use Centralized Helpers

**✅ Good**:
```tsx
import { getApiBaseUrl } from '@/lib/api-utils';
const apiBaseUrl = getApiBaseUrl();
const response = await fetch(`${apiBaseUrl}/products`);
```

**❌ Bad**:
```tsx
const response = await fetch('https://banda-chao-backend.onrender.com/api/v1/products');
```

### Error Handling

Always handle errors gracefully:

```tsx
try {
  const response = await api.get('/products');
  return response.data;
} catch (error: any) {
  console.error('Failed to fetch products:', error);
  // Return empty array or show user-friendly message
  return [];
}
```

## Translation Guidelines

### Adding New Translations

1. Add key to all three languages in `contexts/LanguageContext.tsx`:
   ```tsx
   zh: {
     'newKey': '中文文本',
   },
   ar: {
     'newKey': 'النص العربي',
   },
   en: {
     'newKey': 'English text',
   },
   ```

2. Use the translation:
   ```tsx
   const { t } = useLanguage();
   return <p>{t('newKey') || 'Fallback text'}</p>;
   ```

### Translation Keys Naming

- Use camelCase: `productDetailTitle`
- Be descriptive: `checkoutErrorValidation` not `error1`
- Group related keys: `checkoutError*`, `makerProfile*`

## Testing

### Before Submitting PR

1. **Lint**:
   ```bash
   npm run lint
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Test manually**:
   - Test in all three languages (zh, ar, en)
   - Test on mobile and desktop
   - Test error scenarios
   - Verify accessibility (keyboard navigation, screen readers)

## Pull Request Guidelines

### PR Title Format

```
feat: add product search
fix: resolve checkout error
chore: update dependencies
```

### PR Description

Include:
- **What**: What does this PR do?
- **Why**: Why is this change needed?
- **How**: How was it implemented?
- **Testing**: How was it tested?

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Tests pass (if applicable)
- [ ] Translations added for all languages
- [ ] Accessibility checked (ARIA labels, keyboard nav)
- [ ] Documentation updated (if needed)

## Code Review

- Be respectful and constructive
- Focus on code quality, not personal preferences
- Ask questions if something is unclear
- Suggest improvements, don't just point out issues

## Questions?

- Check existing documentation
- Review similar code in the codebase
- Ask in issues or discussions

Thank you for contributing to Banda Chao! 🚀

