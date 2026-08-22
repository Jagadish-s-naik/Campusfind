import type { ItemReport, CampusLocation } from '../types';
import { CAMPUS_LOCATIONS } from '../types';
import { extractStructuredAttributes, generateItemEmbedding } from '../services/ai';
import { saveReport } from '../services/db';
import { triggerMatchingEngine } from '../services/matching';
import { sanitizeInput, validateImageFileSecurely, sanitizeBase64Image } from '../utils/security';
import { X, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useState } from 'react';

interface SubmitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportSubmitted: (newReport: ItemReport) => void;
}

export const SubmitReportModal: React.FC<SubmitReportModalProps> = ({
  isOpen,
  onClose,
  onReportSubmitted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [reporterName, setReporterName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState<CampusLocation>('Library Main Entrance');
  const [locationDetails, setLocationDetails] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Secure binary header & MIME-type validation
    const validation = await validateImageFileSecurely(file);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file upload.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const sanitizedPayload = sanitizeBase64Image(reader.result as string);
      setPhotoBase64(sanitizedPayload);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!reporterName.trim() || !contactInfo.trim()) {
        setErrorMsg('Please fill in your name and contact details.');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      if (!description.trim() || description.length < 10) {
        setErrorMsg('Please enter a descriptive details of the item (min 10 chars).');
        return;
      }
      if (!photoBase64) {
        setErrorMsg('Please upload a clear photo of the item.');
        return;
      }
      setErrorMsg('');
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    setStatusMessage('Analyzing photo & description with Gemini Multimodal AI...');

    const cleanReporterName = sanitizeInput(reporterName);
    const cleanContactInfo = sanitizeInput(contactInfo);
    const cleanDescription = sanitizeInput(description);
    const cleanLocationDetails = sanitizeInput(locationDetails);

    try {
      // 1. Extract Attributes via Gemini
      const structuredAttributes = await extractStructuredAttributes(photoBase64, cleanDescription, type);

      setStatusMessage('Generating vector embedding for semantic pre-filtering...');
      // 2. Generate Embeddings
      const embedding = await generateItemEmbedding(
        `${structuredAttributes.category} ${structuredAttributes.brand} ${structuredAttributes.color.join(' ')} ${cleanDescription}`
      );

      // 3. Assemble Sanitized Report Object
      const report: ItemReport = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type,
        reporterName: cleanReporterName,
        contactInfo: cleanContactInfo,
        photoBase64,
        description: cleanDescription,
        location,
        locationDetails: cleanLocationDetails,
        dateTime: new Date(dateTime).toISOString(),
        structuredAttributes,
        embedding,
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      setStatusMessage('Saving report to local browser IndexedDB...');
      await saveReport(report);

      setStatusMessage('Running AI pairwise matching engine against candidate reports...');
      await triggerMatchingEngine(report);

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });

      onReportSubmitted(report);
      handleReset();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process report with Gemini AI. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setType('lost');
    setReporterName('');
    setContactInfo('');
    setLocation('Library Main Entrance');
    setLocationDetails('');
    setDescription('');
    setPhotoBase64('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-card w-full max-w-xl rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 relative my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Step {step} of 3
            </span>
            <span className="text-xs text-slate-400 font-mono">Report Submission</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white">File a Lost or Found Item</h2>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Basic & Location Info */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Type Selector (Lost vs Found) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('lost')}
                  className={`p-3.5 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'lost'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setType('found')}
                  className={`p-3.5 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'found'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-glow'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  I Found Something
                </button>
              </div>
            </div>

            {/* Reporter Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Info (Email/Phone) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. alex@student.edu | 555-0192"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Location Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusLocation)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 bg-slate-900"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-900 text-slate-100">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Details & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Location Specifics (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bench near Window 3"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  onClick={(e) => {
                    if ('showPicker' in e.currentTarget) {
                      try {
                        (e.currentTarget as any).showPicker();
                      } catch (err) {}
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 cursor-pointer scheme-dark"
                />
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-glow transition-all"
            >
              Continue to Item Details & Photo →
            </button>
          </div>
        )}

        {/* STEP 2: Photo & Free-text Description */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Item Photo Upload *
              </label>
              <div className="relative border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-2xl p-4 text-center transition-colors bg-slate-900/40">
                {photoBase64 ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                    <img src={photoBase64} alt="Uploaded item preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoBase64('')}
                      className="absolute top-2 right-2 bg-slate-950/80 p-2 rounded-lg text-rose-400 hover:bg-slate-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200">Click to upload photo</p>
                    <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe brand, colors, distinguishing marks (e.g. keychains, stickers, scratches, custom cases)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-glow transition-all"
              >
                Review & Trigger AI Engine →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI Confirmation & Submission */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-4 space-y-3 bg-slate-900/80 border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-4 h-4" /> Ready for Gemini Multimodal Analysis
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div><span className="text-slate-500">Type:</span> <strong className="uppercase">{type}</strong></div>
                <div><span className="text-slate-500">Location:</span> <strong>{location}</strong></div>
                <div><span className="text-slate-500">Reporter:</span> <strong>{reporterName}</strong></div>
                <div><span className="text-slate-500">Time:</span> <strong>{new Date(dateTime).toLocaleTimeString()}</strong></div>
              </div>
              <p className="text-xs text-slate-400 italic pt-1">"{description}"</p>
            </div>

            {isSubmitting ? (
              <div className="py-6 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-200">{statusMessage}</p>
                <p className="text-xs text-slate-500 font-mono">Multimodal Attribute Extraction & Embedding Pipeline</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
                >
                  ← Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  Submit & Match Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
