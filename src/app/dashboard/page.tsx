// Dashboard - Server Component (Stable)
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { sql } from '@vercel/postgres';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Load user's contracts from database
  let contracts: any[] = [];
  try {
    const result = await sql`
      SELECT id, address, net_rent, new_rent, reference_rate, contract_date,
             created_at, monthly_reduction, yearly_savings
      FROM contracts
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;
    contracts = result.rows;
  } catch (error) {
    console.error('Error loading contracts:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👋 Willkommen, {session.user?.name || session.user?.email}
              </h1>
              <p className="text-gray-600">Verwalten Sie Ihre Mietverträge</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🏠 Startseite
              </Link>
              <Link
                href="/api/auth/signout"
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🚪 Abmelden
              </Link>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/analyze"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Service 1: Analyse
            </h3>
            <p className="text-gray-600 mb-3">
              Mietvertrag analysieren
            </p>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 9
            </div>
          </Link>

          <Link
            href="/generate"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Service 2: Brief
            </h3>
            <p className="text-gray-600 mb-3">
              Herabsetzungsbrief generieren
            </p>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 49
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-6 opacity-75">
            <div className="text-4xl mb-3">📮</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Service 3: Versand
            </h3>
            <p className="text-gray-600 mb-3">
              Brief per Post versenden
            </p>
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 120 (Bald)
            </div>
          </div>
        </div>

        {/* Contracts List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📋 Ihre Verträge
          </h2>

          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 mb-4">Noch keine Verträge analysiert</p>
              <Link
                href="/analyze"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                📊 Ersten Vertrag analysieren
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        📍 {contract.address}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          💰 Nettomiete: <span className="font-medium">CHF {parseFloat(contract.net_rent).toFixed(2)}</span>
                        </div>
                        <div>
                          📊 Referenzzinssatz: <span className="font-medium">{contract.reference_rate}%</span>
                        </div>
                        <div>
                          📅 Vertragsdatum: <span className="font-medium">{new Date(contract.contract_date).toLocaleDateString('de-CH')}</span>
                        </div>
                        <div>
                          🕒 Analysiert: <span className="font-medium">{new Date(contract.created_at).toLocaleDateString('de-CH')}</span>
                        </div>
                      </div>
                      {contract.yearly_savings && parseFloat(contract.yearly_savings) > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">💰</span>
                              <div>
                                <div className="text-green-800 font-semibold">
                                  Einsparpotenzial: CHF {parseFloat(contract.yearly_savings).toFixed(2)} / Jahr
                                </div>
                                <div className="text-green-700 text-xs">
                                  Monatliche Reduktion: CHF {parseFloat(contract.monthly_reduction).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/generate?contractId=${contract.id}`}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      📄 Brief erstellen
                    </Link>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <Link
                  href="/analyze"
                  className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  ➕ Weiteren Vertrag analysieren
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
