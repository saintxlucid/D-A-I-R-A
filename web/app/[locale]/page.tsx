import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LandingPage() {
  // Note: useTranslations requires provider setup, fallback to static for now
  const t = {
    'landing.title': 'Connect. Share. Grow.',
    'landing.subtitle': 'Join the Egyptian community social network',
    'landing.cta_login': 'Login',
    'landing.cta_register': 'Sign Up',
    'landing.features_title': 'Why D-A-I-R-A?',
    'landing.feature1': 'Optimized for Egyptian networks',
    'landing.feature2': '100% encrypted & private',
    'landing.feature3': 'Rapid-fire sharing & engagement',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">D-A-I-R-A</h1>
        <nav className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100"
          >
            {t['landing.cta_login']}
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            {t['landing.cta_register']}
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-white mb-6">
          {t['landing.title']}
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          {t['landing.subtitle']}
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">
          {t['landing.features_title']}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🚀', title: t['landing.feature1'] },
            { icon: '🔒', title: t['landing.feature2'] },
            { icon: '⚡', title: t['landing.feature3'] },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-slate-700 p-6 rounded-lg hover:bg-slate-600 transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <p className="text-white font-semibold">{feature.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 text-center text-gray-400 border-t border-slate-700">
        <p>© 2025 D-A-I-R-A. All rights reserved.</p>
      </footer>
    </div>
  );
}
