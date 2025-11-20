import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar-EG'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
