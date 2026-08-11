import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, FileText, AlertCircle, X, ShoppingBag, CreditCard, ShoppingCart, Square, BookOpen, DollarSign } from 'lucide-react';
import { parseFile, normalizeRows } from '../utils/dataParser';
import { validateMapping } from '../utils/columnMatcher';
import { PLATFORM_PRESETS, getPresetMapping } from '../utils/platformPresets';
import { ColumnMapping, Dataset, DatasetMeta, PlatformPreset } from '../types';
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

      // Parse first or all files
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
          isDemo: false,
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

  const handleApplyPreset = (presetId: PlatformPreset) => {
    if (!parsedData) return;
    const preset = getPresetMapping(presetId);
    if (!preset) return;

    // Use preset mapping directly
    const records = normalizeRows(parsedData.rawRows, preset.mapping);
    const meta: DatasetMeta = {
      fileName: parsedData.fileName,
      fileSize: parsedData.fileSize,
      rowCount: records.length,
      headers: parsedData.headers,
      isDemo: false,
      uploadedAt: new Date(),
      mapping: preset.mapping,
      platformPreset: presetId,
    };

    onDatasetLoaded({ meta, records });
    setShowMapperModal(false);
    onClose();
  };

  const handleApplyMapping = (mapping: ColumnMapping) => {
    if (!parsedData) return;

    const records = normalizeRows(parsedData.rawRows, mapping);
    const meta: DatasetMeta = {
      fileName: parsedData.fileName,
      fileSize: parsedData.fileSize,
      rowCount: records.length,
      headers: parsedData.headers,
      isDemo: false,
      uploadedAt: new Date(),
      mapping,
    };

    onDatasetLoaded({ meta, records });
    setShowMapperModal(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 relative my-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">Upload Business Spreadsheets</h2>
            <p className="text-xs text-slate-600 mt-1">
              Upload CSV or Excel files. Support for single or multiple combined files.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-900">File Ingestion Issue</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Platform Preset Shortcuts */}
          <div className="mb-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Click E-Commerce & Platform Presets
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Shopify</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>Stripe</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <ShoppingCart className="w-4 h-4 text-purple-600" />
                <span>WooCommerce</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <Square className="w-4 h-4 text-amber-600" />
                <span>Square</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>QuickBooks</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 flex flex-col items-center gap-1 font-semibold text-[11px] transition-all"
              >
                <DollarSign className="w-4 h-4 text-sky-600" />
                <span>PayPal</span>
              </button>
            </div>
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
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50'
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

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {isLoading ? 'Processing Files...' : 'Click to select or drag & drop files'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports CSV (.csv) and Excel (.xlsx, .xls). Upload single or multiple combined files.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>🔒 100% In-Browser Execution. Data stays private.</span>
            <button onClick={onClose} className="text-slate-600 font-medium hover:text-slate-900">
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
