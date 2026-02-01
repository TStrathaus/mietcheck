// src/components/MietHistorie.tsx
'use client';

import { useState } from 'react';
import {
  MietAnpassung,
  MietHistorie as MietHistorieType,
  validateMietHistorie,
  berechneMiete,
  getAktuellerReferenzzinssatz,
} from '@/lib/miet-calculator';

interface MietHistorieProps {
  vertragsbeginn: {
    datum: string;
    miete: number;
    referenzzinssatz: number;
  };
  onHistorieChange: (historie: MietHistorieType) => void;
}

export default function MietHistorie({
  vertragsbeginn,
  onHistorieChange,
}: MietHistorieProps) {
  const [anpassungen, setAnpassungen] = useState<MietAnpassung[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [newDatum, setNewDatum] = useState('');
  const [newZins, setNewZins] = useState('');
  const [newMiete, setNewMiete] = useState('');

  const startAnpassung: MietAnpassung = {
    datum: vertragsbeginn.datum,
    referenzzinssatz: vertragsbeginn.referenzzinssatz,
    miete: vertragsbeginn.miete,
    typ: 'start',
  };

  const aktuelleAnpassung =
    anpassungen.length > 0 ? anpassungen[anpassungen.length - 1] : startAnpassung;

  const historie: MietHistorieType = {
    vertragsbeginn: startAnpassung,
    anpassungen,
    aktuell: aktuelleAnpassung,
  };

  // Auto-Berechnung der Miete basierend auf Zinssatz
  const handleZinsChange = (zins: string) => {
    setNewZins(zins);
    if (zins && !isNaN(parseFloat(zins))) {
      const vorherZins = aktuelleAnpassung.referenzzinssatz;
      const vorherMiete = aktuelleAnpassung.miete;
      const berechneteMinete = berechneMiete(
        vorherMiete,
        vorherZins,
        parseFloat(zins)
      );
      setNewMiete(berechneteMinete.toFixed(2));
    }
  };

  const handleAddAnpassung = () => {
    if (!newDatum || !newZins || !newMiete) {
      alert('Bitte alle Felder ausfüllen');
      return;
    }

    const typ =
      parseFloat(newMiete) > aktuelleAnpassung.miete ? 'erhöhung' : 'reduzierung';

    const neueAnpassung: MietAnpassung = {
      datum: newDatum,
      referenzzinssatz: parseFloat(newZins),
      miete: parseFloat(newMiete),
      typ,
    };

    const neueAnpassungen = [...anpassungen, neueAnpassung].sort(
      (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
    );

    setAnpassungen(neueAnpassungen);

    const neueHistorie: MietHistorieType = {
      vertragsbeginn: startAnpassung,
      anpassungen: neueAnpassungen,
      aktuell: neueAnpassung,
    };

    onHistorieChange(neueHistorie);

    // Reset form
    setNewDatum('');
    setNewZins('');
    setNewMiete('');
    setShowForm(false);
  };

  const handleRemoveAnpassung = (index: number) => {
    const neueAnpassungen = anpassungen.filter((_, i) => i !== index);
    setAnpassungen(neueAnpassungen);

    const neueHistorie: MietHistorieType = {
      vertragsbeginn: startAnpassung,
      anpassungen: neueAnpassungen,
      aktuell:
        neueAnpassungen.length > 0
          ? neueAnpassungen[neueAnpassungen.length - 1]
          : startAnpassung,
    };

    onHistorieChange(neueHistorie);
  };

  // Validierung
  const validation = validateMietHistorie(historie);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          📊 Mietanpassungs-Historie
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? '✕ Abbrechen' : '+ Anpassung hinzufügen'}
        </button>
      </div>

      <p className="text-gray-600">
        Erfassen Sie alle Mietanpassungen seit Vertragsbeginn. Das System prüft
        automatisch, ob die Anpassungen korrekt berechnet wurden.
      </p>

      {/* Add Form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <h4 className="font-bold text-gray-900">Neue Anpassung erfassen</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum
              </label>
              <input
                type="date"
                value={newDatum}
                onChange={(e) => setNewDatum(e.target.value)}
                min={aktuelleAnpassung.datum}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neuer Referenzzinssatz (%)
              </label>
              <input
                type="number"
                step="0.25"
                value={newZins}
                onChange={(e) => handleZinsChange(e.target.value)}
                placeholder="z.B. 1.50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neue Miete (CHF)
              </label>
              <input
                type="number"
                step="0.01"
                value={newMiete}
                onChange={(e) => setNewMiete(e.target.value)}
                placeholder="Berechnet automatisch"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wird automatisch berechnet
              </p>
            </div>
          </div>

          <button
            onClick={handleAddAnpassung}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            ✓ Anpassung hinzufügen
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Referenzzins
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Miete
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Änderung
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Start */}
            <tr className="bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(startAnpassung.datum).toLocaleDateString('de-CH')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {startAnpassung.referenzzinssatz}%
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                CHF {startAnpassung.miete.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                🏁 Vertragsbeginn
              </td>
              <td></td>
            </tr>

            {/* Anpassungen */}
            {anpassungen.map((anpassung, index) => {
              const vorher =
                index === 0 ? startAnpassung : anpassungen[index - 1];
              const differenz = anpassung.miete - vorher.miete;

              return (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(anpassung.datum).toLocaleDateString('de-CH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {anpassung.referenzzinssatz}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    CHF {anpassung.miete.toFixed(2)}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      differenz > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {differenz > 0 ? '↑' : '↓'} CHF {Math.abs(differenz).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleRemoveAnpassung(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Validation Results */}
      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
          <h4 className="font-bold text-yellow-900">⚠️ Hinweise:</h4>
          {validation.warnings.map((warning, index) => (
            <p key={index} className="text-sm text-yellow-800">
              {warning}
            </p>
          ))}
        </div>
      )}

      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
          <h4 className="font-bold text-red-900">❌ Fehler:</h4>
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-800">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Aktueller Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-4">📍 Aktueller Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Aktuelle Miete</p>
            <p className="text-2xl font-bold text-gray-900">
              CHF {aktuelleAnpassung.miete.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Aktueller Referenzzins</p>
            <p className="text-2xl font-bold text-gray-900">
              {getAktuellerReferenzzinssatz()}%
            </p>
            <p className="text-xs text-gray-500">Stand: Februar 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
