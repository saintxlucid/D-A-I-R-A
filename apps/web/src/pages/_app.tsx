import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';
import createApolloClient from '@/lib/apollo-client';
import '@/styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const client = createApolloClient();

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { locale } = router;

  useEffect(() => {
    // Set document direction based on locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale || 'en';
  }, [locale]);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
