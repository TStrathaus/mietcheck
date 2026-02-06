// src/app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function HomePage() {
  const { data: session, status } = useSession();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">
                {t('home.brand')}
              </span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                {t('home.beta')}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {session ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium hidden md:inline"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm"
                  >
                    🔔 Liste
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    {t('nav.startFree')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>

          {session ? (
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              📊 {t('home.ctaDashboard')}
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="inline-block bg-green-500 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-green-600 transition-colors shadow-lg"
              >
                🔔 Auf Liste setzen
              </Link>
              <Link
                href="/login"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
              >
                👤 Kostenlos registrieren
              </Link>
            </div>
          )}
        </div>

        {/* Current Rate Banner */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-16 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-green-900 font-bold text-lg mb-2">
              {t('home.bannerTitle')}
            </p>
            <p className="text-green-800">
              {t('home.bannerText')}
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.howItWorksTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📄
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step1Title')}
              </h3>
              <p className="text-gray-600">
                {t('home.step1Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step2Title')}
              </h3>
              <p className="text-gray-600">
                {t('home.step2Desc')}
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✉️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step3Title')}
              </h3>
              <p className="text-gray-600">
                {t('home.step3Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Why MietCheck */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.whyTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.why1Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home.why1Desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.why2Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home.why2Desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.why3Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home.why3Desc')}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {t('home.why4Title')}
              </h3>
              <p className="text-gray-600 text-sm">
                {t('home.why4Desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Services / Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Transparente Preise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Service 0: Benachrichtigung */}
            <div className="bg-green-50 p-8 rounded-lg shadow-lg border-2 border-green-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Service 0</h3>
                <p className="text-5xl font-bold text-green-600 mb-4">Kostenlos</p>
                <p className="text-gray-700 mb-6">
                  Erhalte eine E-Mail sobald der Referenzzinssatz sinkt und spare automatisch bei deiner Miete.
                </p>
                <Link
                  href="/register"
                  className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors w-full"
                >
                  Auf Liste setzen
                </Link>
              </div>
            </div>

            {/* Service 1: Analyse */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Service 1</h3>
                <p className="text-5xl font-bold text-blue-600 mb-4">CHF 9</p>
                <p className="text-gray-700 mb-6">
                  KI-Analyse deines Mietvertrags. Automatische Berechnung des Einsparpotentials basierend auf Referenzzins.
                </p>
                {session ? (
                  <Link
                    href="/analyze"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full"
                  >
                    Jetzt analysieren
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full"
                  >
                    Registrieren
                  </Link>
                )}
              </div>
            </div>

            {/* Service 2: Brief */}
            <div className="bg-blue-50 p-8 rounded-lg shadow-lg border-2 border-blue-500">
              <div className="text-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Service 2</h3>
                <p className="text-5xl font-bold text-blue-600 mb-4">CHF 49</p>
                <p className="text-gray-700 mb-6">
                  Rechtssicheres Herabsetzungsschreiben in 1 Minute. Basierend auf OR 269d und aktuellen SNB-Daten.
                </p>
                {session ? (
                  <Link
                    href="/generate"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full"
                  >
                    Brief erstellen
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors w-full"
                  >
                    Registrieren
                  </Link>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6">
            💰 Spare CHF 300-700 pro Jahr. Einmalige Kosten. Keine Abos.
          </p>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.testimonialsTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 mb-4 italic">{t('home.testimonial1')}</p>
              <p className="text-gray-500 text-sm">{t('home.testimonial1Author')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 mb-4 italic">{t('home.testimonial2')}</p>
              <p className="text-gray-500 text-sm">{t('home.testimonial2Author')}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-700 mb-4 italic">{t('home.testimonial3')}</p>
              <p className="text-gray-500 text-sm">{t('home.testimonial3Author')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{t('home.brand')}</h3>
              <p className="text-gray-400">
                {t('home.heroSubtitle')}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t('home.footerLegal')}</h3>
              <ul className="space-y-2">
                <li><Link href="/impressum" className="text-gray-400 hover:text-white">{t('nav.impressum')}</Link></li>
                <li><Link href="/datenschutz" className="text-gray-400 hover:text-white">{t('nav.datenschutz')}</Link></li>
                <li><Link href="/agb" className="text-gray-400 hover:text-white">{t('nav.agb')}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">{t('home.footerSupport')}</h3>
              <p className="text-gray-400">{t('home.footerSupportEmail')}</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>{t('home.footerRights')}</p>
            <p className="mt-2 text-xs text-gray-600">v{process.env.NEXT_PUBLIC_BUILD_ID || 'dev'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
