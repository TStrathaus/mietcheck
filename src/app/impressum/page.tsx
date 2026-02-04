// src/app/impressum/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impressum - MietCheck.ch',
  description: 'Impressum und Kontaktdaten von MietCheck.ch',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-8 inline-block">
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Impressum</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
            <div className="text-gray-700 space-y-2">
              <p><strong>MietCheck.ch</strong></p>
              <p>Thomas Strathaus</p>
              <p>[Strasse und Hausnummer]</p>
              <p>[PLZ Ort]</p>
              <p>Schweiz</p>
              <p className="mt-4">
                <strong>E-Mail:</strong>{' '}
                <a href="mailto:kontakt@mietcheck.ch" className="text-blue-600 hover:underline">
                  kontakt@mietcheck.ch
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Verantwortlich für den Inhalt</h2>
            <p className="text-gray-700">
              Thomas Strathaus (Anschrift wie oben)
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Haftungsausschluss</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Haftung für Inhalte</h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit grösster Sorgfalt erstellt. Für die Richtigkeit,
                  Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Haftung für Links</h3>
                <p>
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                  Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Keine Rechtsberatung</h3>
                <p>
                  Die auf dieser Website bereitgestellten Informationen und Berechnungen stellen keine
                  Rechtsberatung dar. Bei rechtlichen Fragen wenden Sie sich bitte an einen Anwalt oder
                  die Schlichtungsbehörde in Mietsachen.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Urheberrecht</h2>
            <p className="text-gray-700">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem Schweizer Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung ausserhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Streitbeilegung</h2>
            <p className="text-gray-700">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Stand: Februar 2026</p>
        </div>
      </div>
    </div>
  );
}
