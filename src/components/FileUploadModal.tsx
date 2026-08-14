import React, { useState } from 'react';
import {
  ImportEntityType,
  ImportPreviewResult,
  Dataset,
  Deal,
  Contact,
  Invoice,
  NormalizedRecord,
} from '../types';
import { IMPORT_TEMPLATES, downloadTemplate } from '../utils/importTemplates';
import { parseAndValidateImport } from '../utils/importValidator';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Layers,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset) => void;
  onImportDeals?: (deals: Deal[]) => void;
  onImportContacts?: (contacts: Contact[]) => void;
  onImportInvoices?: (invoices: Invoice[]) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
  onImportDeals,
  onImportContacts,
  onImportInvoices,
}) => {
  const [selectedType, setSelectedType] = useState<ImportEntityType>('transactions');
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [step, setStep] = useState<'select' | 'preview' | 'success'>('select');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const result = await parseAndValidateImport(uploadedFile, selectedType);
      setPreview(result);
      setStep('preview');
    } catch (err) {
      alert('Failed to parse file. Please verify CSV or Excel formatting.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!preview) return;

    // Build normalized records if transaction type
    if (selectedType === 'transactions') {
      const records: NormalizedRecord[] = preview.sampleRows.map((r, i) => ({
        id: `rec-${Date.now()}-${i}`,
        date: r.Date || r.date || new Date().toISOString().split('T')[0],
        revenue: Number(r.Revenue || r.revenue || 0),
        expense: Number(r.Expense || r.expense || 0),
        profit: Number(r.Revenue || r.revenue || 0) - Number(r.Expense || r.expense || 0),
        category: r.Category || r.category || 'General',
        customer: r.Customer || r.customer || r['Customer Name'] || undefined,
        product: r.Product || r.product || undefined,
        paymentMethod: r['Payment Method'] || r.payment_method || 'Direct',
      }));

      onDatasetLoaded({
        id: `ds-${Date.now()}`,
        fileName: preview.fileName,
        uploadedAt: new Date().toISOString(),
        recordCount: preview.validRowsCount,
        records,
      });
    }

    setStep('success');
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setStep('select');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Import & Data Quality Center</h3>
              <p className="text-xs text-slate-400">Structured CSV/Excel validation with pre-write error checks.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Select Type & Upload */}
        {step === 'select' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">
                1. Select Data Entity Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(['transactions', 'deals', 'contacts', 'invoices'] as ImportEntityType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedType === type
                        ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <span className="capitalize block">{type}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {type === 'transactions' ? 'Revenue & Expenses' : type === 'deals' ? 'CRM Pipeline' : type === 'contacts' ? 'Customers & Leads' : 'Billing & Receivables'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Download Template Banner */}
            <div className="p-3.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/70 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block">Download formatted template</span>
                <span className="text-slate-500 text-[11px]">{IMPORT_TEMPLATES[selectedType].description}</span>
              </div>
              <button
                type="button"
                onClick={() => downloadTemplate(selectedType)}
                className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-slate-800 dark:text-zinc-200 font-bold flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .CSV</span>
              </button>
            </div>

            {/* Dropzone */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">
                2. Upload your CSV or XLSX file
              </label>
              <label className="border-2 border-dashed border-slate-300 dark:border-zinc-800 hover:border-rose-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center space-y-2 bg-slate-50/50 dark:bg-zinc-900/30">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {isProcessing ? 'Validating schema...' : 'Click to browse or drop file here'}
                </span>
                <span className="text-[11px] text-slate-400">Supports .CSV, .XLSX, .XLS up to 25MB</span>
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Pre-write Validation & Preview */}
        {step === 'preview' && preview && (
          <div className="space-y-4">
            {/* Summary Banner */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold block uppercase text-[10px]">Valid Rows</span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-200 font-mono">
                  {preview.validRowsCount}
                </span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs">
                <span className="text-amber-800 dark:text-amber-300 font-bold block uppercase text-[10px]">Total Scanned</span>
                <span className="text-xl font-black text-amber-900 dark:text-amber-200 font-mono">
                  {preview.totalRows}
                </span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs">
                <span className="text-rose-700 dark:text-rose-300 font-bold block uppercase text-[10px]">Errors / Skipped</span>
                <span className="text-xl font-black text-rose-800 dark:text-rose-200 font-mono">
                  {preview.errorRowsCount}
                </span>
              </div>
            </div>

            {/* Errors List (if any) */}
            {preview.errors.length > 0 && (
              <div className="p-3 bg-rose-50/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl space-y-1.5 text-xs">
                <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Validation Warnings ({preview.errors.length})
                </span>
                <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar text-[11px] text-rose-700 dark:text-rose-400">
                  {preview.errors.map((err, i) => (
                    <div key={i}>
                      Row {err.rowIndex}: <strong>{err.field}</strong> — {err.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-900">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-600/30 transition-all flex items-center gap-2"
              >
                <span>Confirm & Write {preview.validRowsCount} Records</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success First Insights */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">Data Verified & Imported</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your records have been normalized. Your Today command center, CRM pipeline, and cash outlook have updated automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-extrabold text-xs rounded-xl shadow-xs"
            >
              View Updated Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
