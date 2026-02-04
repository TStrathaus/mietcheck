// src/app/agb/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AGB - MietCheck.ch',
  description: 'Allgemeine Geschäftsbedingungen von MietCheck.ch',
};

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:text-blue-700 mb-8 inline-block">
          &larr; Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Geltungsbereich</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Dienstleistungen,
                die über die Website MietCheck.ch angeboten werden.
              </p>
              <p>
                <strong>Anbieter:</strong><br />
                MietCheck.ch<br />
                Thomas Strathaus<br />
                E-Mail: kontakt@mietcheck.ch
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Leistungsbeschreibung</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">2.1 Service 0 - Kostenlose Benachrichtigung</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Registrierung mit E-Mail-Adresse</li>
                  <li>Benachrichtigung bei Änderung des Referenzzinssatzes</li>
                  <li>Kostenlos und unverbindlich</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Service 1 - Vertragsanalyse (CHF 20)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Automatische Analyse von Mietverträgen mittels KI</li>
                  <li>Berechnung des Mietreduktionspotentials</li>
                  <li>Übersicht der relevanten Vertragsdaten</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.3 Service 2 - Briefgenerierung (CHF 50)</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Erstellung eines rechtssicheren Mietzinsherabsetzungsbegehrens</li>
                  <li>PDF-Download des fertigen Briefs</li>
                  <li>Anleitung zum korrekten Versand</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Vertragsschluss</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Der Vertrag kommt zustande, wenn Sie einen kostenpflichtigen Service auswählen
                und die Zahlung erfolgreich abgeschlossen wird.
              </p>
              <p>
                Sie erhalten eine Bestätigung per E-Mail nach erfolgreicher Zahlung.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Preise und Zahlung</h2>
            <div className="text-gray-700 space-y-2">
              <p>Alle Preise verstehen sich in Schweizer Franken (CHF) inkl. MwSt.</p>
              <p>
                <strong>Aktuelle Preise:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Service 0 (Benachrichtigung): Kostenlos</li>
                <li>Service 1 (Vertragsanalyse): CHF 20.00</li>
                <li>Service 2 (Briefgenerierung): CHF 50.00</li>
              </ul>
              <p className="mt-4">
                <strong>Zahlungsmethoden:</strong> TWINT, Kreditkarte (Visa, Mastercard)
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Widerrufsrecht</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Da es sich um digitale Inhalte handelt, die sofort nach Zahlung bereitgestellt
                werden, besteht kein Widerrufsrecht nach Art. 16 lit. m EU-Verbraucherrechterichtlinie.
              </p>
              <p>
                Mit dem Kauf bestätigen Sie, dass Sie auf das Widerrufsrecht verzichten und der
                sofortigen Bereitstellung der digitalen Inhalte zustimmen.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Haftung und Gewährleistung</h2>
            <div className="text-gray-700 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">6.1 Keine Rechtsberatung</h3>
                <p>
                  MietCheck.ch bietet keine Rechtsberatung an. Die bereitgestellten Informationen
                  und generierten Dokumente dienen als Hilfsmittel und ersetzen keine professionelle
                  Rechtsberatung.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 Genauigkeit der Berechnungen</h3>
                <p>
                  Wir bemühen uns um grösstmögliche Genauigkeit bei den Berechnungen. Dennoch können
                  wir keine Garantie für die Richtigkeit der Ergebnisse übernehmen. Der Nutzer ist
                  selbst verantwortlich, die Angaben zu überprüfen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.3 Haftungsbeschränkung</h3>
                <p>
                  Die Haftung von MietCheck.ch ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.
                  Die Haftung für mittelbare Schäden, Folgeschäden und entgangenen Gewinn ist
                  ausgeschlossen.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Nutzungsrechte</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Mit dem Kauf erhalten Sie ein einfaches, nicht übertragbares Nutzungsrecht an den
                erstellten Dokumenten für Ihren persönlichen Gebrauch.
              </p>
              <p>
                Die kommerzielle Nutzung oder Weitergabe an Dritte ist nicht gestattet.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Datenschutz</h2>
            <p className="text-gray-700">
              Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie in unserer{' '}
              <Link href="/datenschutz" className="text-blue-600 hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Änderungen der AGB</h2>
            <p className="text-gray-700">
              Wir behalten uns vor, diese AGB jederzeit zu ändern. Änderungen werden auf der
              Website veröffentlicht. Für bereits abgeschlossene Verträge gelten die zum
              Zeitpunkt des Vertragsschlusses gültigen AGB.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Anwendbares Recht und Gerichtsstand</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Es gilt ausschliesslich Schweizer Recht unter Ausschluss des UN-Kaufrechts.
              </p>
              <p>
                Gerichtsstand ist der Wohnsitz des Anbieters, sofern der Kunde Kaufmann ist
                oder keinen festen Wohnsitz in der Schweiz hat.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Salvatorische Klausel</h2>
            <p className="text-gray-700">
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die
              Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung ist
              durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck am nächsten kommt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Kontakt</h2>
            <p className="text-gray-700">
              Bei Fragen zu diesen AGB kontaktieren Sie uns unter:{' '}
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
