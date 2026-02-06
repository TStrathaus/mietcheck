// src/app/dashboard/page.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Contract {
  id: number;
  address: string;
  net_rent: number;
  new_rent?: number;
  monthly_reduction?: number;
  yearly_savings?: number;
  reference_rate: number;
  contract_date: string;
  created_at: string;
  tenant_name?: string;
  landlord_name?: string;
}

interface Transaction {
  id: number;
  service_type: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch user data with useCallback to prevent infinite loops
  const fetchUserData = useCallback(async () => {
    try {
      console.log('🔍 Fetching user data...');

      // Fetch contracts with error handling
      const contractsRes = await fetch('/api/user/contracts');
      console.log('📡 Contracts response status:', contractsRes.status);

      if (contractsRes.ok) {
        const contractsData = await contractsRes.json();
        console.log('📦 Contracts data:', contractsData);
        console.log('📋 Number of contracts:', contractsData.contracts?.length || 0);
        setContracts(contractsData.contracts || []);
      } else {
        console.error('❌ Contracts fetch failed:', contractsRes.status);
        setContracts([]);
      }

      // Fetch transactions with error handling
      try {
        const transactionsRes = await fetch('/api/user/transactions');
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(transactionsData.transactions || []);
        } else {
          console.error('❌ Transactions fetch failed:', transactionsRes.status);
          setTransactions([]);
        }
      } catch (txError) {
        console.error('❌ Transactions error:', txError);
        setTransactions([]);
      }

    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      setContracts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - only create once

  // Fetch user data when session is available
  useEffect(() => {
    if (session?.user) {
      fetchUserData();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session, status, fetchUserData]);

  // Handle logout
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                👋 Willkommen, {session.user?.name || session.user?.email}
              </h1>
              <p className="text-gray-600">
                Verwalten Sie Ihre Mietverträge und Services
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🏠 Startseite
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                🚪 Abmelden
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/analyze"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
              Service 1: Analyse
            </h3>
            <p className="text-gray-600 mb-3">
              Mietvertrag analysieren und Einsparung berechnen
            </p>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 20
            </div>
          </Link>

          <Link
            href="/generate"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer group"
          >
            <div className="text-4xl mb-3">📄</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">
              Service 2: Brief
            </h3>
            <p className="text-gray-600 mb-3">
              Offiziellen Herabsetzungsantrag generieren
            </p>
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 50
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-lg p-6 opacity-75">
            <div className="text-4xl mb-3">📮</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Service 3: Versand
            </h3>
            <p className="text-gray-600 mb-3">
              Brief drucken und per Post versenden
            </p>
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 120 (Bald)
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Meine Verträge */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Meine Mietverträge
              </h2>
              <Link
                href="/analyze"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Neuer Vertrag
              </Link>
            </div>

            {contracts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-gray-600 mb-4">
                  Noch keine Verträge analysiert
                </p>
                <Link
                  href="/analyze"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ersten Vertrag analysieren
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {contract.address}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Hinzugefügt: {new Date(contract.created_at).toLocaleDateString('de-CH')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-bold">
                          CHF {contract.net_rent.toFixed(2)}
                        </p>
                        {contract.monthly_reduction && contract.monthly_reduction > 0 && (
                          <p className="text-green-600 text-sm font-medium">
                            -CHF {contract.monthly_reduction.toFixed(2)}/Monat
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-gray-600">Referenzzinssatz</p>
                        <p className="font-medium">{contract.reference_rate}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vertragsdatum</p>
                        <p className="font-medium">
                          {new Date(contract.contract_date).toLocaleDateString('de-CH')}
                        </p>
                      </div>
                    </div>

                    {contract.new_rent && contract.yearly_savings && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Neue Miete</p>
                            <p className="font-bold text-green-700">
                              CHF {contract.new_rent.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Jahresersparnis</p>
                            <p className="font-bold text-green-700">
                              CHF {contract.yearly_savings.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Link
                        href={`/generate?contractId=${contract.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        → Brief generieren
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meine Transaktionen */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              💳 Meine Services
            </h2>

            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💰</div>
                <p className="text-gray-600 mb-4">
                  Noch keine Services gekauft
                </p>
                <p className="text-sm text-gray-500">
                  Ihre Käufe erscheinen hier
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {transaction.service_type === 'analyze' && '📊 Service 1: Analyse'}
                        {transaction.service_type === 'generate' && '📄 Service 2: Brief'}
                        {transaction.service_type === 'mail' && '📮 Service 3: Versand'}
                      </span>
                      <span className="font-bold text-blue-600">
                        CHF {transaction.amount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString('de-CH')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status === 'completed' && '✅ Bezahlt'}
                        {transaction.status === 'pending' && '⏳ Ausstehend'}
                        {transaction.status === 'failed' && '❌ Fehlgeschlagen'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚙️ Konto-Einstellungen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Email</h3>
              <p className="text-gray-900">{session.user?.email}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Name</h3>
              <p className="text-gray-900">{session.user?.name || 'Nicht angegeben'}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              📝 Profil bearbeiten
            </button>
            <span className="mx-4 text-gray-300">|</span>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              🔒 Passwort ändern
            </button>
            <span className="mx-4 text-gray-300">|</span>
            <button className="text-red-600 hover:text-red-700 font-medium text-sm">
              🗑️ Konto löschen
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            💡 Brauchen Sie Hilfe?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-700">
              📚 Dokumentation lesen
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              ❓ FAQ anzeigen
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              ✉️ Support kontaktieren
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
