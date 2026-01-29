import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            MietCheck.ch
          </Link>
          <div className="space-x-4">
            <Link href="/register" className="btn btn-primary">
              Kostenlos registrieren
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Spare CHF 300-700 pro Jahr bei deiner Miete
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Der Referenzzinssatz ist auf <strong>1.25%</strong> gesunken. 
            Hast du schon eine Mietminderung beantragt?
            <br />Wir informieren dich automatisch und erstellen alle Dokumente.
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
            <div className="text-6xl font-bold text-primary mb-4">CHF 0</div>
            <h3 className="text-xl font-semibold mb-4">Service 0: Benachrichtigung</h3>
            <p className="text-gray-600 mb-6">
              Erhalte eine E-Mail sobald der Referenzzinssatz sinkt.
              Keine Verpflichtung, keine Kreditkarte nötig.
            </p>
            <Link href="/register" className="btn btn-primary w-full block text-center">
              Jetzt kostenlos registrieren →
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              ✓ 12'456 Mieter bereits registriert
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">So funktioniert's</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kostenlos registrieren</h3>
              <p className="text-gray-600">
                Trage deine Mietdaten ein. Dauert nur 2 Minuten.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatische Benachrichtigung</h3>
              <p className="text-gray-600">
                Bei Zinssenkung bekommst du sofort eine E-Mail mit deinem Anspruch.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dokumente in 5 Minuten</h3>
              <p className="text-gray-600">
                Wir erstellen dein rechtssicheres Herabsetzungsbegehren - fertig zum Versand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Unsere Services</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            
            {/* Service 0 */}
            <div className="card">
              <div className="text-5xl font-bold text-primary mb-2">CHF 0</div>
              <h3 className="text-2xl font-semibold mb-4">Benachrichtigung</h3>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li>✓ Automatische E-Mail bei Zinssenkung</li>
                <li>✓ Berechnung deines Anspruchs</li>
                <li>✓ Keine Verpflichtung</li>
                <li>✓ Jederzeit kündbar</li>
              </ul>
              <Link href="/register" className="btn btn-secondary w-full block text-center">
                Kostenlos registrieren
              </Link>
            </div>

            {/* Service 1 */}
            <div className="card">
              <div className="text-5xl font-bold text-primary mb-2">CHF 20</div>
              <h3 className="text-2xl font-semibold mb-4">Analyse</h3>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li>✓ KI-Analyse deines Mietvertrags</li>
                <li>✓ Exakte Ersparnis-Berechnung</li>
                <li>✓ Detaillierter PDF-Report</li>
                <li>✓ Sofortiges Ergebnis</li>
              </ul>
              <Link href="/analyze" className="btn btn-primary w-full block text-center">
                Jetzt analysieren
              </Link>
            </div>

            {/* Service 2 */}
            <div className="card border-2 border-primary">
              <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                BELIEBT
              </div>
              <div className="text-5xl font-bold text-primary mb-2">CHF 50</div>
              <h3 className="text-2xl font-semibold mb-4">Dokument-Erstellung</h3>
              <ul className="space-y-3 mb-6 text-gray-700">
                <li>✓ Alle Funktionen von Analyse</li>
                <li>✓ Fertiges Herabsetzungsbegehren</li>
                <li>✓ Rechtssicher & versandbereit</li>
                <li>✓ PDF-Download sofort</li>
              </ul>
              <Link href="/generate" className="btn btn-primary w-full block text-center">
                Dokument erstellen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">In Zahlen</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">CHF 8.4M</div>
              <div className="text-blue-100">Ersparnis für unsere Kunden</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">12'456</div>
              <div className="text-blue-100">Registrierte Mieter</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Erfolgsquote</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Bereit anzufangen?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Registriere dich jetzt kostenlos und verpasse nie wieder eine Mietminderung.
          </p>
          <Link href="/register" className="btn btn-primary text-lg px-8 py-4 inline-block">
            Kostenlos registrieren →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-4">© 2026 MietCheck.ch - Alle Rechte vorbehalten</p>
          <div className="space-x-6 text-sm">
            <Link href="/impressum" className="text-gray-400 hover:text-white">Impressum</Link>
            <Link href="/datenschutz" className="text-gray-400 hover:text-white">Datenschutz</Link>
            <Link href="/agb" className="text-gray-400 hover:text-white">AGB</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
