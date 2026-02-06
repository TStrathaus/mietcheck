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
              {status === 'loading' ? (
                <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : session ? (
                <>
                  <span className="text-gray-700 hidden sm:inline">
                    {t('nav.greeting')} {session.user?.name || session.user?.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {t('home.ctaDashboard')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-gray-900 font-medium hidden sm:inline"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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
              {t('home.ctaDashboard')}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              {t('home.ctaStart')}
            </Link>
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

        {/* Pricing */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.pricingTitle')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-4">{t('home.priceAnalysis')}</p>
                <p className="text-gray-700 mb-4">{t('home.priceAnalysisDesc')}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-lg shadow-lg border-2 border-blue-500">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-4">{t('home.priceLetter')}</p>
                <p className="text-gray-700 mb-4">{t('home.priceLetterDesc')}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6">{t('home.priceNote')}</p>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
