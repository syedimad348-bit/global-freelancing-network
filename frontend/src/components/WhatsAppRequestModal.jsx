import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle, X, Shield, PhoneCall } from 'lucide-react';
import { apiFetch } from '../lib/api';

const COUNTRY_CODES = [
  { code: '+1', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+44', flag: '🇬🇧', name: 'UK (+44)' },
  { code: '+92', flag: '🇵🇰', name: 'Pakistan (+92)' },
  { code: '+91', flag: '🇮🇳', name: 'India (+91)' },
  { code: '+971', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+49', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+61', flag: '🇦🇺', name: 'Australia (+61)' },
  { code: '+65', flag: '🇸🇬', name: 'Singapore (+65)' },
  { code: '+60', flag: '🇲🇾', name: 'Malaysia (+60)' },
  { code: '+20', flag: '🇪🇬', name: 'Egypt (+20)' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria (+234)' },
  { code: '+55', flag: '🇧🇷', name: 'Brazil (+55)' },
  { code: '+81', flag: '🇯🇵', name: 'Japan (+81)' },
];

export default function WhatsAppRequestModal({ tool, isOpen, onClose }) {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  if (!isOpen || !tool) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (cleanDigits.length < 7 || cleanDigits.length > 14) {
      setError('Please enter a valid phone number (between 7 and 14 digits).');
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;
      const res = await apiFetch('/api/features/whatsapp-request', {
        method: 'POST',
        body: JSON.stringify({
          toolId: tool.id,
          toolName: tool.name,
          phoneNumber: fullPhone,
          countryCode,
          notes,
        }),
      });

      setSuccessData(res);
    } catch (err) {
      setError(err?.message || 'Unable to register request. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessData(null);
    setError(null);
    setPhoneNumber('');
    setNotes('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-elevated border border-line overflow-hidden z-10"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-sidebar to-[#2E1065] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 ring-1 ring-white/15">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-sidebar-muted">WhatsApp Access Request</span>
                <h3 className="text-lg font-black text-white">{tool.name}</h3>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {successData ? (
              /* Success State */
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Request ID: #{successData.requestId || 'GFN-REQ'}
                  </span>
                  <h4 className="text-xl font-black text-ink">Access Request Registered</h4>
                  <p className="text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-4 leading-relaxed">
                    “Thank you for your interest! Please wait. The relevant link and details will be shared with you on WhatsApp as soon as possible.”
                  </p>
                </div>

                <div className="bg-surface-subtle border border-line rounded-xl p-3.5 text-xs text-ink-muted text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink-soft">Target Tool:</span>
                    <span className="font-bold text-ink">{tool.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink-soft">Submitted Phone:</span>
                    <span className="font-mono text-ink">{successData.normalizedNumber || phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-ink-soft">Queue Status:</span>
                    <span className="text-brand-600 font-semibold">Registered in dispatch queue</span>
                  </div>
                </div>

                <button
                  onClick={handleResetAndClose}
                  className="btn-primary w-full h-11 text-sm font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-3.5 flex items-start gap-3 text-xs text-brand-900">
                  <Shield className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Access details, prompt templates, and exclusive workflows for <strong>{tool.name}</strong> will be shared directly through WhatsApp.
                  </p>
                </div>

                {/* Country Code & Phone Number Input */}
                <div>
                  <label className="label">
                    WhatsApp Number <span className="text-accent-rose">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-36 bg-white border border-line rounded-xl px-2.5 py-2.5 text-xs font-semibold text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>

                    <div className="relative flex-1">
                      <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="300 1234567"
                        required
                        className="input pl-9 h-10 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-ink-subtle mt-1.5">
                    Include your active WhatsApp mobile number with area/subscriber code.
                  </p>
                </div>

                {/* Optional Requirements / Use Case */}
                <div>
                  <label className="label">
                    Specific Use Case or Request <span className="text-ink-subtle font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g., Interested in video prompts or workflow automation scripts..."
                    className="input py-2 text-xs resize-none"
                  />
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="btn-secondary h-10 px-4 text-xs font-semibold"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary h-10 px-5 text-xs font-bold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
