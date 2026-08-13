import React, { useState, useRef } from 'react';
import { Upload, AlertCircle, X, ShoppingBag, CreditCard, ShoppingCart, Square, BookOpen, DollarSign } from 'lucide-react';
import { parseFile, normalizeRows } from '../utils/dataParser';
import { validateMapping } from '../utils/columnMatcher';
import { ColumnMapping, Dataset, DatasetMeta, NormalizedRecord } from '../types';
import { ColumnMapperModal } from './ColumnMapperModal';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDatasetLoaded: (dataset: Dataset) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onDatasetLoaded,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rawRows: Record<string, any>[];
    suggestedMapping: ColumnMapping;
    fileName: string;
    fileSize: number;
  } | null>(null);

  const [showMapperModal, setShowMapperModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const fileList = Array.from(files);
      if (fileList.length === 0) return;

      let combinedRows: Record<string, any>[] = [];
      let combinedHeaders: string[] = [];
      let primaryFileName = fileList[0].name;
      let totalSize = 0;
      let suggestedMapping: ColumnMapping = { date: null, revenue: null, expense: null, profit: null, category: null, product: null, customer: null, quantity: null };

      for (let i = 0; i < fileList.length; i++) {
        const parsed = await parseFile(fileList[i]);
        combinedRows = [...combinedRows, ...parsed.rawRows];
        totalSize += parsed.fileSize;
        if (i === 0) {
          combinedHeaders = parsed.headers;
          suggestedMapping = parsed.suggestedMapping;
        }
      }

      if (fileList.length > 1) {
        primaryFileName = `${fileList.length} Combined Files (${fileList[0].name}, etc.)`;
      }

      const { isValid } = validateMapping(suggestedMapping);

      const parsedPayload = {
        headers: combinedHeaders,
        rawRows: combinedRows,
        suggestedMapping,
        fileName: primaryFileName,
        fileSize: totalSize,
      };

      setParsedData(parsedPayload);

      if (!isValid) {
        setShowMapperModal(true);
      } else {
        const records = normalizeRows(combinedRows, suggestedMapping);
        const meta: DatasetMeta = {
          fileName: primaryFileName,
          fileSize: totalSize,
          rowCount: records.length,
          headers: combinedHeaders,
          uploadedAt: new Date(),
          mapping: suggestedMapping,
        };

        onDatasetLoaded({ meta, records });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while parsing file(s). Check file formats.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyMapping = (mapping: ColumnMapping) => {
    if (!parsedData) return;

    const records = normalizeRows(parsedData.rawRows, mapping);
    const meta: DatasetMeta = {
      fileName: parsedData.fileName,
      fileSize: parsedData.fileSize,
      rowCount: records.length,
      headers: parsedData.headers,
      uploadedAt: new Date(),
      mapping,
    };

    onDatasetLoaded({ meta, records });
    setShowMapperModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 max-w-xl w-full p-6 relative my-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Business Spreadsheets</h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Upload CSV or Excel files. Support for single or multiple combined files.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900 dark:text-white">File Ingestion Issue</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}



          {/* Sample Dataset Quick Loader */}
          <div className="mb-4 p-3.5 bg-slate-50 dark:bg-zinc-900/80 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center font-bold text-xs">
                ⚡
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Don't have a CSV handy?</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">Load a verified SMB e-commerce & SaaS sample dataset.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const sampleRecords: NormalizedRecord[] = [
                  { id: 'tx-1', date: new Date('2026-01-05'), dateString: '2026-01-05', revenue: 14500, expense: 3200, profit: 11300, category: 'Enterprise SaaS', product: 'Annual Platform License', customer: 'Acme Global Corp', quantity: 1 },
                  { id: 'tx-2', date: new Date('2026-01-12'), dateString: '2026-01-12', revenue: 8200, expense: 1900, profit: 6300, category: 'Consulting', product: 'Architecture Audit', customer: 'Vertex Logistics', quantity: 1 },
                  { id: 'tx-3', date: new Date('2026-01-18'), dateString: '2026-01-18', revenue: 0, expense: 2450, profit: -2450, category: 'Infrastructure', product: 'AWS Cloud Hosting', customer: undefined, quantity: 1 },
                  { id: 'tx-4', date: new Date('2026-01-25'), dateString: '2026-01-25', revenue: 9800, expense: 2100, profit: 7700, category: 'Enterprise SaaS', product: 'Tier 3 Seat Expansion', customer: 'Nordic Health Systems', quantity: 1 },
                  { id: 'tx-5', date: new Date('2026-02-02'), dateString: '2026-02-02', revenue: 12000, expense: 2800, profit: 9200, category: 'Enterprise SaaS', product: 'Annual Platform License', customer: 'Starlight Financial', quantity: 1 },
                  { id: 'tx-6', date: new Date('2026-02-10'), dateString: '2026-02-10', revenue: 0, expense: 1800, profit: -1800, category: 'Software Tools', product: 'Linear & GitHub Enterprise', customer: undefined, quantity: 1 },
                  { id: 'tx-7', date: new Date('2026-02-15'), dateString: '2026-02-15', revenue: 16500, expense: 3900, profit: 12600, category: 'Enterprise SaaS', product: 'Enterprise SLA & Support', customer: 'Acme Global Corp', quantity: 1 },
                  { id: 'tx-8', date: new Date('2026-02-22'), dateString: '2026-02-22', revenue: 7400, expense: 1600, profit: 5800, category: 'Consulting', product: 'Security Review', customer: 'Horizon Media Group', quantity: 1 },
                  { id: 'tx-9', date: new Date('2026-03-01'), dateString: '2026-03-01', revenue: 18900, expense: 4200, profit: 14700, category: 'Enterprise SaaS', product: 'Custom Integration Pack', customer: 'Pinnacle Capital Partners', quantity: 1 },
                  { id: 'tx-10', date: new Date('2026-03-05'), dateString: '2026-03-05', revenue: 0, expense: 3500, profit: -3500, category: 'Marketing', product: 'Paid Growth Campaigns', customer: undefined, quantity: 1 },
                  { id: 'tx-11', date: new Date('2026-03-10'), dateString: '2026-03-10', revenue: 11200, expense: 2400, profit: 8800, category: 'Enterprise SaaS', product: 'Annual Platform License', customer: 'BlueShift Technologies', quantity: 1 },
                ];

                const meta: DatasetMeta = {
                  fileName: 'Sample Business Ledger.csv',
                  fileSize: 4096,
                  rowCount: sampleRecords.length,
                  headers: ['Date', 'Revenue', 'Expense', 'Profit', 'Category', 'Product', 'Customer', 'Quantity'],
                  uploadedAt: new Date(),
                  mapping: { date: 'Date', revenue: 'Revenue', expense: 'Expense', profit: 'Profit', category: 'Category', product: 'Product', customer: 'Customer', quantity: 'Quantity' },
                };

                onDatasetLoaded({ meta, records: sampleRecords });
                onClose();
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-full shadow-sm transition-all shrink-0 active:scale-[0.98]"
            >
              Load Sample Demo
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                processFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 scale-[0.99]'
                : 'border-slate-300 dark:border-zinc-800 hover:border-rose-400 hover:bg-slate-50/50 dark:hover:bg-zinc-900/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv, .xlsx, .xls"
              onChange={(e) => e.target.files && processFiles(e.target.files)}
              className="hidden"
            />

            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-900 flex items-center justify-center mx-auto mb-3 shadow-inner">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
              {isLoading ? 'Processing Files...' : 'Click to select or drag & drop files'}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Supports CSV (.csv) and Excel (.xlsx, .xls). Upload single or multiple combined files.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span>🔒 100% In-Browser Execution. Data stays private.</span>
            <button onClick={onClose} className="text-slate-600 dark:text-zinc-400 font-bold hover:text-slate-900 dark:hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      </div>

      {parsedData && (
        <ColumnMapperModal
          isOpen={showMapperModal}
          onClose={() => setShowMapperModal(false)}
          headers={parsedData.headers}
          initialMapping={parsedData.suggestedMapping}
          fileName={parsedData.fileName}
          onApplyMapping={handleApplyMapping}
        />
      )}
    </>
  );
};
