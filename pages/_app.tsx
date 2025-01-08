import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext'
import Layout from '../components/layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
        <Layout>
            <Component {...pageProps} />
        </Layout>
    </AuthProvider>
  );
}

export default MyApp;