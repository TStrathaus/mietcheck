'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function NotifyPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notify-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Eintragung fehlgeschlagen');
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navigation />

      <div className="px-4 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔔</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Benachrichtigung bei Zinssenkung
            </h1>
            <p className="text-lg text-gray-600">
              Kostenlos und unverbindlich
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              📉 So funktioniert's:
            </h2>

            <div className="space-y-4 text-gray-700">
              <div className="flex gap-3">
                <span className="text-green-600 font-bold flex-shrink-0">1.</span>
                <p>
                  <strong>Eintragen:</strong> Geben Sie Ihre E-Mail-Adresse ein. Keine Registrierung,
                  kein Passwort, keine weiteren Daten erforderlich.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="text-green-600 font-bold flex-shrink-0">2.</span>
                <p>
                  <strong>Automatische Überwachung:</strong> Wir beobachten kontinuierlich den
                  offiziellen Referenzzinssatz der Schweizerischen Nationalbank (SNB).
                </p>
              </div>

              <div className="flex gap-3">
                <span className="text-green-600 font-bold flex-shrink-0">3.</span>
                <p>
                  <strong>Sofortige Benachrichtigung:</strong> Sobald der Referenzzinssatz sinkt,
                  erhalten Sie eine E-Mail mit allen wichtigen Informationen.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="text-green-600 font-bold flex-shrink-0">4.</span>
                <p>
                  <strong>Handeln Sie:</strong> Mit der Information können Sie dann eine
                  Mietzinsherabsetzung bei Ihrem Vermieter beantragen (gemäss OR 269d).
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>💡 Gut zu wissen:</strong> Der Referenzzinssatz wird von der SNB quartalsweise
                festgelegt. Die letzte Änderung war im September 2025 (Senkung auf 1.25%).
                Bei der nächsten Senkung können Mieter eine entsprechende Herabsetzung verlangen.
              </p>
            </div>
          </div>

          {/* Form or Success */}
          {success ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 sm:p-8 text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Erfolgreich eingetragen!
              </h3>
              <p className="text-gray-700 mb-6">
                Sie erhalten ab sofort eine E-Mail, sobald der Referenzzinssatz sinkt.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Zur Startseite
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Jetzt Miete analysieren
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ✉️ E-Mail-Adresse eintragen
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ihre E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="beispiel@email.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Wir verwenden Ihre E-Mail ausschliesslich für Benachrichtigungen
                    bei Zinssenkungen. Keine Werbung, kein Spam.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">❌ {error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '⏳ Wird eingetragen...' : '🔔 Kostenlos eintragen'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  Sie möchten jetzt schon Ihre Miete prüfen?{' '}
                  <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    Kostenlos registrieren
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Durch das Eintragen stimmen Sie unseren{' '}
              <Link href="/datenschutz" className="text-blue-600 hover:underline">
                Datenschutzbestimmungen
              </Link>{' '}
              zu. Sie können sich jederzeit wieder abmelden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
