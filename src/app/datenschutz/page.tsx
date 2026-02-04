// src/app/datenschutz/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung - MietCheck.ch',
  description: 'Datenschutzerklärung von MietCheck.ch',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-8 inline-block">
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Verantwortlicher</h2>
            <div className="text-gray-700">
              <p>Verantwortlich für die Datenverarbeitung auf dieser Website:</p>
              <p className="mt-2">
                <strong>MietCheck.ch</strong><br />
                Thomas Strathaus<br />
                E-Mail: kontakt@mietcheck.ch
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Erhobene Daten</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Automatisch erfasste Daten</h3>
                <p>
                  Bei jedem Zugriff auf unsere Website werden automatisch folgende Daten erfasst:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>IP-Adresse (anonymisiert)</li>
                  <li>Datum und Uhrzeit des Zugriffs</li>
                  <li>Aufgerufene Seiten</li>
                  <li>Browsertyp und -version</li>
                  <li>Betriebssystem</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Von Ihnen bereitgestellte Daten</h3>
                <p>
                  Bei der Nutzung unserer Services können folgende Daten erhoben werden:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>E-Mail-Adresse (bei Registrierung)</li>
                  <li>Name (optional)</li>
                  <li>Adresse der Mietwohnung</li>
                  <li>Mietvertragsdaten (Miete, Vertragsdatum, Referenzzinssatz)</li>
                  <li>Vermieterinformationen</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.3 Hochgeladene Dokumente</h3>
                <p>
                  Wenn Sie Mietverträge hochladen, werden diese Dokumente verarbeitet, um die
                  relevanten Informationen zu extrahieren. Die Dokumente werden temporär gespeichert
                  und nach der Verarbeitung automatisch gelöscht.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Zweck der Datenverarbeitung</h2>
            <div className="text-gray-700">
              <p>Wir verarbeiten Ihre Daten für folgende Zwecke:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Bereitstellung unserer Mietreduktions-Services</li>
                <li>Berechnung Ihrer möglichen Mietreduktion</li>
                <li>Erstellung von Mietreduktionsbriefen</li>
                <li>Benachrichtigung bei Änderungen des Referenzzinssatzes</li>
                <li>Verbesserung unserer Services</li>
                <li>Abwicklung von Zahlungen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Rechtsgrundlage</h2>
            <div className="text-gray-700">
              <p>Die Verarbeitung Ihrer Daten erfolgt auf Basis:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
                <li>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Speicherdauer</h2>
            <div className="text-gray-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Hochgeladene Dokumente: max. 24 Stunden</li>
                <li>Kontodaten: bis zur Löschung Ihres Kontos</li>
                <li>Rechnungsdaten: 10 Jahre (gesetzliche Aufbewahrungspflicht)</li>
                <li>Server-Logs: 30 Tage</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Drittanbieter</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">6.1 Hosting (Vercel)</h3>
                <p>
                  Unsere Website wird bei Vercel Inc. (USA) gehostet. Vercel verarbeitet Daten
                  gemäss den EU-US Data Privacy Framework Anforderungen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 KI-Verarbeitung (Google Gemini)</h3>
                <p>
                  Für die Analyse von Mietverträgen nutzen wir Google Gemini. Die Daten werden
                  ausschliesslich für die Vertragsanalyse verwendet und nicht für Trainingszwecke.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.3 Zahlungsabwicklung</h3>
                <p>
                  Zahlungen werden über einen Schweizer Zahlungsanbieter abgewickelt. Wir speichern
                  keine Kreditkartendaten.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Ihre Rechte</h2>
            <div className="text-gray-700">
              <p>Sie haben folgende Rechte bezüglich Ihrer Daten:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Auskunft:</strong> Sie können Auskunft über Ihre gespeicherten Daten verlangen</li>
                <li><strong>Berichtigung:</strong> Sie können unrichtige Daten korrigieren lassen</li>
                <li><strong>Löschung:</strong> Sie können die Löschung Ihrer Daten verlangen</li>
                <li><strong>Einschränkung:</strong> Sie können die Verarbeitung einschränken lassen</li>
                <li><strong>Datenübertragbarkeit:</strong> Sie können Ihre Daten in einem übertragbaren Format erhalten</li>
                <li><strong>Widerspruch:</strong> Sie können der Verarbeitung widersprechen</li>
              </ul>
              <p className="mt-4">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter:{' '}
                <a href="mailto:kontakt@mietcheck.ch" className="text-blue-600 hover:underline">
                  kontakt@mietcheck.ch
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
            <div className="text-gray-700">
              <p>
                Wir verwenden nur technisch notwendige Cookies für die Funktionalität der Website.
                Diese Cookies enthalten keine personenbezogenen Daten und werden beim Schliessen
                des Browsers gelöscht.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Datensicherheit</h2>
            <div className="text-gray-700">
              <p>
                Wir setzen technische und organisatorische Sicherheitsmassnahmen ein, um Ihre Daten
                gegen Manipulation, Verlust, Zerstörung oder unbefugten Zugriff zu schützen:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>SSL/TLS-Verschlüsselung für alle Datenübertragungen</li>
                <li>Verschlüsselte Speicherung sensibler Daten</li>
                <li>Regelmässige Sicherheitsupdates</li>
                <li>Zugriffsbeschränkungen</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Änderungen</h2>
            <p className="text-gray-700">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
              Rechtslagen oder Änderungen unserer Services anzupassen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter:{' '}
              <a href="mailto:kontakt@mietcheck.ch" className="text-blue-600 hover:underline">
                kontakt@mietcheck.ch
              </a>
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
