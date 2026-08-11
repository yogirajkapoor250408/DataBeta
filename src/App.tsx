import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { TaxView } from './components/TaxView';
import { DataTableView } from './components/DataTableView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { EmptyState } from './components/EmptyState';
import { FileUploadModal } from './components/FileUploadModal';
import { Dataset, CurrencyCode } from './types';
import { DEMO_DATASET } from './utils/demoData';

const LOCAL_STORAGE_KEY = 'databeta_active_dataset_v3';
const CURRENCY_KEY = 'databeta_active_currency_v3';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'tax' | 'data' | 'reports' | 'settings'>('dashboard');
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Load stored dataset & currency on mount
  useEffect(() => {
    try {
      const storedCurr = localStorage.getItem(CURRENCY_KEY);
      if (storedCurr) {
        setCurrency(storedCurr as CurrencyCode);
      }

      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Dataset = JSON.parse(stored);
        parsed.meta.uploadedAt = new Date(parsed.meta.uploadedAt);
        parsed.records = parsed.records.map((r) => ({
          ...r,
          date: r.date ? new Date(r.date) : null,
        }));
        setDataset(parsed);
      }
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrency(code);
    localStorage.setItem(CURRENCY_KEY, code);
  };

  const handleDatasetLoaded = (newDataset: Dataset) => {
    setDataset(newDataset);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newDataset));
    } catch {
      // LocalStorage fallback
    }
  };

  const handleLoadDemo = () => {
    handleDatasetLoaded(DEMO_DATASET);
    setActiveTab('dashboard');
  };

  const handleClearData = () => {
    setDataset(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetMeta={dataset?.meta || null}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadDemo={handleLoadDemo}
        onClearData={handleClearData}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!dataset ? (
          <EmptyState onOpenUpload={() => setIsUploadOpen(true)} onLoadDemo={handleLoadDemo} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                records={dataset.records}
                isDemo={dataset.meta.isDemo}
                currency={currency}
                onOpenUpload={() => setIsUploadOpen(true)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView records={dataset.records} currency={currency} />
            )}

            {activeTab === 'tax' && (
              <TaxView records={dataset.records} currency={currency} />
            )}

            {activeTab === 'data' && (
              <DataTableView records={dataset.records} currency={currency} />
            )}

            {activeTab === 'reports' && (
              <ReportsView records={dataset.records} meta={dataset.meta} currency={currency} />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                meta={dataset.meta}
                records={dataset.records}
                currency={currency}
                onCurrencyChange={handleCurrencyChange}
                onClearData={handleClearData}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <p>DataBeta — Financial Intelligence Platform for Online Businesses</p>
      </footer>

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />
    </div>
  );
};

export default App;
