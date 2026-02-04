// src/app/page.tsx (Updated with Login Button & i18n)
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
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
                MietCheck.ch
              </span>
              <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                BETA
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {status === 'loading' ? (
                <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : session ? (
                <>
                  <span className="text-gray-700 hidden sm:inline">
                    👋 {session.user?.name || session.user?.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    📊 {t('nav.dashboard')}
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
                    🚀 {t('home.hero.cta')}
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
            {t('home.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.hero.headline')}
          </p>
          
          {session ? (
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              📊 Zu meinem Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              🚀 Jetzt kostenlos starten
            </Link>
          )}
        </div>

        {/* Current Rate Banner */}
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-16 max-w-3xl mx-auto">
          <div className="text-center">
            <p className="text-green-900 font-bold text-lg mb-2">
              🎉 Gute Nachrichten für Mieter!
            </p>
            <p className="text-green-800">
              Der Referenzzinssatz ist seit September 2025 auf <strong>1.25%</strong> gesunken.
              Tausende Mieter in der Schweiz können jetzt ihre Miete senken.
            </p>
          </div>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.features.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                1️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Konto erstellen
              </h3>
              <p className="text-gray-600">
                Kostenlos registrieren und Zugang zu Ihrem persönlichen Dashboard erhalten
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                2️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Vertrag analysieren
              </h3>
              <p className="text-gray-600">
                Mietvertrag hochladen oder Daten manuell eingeben. KI berechnet Ihr Sparpotential
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                3️⃣
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Brief generieren
              </h3>
              <p className="text-gray-600">
                Offizielles Herabsetzungsbegehren erstellen und an Vermieter senden
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t('home.pricing.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 0 */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-green-500">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🔔</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Service 0
                </h3>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  KOSTENLOS
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Email-Benachrichtigung</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Zinssatz-Updates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span className="text-gray-700">Persönliches Dashboard</span>
                </li>
              </ul>
              
              <Link
                href="/login"
                className="block w-full bg-green-600 text-white py-3 rounded-lg font-bold text-center hover:bg-green-700 transition-colors"
              >
                Jetzt registrieren
              </Link>
            </div>

            {/* Service 1 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Service 1
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  CHF 20
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">KI-Vertragsanalyse</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Einsparungsberechnung</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Detaillierte Analyse</span>
                </li>
              </ul>
              
              <Link
                href={session ? "/dashboard" : "/login"}
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-center hover:bg-blue-700 transition-colors"
              >
                {session ? "Im Dashboard kaufen" : "Jetzt starten"}
              </Link>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📄</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Service 2
                </h3>
                <div className="text-3xl font-bold text-blue-600 mb-4">
                  CHF 50
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">Rechtsgültiger Brief</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">VMWG-konform</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">PDF zum Download</span>
                </li>
              </ul>
              
              <Link
                href={session ? "/dashboard" : "/login"}
                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-center hover:bg-blue-700 transition-colors"
              >
                {session ? "Im Dashboard kaufen" : "Jetzt starten"}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-600 rounded-lg p-12 mb-16 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2.0 Mio</div>
              <div className="text-blue-100">Berechtigte Wohnungen</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">CHF 456</div>
              <div className="text-blue-100">Durchschnittliche Einsparung/Jahr</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3 Min</div>
              <div className="text-blue-100">Zeit bis zur Antragstellung</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bereit, Ihre Miete zu senken?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {session 
              ? "Gehen Sie zu Ihrem Dashboard und starten Sie die Analyse"
              : "Erstellen Sie jetzt ein kostenloses Konto"}
          </p>
          <Link
            href={session ? "/dashboard" : "/login"}
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            {session ? "📊 Zum Dashboard" : "🚀 Kostenlos registrieren"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">MietCheck.ch</h3>
              <p className="text-gray-400 text-sm">
                Automatischer Mietminderungs-Service für die Schweiz
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white">Über uns</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Kontakt</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/datenschutz" className="text-gray-400 hover:text-white">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-gray-400 hover:text-white">AGB</Link></li>
                <li><Link href="/impressum" className="text-gray-400 hover:text-white">Impressum</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 {t('footer.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
}
