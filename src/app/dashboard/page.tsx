// Simplified Dashboard - guaranteed to work
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Contract {
  id: number;
  address: string;
  net_rent: number;
  new_rent?: number;
  monthly_reduction?: number;
  yearly_savings?: number;
  created_at: string;
}

export default function DashboardPageSimple() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractsLoading, setContractsLoading] = useState(true);
  const [contractsError, setContractsError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load contracts when session is available
  useEffect(() => {
    if (session?.user) {
      loadContracts();
    }
  }, [session]);

  const loadContracts = async () => {
    try {
      console.log('📥 Loading contracts...');
      setContractsLoading(true);
      setContractsError(null);

      const response = await fetch('/api/user/contracts');
      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Contracts loaded:', data.contracts?.length || 0);

      setContracts(data.contracts || []);
    } catch (error) {
      console.error('❌ Error loading contracts:', error);
      setContractsError('Fehler beim Laden der Verträge');
      setContracts([]);
    } finally {
      setContractsLoading(false);
    }
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  // Must be authenticated to see dashboard
  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

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
              Mietvertrag analysieren und Einsparung berechnen
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
              Rechtssicheren Herabsetzungsbrief generieren
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
              Brief drucken und per Post versenden
            </p>
            <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium inline-block">
              CHF 120 (Bald)
            </div>
          </div>
        </div>

        {/* Contracts Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📋 Meine Mietverträge
          </h2>

          {contractsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-3"></div>
              <p className="text-gray-600">Lade Verträge...</p>
            </div>
          ) : contractsError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700">❌ {contractsError}</p>
              <button
                onClick={loadContracts}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                🔄 Erneut versuchen
              </button>
            </div>
          ) : contracts.length === 0 ? (
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        📍 {contract.address}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Aktuelle Miete:</span>
                          <span className="font-medium text-gray-900 ml-2">
                            CHF {contract.net_rent.toFixed(2)}
                          </span>
                        </div>
                        {contract.new_rent && (
                          <div>
                            <span className="text-gray-500">Neue Miete:</span>
                            <span className="font-medium text-green-600 ml-2">
                              CHF {contract.new_rent.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      {contract.yearly_savings && contract.yearly_savings > 0 && (
                        <div className="mt-2 bg-green-50 border border-green-200 rounded px-3 py-2 inline-block">
                          <span className="text-green-700 font-bold">
                            💰 Ersparnis: CHF {contract.yearly_savings.toFixed(2)}/Jahr
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      {new Date(contract.created_at).toLocaleDateString('de-CH')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
