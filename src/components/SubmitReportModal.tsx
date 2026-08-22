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
  const [studentCampusId, setStudentCampusId] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState<CampusLocation>('Cafe(ground Floor)');
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
      if (!photoBase64) {
        setErrorMsg('Please upload a photo of the item.');
        return;
      }
      setErrorMsg('');
      setStep(2);
    } else if (step === 2) {
      if (!description.trim() || description.length < 10) {
        setErrorMsg('Please enter a descriptive summary of the item (min 10 characters).');
        return;
      }
      setErrorMsg('');
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!reporterName.trim() || !contactInfo.trim()) {
      setErrorMsg('Please enter your name and contact info.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setStatusMessage('Analyzing photo & description with Gemini Multimodal AI...');

    const cleanReporterName = sanitizeInput(reporterName);
    const cleanStudentCampusId = sanitizeInput(studentCampusId);
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
        studentCampusId: cleanStudentCampusId || undefined,
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
    setStudentCampusId('');
    setContactInfo('');
    setLocation('Cafe(ground Floor)');
    setLocationDetails('');
    setDescription('');
    setPhotoBase64('');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="sb-card w-full max-w-xl p-6 sm:p-8 relative my-8 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header & Step Indicator */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#1E5F4A] uppercase tracking-wider">
              Step {step} of 3 — {step === 1 ? 'Type & Photo' : step === 2 ? 'Item Details' : 'Contact & Review'}
            </span>
            <span className="text-xs text-slate-400 font-bold">{Math.round((step / 3) * 100)}% Complete</span>
          </div>

          {/* Starbucks Progressive Step Bar */}
          <div className="w-full h-2 rounded-full bg-[#F3F1EA] overflow-hidden flex">
            <div
              style={{ width: `${(step / 3) * 100}%` }}
              className="h-full bg-[#2C8C63] transition-all duration-300"
            />
          </div>
          <h2 className="text-2xl font-heading font-extrabold text-[rgba(0,0,0,0.87)]">Submit a Campus Report</h2>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-[#C4291F] text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: TYPE + PHOTO (Starbucks Segmented Pill + Photo Upload) */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Report Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('lost')}
                  className={`p-3.5 rounded-full border-2 font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'lost'
                      ? 'bg-rose-50 border-[#C4291F] text-[#C4291F]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C4291F]" />
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setType('found')}
                  className={`p-3.5 rounded-full border-2 font-extrabold text-sm flex items-center justify-center gap-2 transition-all ${
                    type === 'found'
                      ? 'bg-[#DCEEE5] border-[#1E5F4A] text-[#1E5F4A]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2C8C63]" />
                  I Found Something
                </button>
              </div>
            </div>

            {/* Photo Upload Area */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Item Photo Upload *
              </label>
              <div className="relative border-2 border-dashed border-slate-300 hover:border-[#2C8C63] rounded-2xl p-4 text-center transition-colors bg-[#F3F1EA]">
                {photoBase64 ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                    <img src={photoBase64} alt="Uploaded item preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setPhotoBase64('')}
                      className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-rose-400 hover:bg-slate-900 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#DCEEE5] flex items-center justify-center text-[#1E5F4A]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-extrabold text-slate-900">Click to upload photo</p>
                    <p className="text-xs text-slate-500 font-medium">PNG, JPG, WEBP up to 5MB</p>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <button
              onClick={handleNextStep}
              className="sb-btn-primary w-full py-3.5 text-sm"
            >
              Continue to Details →
            </button>
          </div>
        )}

        {/* STEP 2: DETAILS (Description + Floating-Label Inputs + Location Dropdown) */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe brand, colors, distinguishing marks (e.g. keychains, stickers, scratches)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Campus Location Dropdown */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Campus Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusLocation)}
                className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 bg-white"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-white text-slate-900">
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Details & Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Location Specifics (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bench near Window 3"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
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
                  className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="sb-btn-outline w-1/3 py-3 text-sm"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="sb-btn-primary w-2/3 py-3 text-sm"
              >
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT + REVIEW SUMMARY CARD */}
        {step === 3 && (
          <div className="space-y-5">
            {/* Reporter Contact Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                  Student Campus ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2024-8891"
                  value={studentCampusId}
                  onChange={(e) => setStudentCampusId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Info (Email/Phone) *
              </label>
              <input
                type="text"
                placeholder="e.g. alex@student.edu | 555-0192"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg sb-input text-sm text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Review Summary Card */}
            <div className="sb-card p-4 space-y-3 bg-[#F3F1EA] border-[#1E5F4A]/20">
              <div className="flex items-center gap-2 text-[#1E5F4A] text-xs font-extrabold tracking-wide uppercase">
                <Sparkles className="w-4 h-4" /> Submission Summary Review
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div><span className="text-slate-500">Type:</span> <strong className="uppercase">{type}</strong></div>
                <div><span className="text-slate-500">Location:</span> <strong>{location}</strong></div>
                <div><span className="text-slate-500">Reporter:</span> <strong>{reporterName || 'Unspecified'}</strong></div>
                {studentCampusId && (
                  <div><span className="text-slate-500">Campus ID:</span> <strong>{studentCampusId}</strong></div>
                )}
                <div><span className="text-slate-500">Time:</span> <strong>{new Date(dateTime).toLocaleTimeString()}</strong></div>
              </div>
              <p className="text-xs text-slate-600 italic pt-1">"{description}"</p>
            </div>

            {isSubmitting ? (
              <div className="py-6 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#1E5F4A] animate-spin mx-auto" />
                <p className="text-sm font-extrabold text-slate-900">{statusMessage}</p>
                <p className="text-xs text-slate-500 font-semibold">Multimodal Attribute Extraction & Embedding Pipeline</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="sb-btn-outline w-1/3 py-3 text-sm"
                >
                  ← Edit
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="sb-btn-primary w-2/3 py-3 text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                  Submit Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
