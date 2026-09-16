import React, { useState } from 'react';
import { X, Sparkles, FileText, CheckCircle2, ArrowRight, Upload, AlertCircle, Copy } from 'lucide-react';
import { parseDocumentText, createShipment } from '../services/api';
import { ParsedDocumentData } from '../types/shipment';

interface SmartDocumentParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentCreated: () => void;
}

const SAMPLE_DOCUMENTS = [
  {
    title: 'Bill of Lading #NKT-2026-9820',
    text: `COMMERCIAL BILL OF LADING
Tracking Ref: NKT-2026-9820
Vessel Carrier: Maersk Line (Voyage #4092)
Port of Loading (POL): Shanghai Port (CNSHA)
Port of Discharge (POD): Pune Inland Container Depot (INPNE)
Estimated Arrival Date (ETA): 2026-09-28
Cargo Description: 20x High-Tech Semiconductor Equipment Boxes (Fragile, Temp Controlled)
Status: Booked and Confirmed`,
  },
  {
    title: 'Freight Shipping Invoice',
    text: `NAGARKOT LOGISTICS INVOICE
Invoice No: INV-889104
Reference: NAG-2026-9901
Carrier: MSC Mediterranean Shipping Company
Shipper: Dubai Freezone Warehouse (AEJEA)
Consignee: Nhava Sheva Port, India (INNSA)
Expected Delivery Date: 2026-09-22
Notes: Heavy machinery parts. Weight 14,200 KG. Customs clearance pre-approved.`,
  },
  {
    title: 'Air Cargo Manifest Notice',
    text: `AIR CARGO DISPATCH NOTICE
Tracking Number: AC-7721-IN
Carrier Line: Lufthansa Cargo
Origin Airport: Frankfurt (EDDF)
Destination Airport: Mumbai Airport (VABB)
Target Delivery Date: Sept 24, 2026
Cargo Details: Cold-chain Pharmaceutical Vaccines. Handle with Care.`,
  },
];

export const SmartDocumentParserModal: React.FC<SmartDocumentParserModalProps> = ({
  isOpen,
  onClose,
  onShipmentCreated,
}) => {
  const [inputText, setInputText] = useState(SAMPLE_DOCUMENTS[0].text);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedDocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable parsed fields
  const [editableRef, setEditableRef] = useState('');
  const [editableOrigin, setEditableOrigin] = useState('');
  const [editableDest, setEditableDest] = useState('');
  const [editableDate, setEditableDate] = useState('');
  const [editableCarrier, setEditableCarrier] = useState('');
  const [editableNotes, setEditableNotes] = useState('');

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!inputText.trim()) {
      setError('Please paste document text or select a sample document.');
      return;
    }

    setIsParsing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const data = await parseDocumentText(inputText);
      setParsedData(data);
      setEditableRef(data.reference_number || '');
      setEditableOrigin(data.origin || '');
      setEditableDest(data.destination || '');
      setEditableDate(data.expected_delivery_date || '');
      setEditableCarrier(data.carrier || '');
      setEditableNotes(data.notes || '');
    } catch (err) {
      setError((err as Error).message || 'Failed to parse document text');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImportShipment = async () => {
    if (!editableOrigin.trim() || !editableDest.trim() || !editableDate.trim()) {
      setError('Origin, Destination, and Expected Delivery Date are required.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      await createShipment({
        reference_number: editableRef.trim() || undefined,
        origin: editableOrigin.trim(),
        destination: editableDest.trim(),
        expected_delivery_date: editableDate.trim(),
        carrier: editableCarrier.trim() || undefined,
        notes: editableNotes.trim() || undefined,
      });

      setSuccessMessage('Shipment successfully imported into database!');
      setTimeout(() => {
        onShipmentCreated();
        onClose();
      }, 1200);
    } catch (err) {
      setError((err as Error).message || 'Failed to import shipment.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Smart Document Parser Utility
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold">
                  OCR & Parsing
                </span>
              </h2>
              <p className="text-xs text-slate-400">Extract tracking IDs, dates & logistics info from unstructured text or invoices.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Preset Sample Documents */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Sample Document Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_DOCUMENTS.map((doc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputText(doc.text);
                    setParsedData(null);
                  }}
                  className="p-3 text-left bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300 group-hover:text-purple-200 mb-1">
                    <FileText className="w-3.5 h-3.5 text-purple-400" />
                    <span>{doc.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{doc.text.split('\n')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Unstructured Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unstructured Document Text / Invoice Content:
              </label>
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setParsedData(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-300"
              >
                Clear Text
              </button>
            </div>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw invoice text, bill of lading, or shipping notice here..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Action Parse Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleParse}
              disabled={isParsing || !inputText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Extracting Data with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Extract Shipment Data</span>
                </>
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Parsed Fields Preview & Edit Section */}
          {parsedData && (
            <div className="mt-6 pt-5 border-t border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Extracted Structured Fields</h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                  Confidence Score: {Math.round(parsedData.confidenceScore * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Reference Number / Tracking ID</label>
                  <input
                    type="text"
                    value={editableRef}
                    onChange={(e) => setEditableRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Carrier Line</label>
                  <input
                    type="text"
                    value={editableCarrier}
                    onChange={(e) => setEditableCarrier(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Origin City / Port</label>
                  <input
                    type="text"
                    value={editableOrigin}
                    onChange={(e) => setEditableOrigin(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Destination City / Port</label>
                  <input
                    type="text"
                    value={editableDest}
                    onChange={(e) => setEditableDest(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={editableDate}
                    onChange={(e) => setEditableDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cargo Description / Notes</label>
                  <input
                    type="text"
                    value={editableNotes}
                    onChange={(e) => setEditableNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Import Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleImportShipment}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Shipment...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Import as New Cargo Shipment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
