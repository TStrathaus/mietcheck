// Homepage - Mobile First Design
import Navigation from '@/components/Navigation';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      {/* Hero Section - Mobile Optimized */}
      <section className="px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            Miete senken in 3 Minuten
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10">
            Sparen Sie CHF 300-700 pro Jahr bei Referenzzinssatz-Senkung.<br className="hidden sm:inline" />
            Automatisch. Legal. Einfach.
          </p>

          {/* Current Rate Banner */}
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 sm:p-6 mb-8 sm:mb-10">
            <p className="text-green-900 font-bold text-base sm:text-lg mb-2">
              📉 Referenzzinssatz: 1.25%
            </p>
            <p className="text-green-800 text-sm sm:text-base">
              Seit September 2025 – Überprüfen Sie jetzt Ihr Einsparpotential!
            </p>
          </div>

          {/* 3 Entry Points - Mobile Stacked */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-2xl mx-auto">
            {/* Entry 1: Benachrichtigung */}
            <Link
              href="/notify"
              className="flex-1 bg-green-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl text-center"
            >
              <div className="text-3xl mb-2">🔔</div>
              <div>Auf Liste setzen</div>
              <div className="text-sm font-normal mt-1 opacity-90">Kostenlos benachrichtigen</div>
            </Link>

            {/* Entry 2: Registrierung */}
            <Link
              href="/register"
              className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-center"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div>Jetzt starten</div>
              <div className="text-sm font-normal mt-1 opacity-90">Kostenlos registrieren</div>
            </Link>

            {/* Entry 3: Login */}
            <Link
              href="/login"
              className="flex-1 bg-gray-100 text-gray-800 px-6 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-all shadow hover:shadow-lg text-center"
            >
              <div className="text-3xl mb-2">🔐</div>
              <div>Login</div>
              <div className="text-sm font-normal mt-1 opacity-75">Bereits registriert?</div>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works - Mobile Optimized */}
      <section className="px-4 py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            So funktioniert's
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                📄
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Upload</h3>
              <p className="text-gray-600">
                Mietvertrag hochladen (PDF/Foto). Unsere KI extrahiert automatisch alle Daten.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                🤖
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Analyse</h3>
              <p className="text-gray-600">
                Automatische Berechnung des Einsparpotentials basierend auf aktuellem Referenzzins.
              </p>
            </div>

            <div className="text-center p-6 sm:col-span-2 lg:col-span-1">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                ✉️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Brief</h3>
              <p className="text-gray-600">
                Rechtssicheres Herabsetzungsschreiben in 1 Minute. Direkt an Vermieter senden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Mobile Optimized */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Transparente Preise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Service 0 */}
            <div className="bg-green-50 p-6 sm:p-8 rounded-lg shadow-lg border-2 border-green-500">
              <div className="text-center">
                <div className="text-4xl mb-4">🔔</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Benachrichtigung</h3>
                <p className="text-4xl sm:text-5xl font-bold text-green-600 mb-4">Kostenlos</p>
                <p className="text-gray-700 mb-6 text-sm sm:text-base">
                  E-Mail bei Zinssenkung. Keine Registrierung nötig.
                </p>
                <Link
                  href="/notify"
                  className="block bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                  Auf Liste setzen
                </Link>
              </div>
            </div>

            {/* Service 1 */}
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg border-2 border-gray-200">
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyse</h3>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">CHF 9</p>
                <p className="text-gray-700 mb-6 text-sm sm:text-base">
                  KI-Analyse + Berechnung Einsparpotential
                </p>
                <Link
                  href="/register"
                  className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Jetzt analysieren
                </Link>
              </div>
            </div>

            {/* Service 2 */}
            <div className="bg-blue-50 p-6 sm:p-8 rounded-lg shadow-lg border-2 border-blue-500 md:col-span-3 lg:col-span-1">
              <div className="text-center">
                <div className="text-4xl mb-4">✉️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Brief</h3>
                <p className="text-4xl sm:text-5xl font-bold text-blue-600 mb-4">CHF 49</p>
                <p className="text-gray-700 mb-6 text-sm sm:text-base">
                  Rechtssicheres Herabsetzungsschreiben (OR 269d)
                </p>
                <Link
                  href="/register"
                  className="block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Brief erstellen
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-6 sm:mt-8 text-sm sm:text-base">
            💰 Spare CHF 300-700 pro Jahr. Einmalige Kosten. Keine Abos.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MietCheck.ch</h3>
              <p className="text-gray-400 text-sm">
                Miete senken. Legal. Automatisch. Einfach.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/impressum" className="text-gray-400 hover:text-white">Impressum</Link></li>
                <li><Link href="/datenschutz" className="text-gray-400 hover:text-white">Datenschutz</Link></li>
                <li><Link href="/agb" className="text-gray-400 hover:text-white">AGB</Link></li>
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <p className="text-gray-400 text-sm">support@mietcheck.ch</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400 text-sm">© 2026 MietCheck.ch - Alle Rechte vorbehalten</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
