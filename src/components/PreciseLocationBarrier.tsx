import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, RefreshCw, ShieldAlert, CheckCircle2, Navigation } from 'lucide-react';
import { locationVerificationService, LocationVerificationState, VerifiedLocation } from '../services/locationVerificationService';

interface PreciseLocationBarrierProps {
  isOpen: boolean;
  onClose?: () => void;
  onVerified?: () => void;
  title?: string;
  contextAction?: string;
}

export const PreciseLocationBarrier: React.FC<PreciseLocationBarrierProps> = ({
  isOpen,
  onClose,
  onVerified,
  title = 'Precise Location Required',
  contextAction = 'authentication'
}) => {
  const [state, setState] = useState<LocationVerificationState>(() => locationVerificationService.getState());
  const [location, setLocation] = useState<VerifiedLocation | null>(() => locationVerificationService.getVerifiedLocation());
  const [errorMessage, setErrorMessage] = useState<string | null>(() => locationVerificationService.getErrorMessage());
  const [isChecking, setIsChecking] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = locationVerificationService.subscribe((newState, newLoc, newErr) => {
      setState(newState);
      setLocation(newLoc);
      setErrorMessage(newErr);

      if (newState === 'VALID' && newLoc && onVerified) {
        onVerified();
      }
    });

    return () => unsubscribe();
  }, [onVerified]);

  const handleRetry = async () => {
    setIsChecking(true);
    try {
      const result = await locationVerificationService.requirePreciseLocation();
      if (result.valid && onVerified) {
        onVerified();
      }
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  const getGuidanceText = () => {
    switch (state) {
      case 'PERMISSION_DENIED':
        return 'Location permission is denied. Please allow location access in your browser settings and select Precise Location, then tap Retry below.';
      case 'SERVICES_DISABLED':
        return 'Device Location Services are turned off. Please turn on Location in your device settings, ensure Precise Location is enabled, and tap Retry.';
      case 'TIMEOUT':
        return 'Could not acquire precise GPS coordinates in time. Please ensure you have a clear signal, verify Location is turned on, and tap Retry.';
      case 'APPROXIMATE_BLOCKED':
      case 'INTERRUPTED':
      default:
        return 'Precise location is required. Approximate location is not supported. Please enable Precise location in your browser and try again.';
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#140E0A] border-2 border-amber-600/70 p-6 shadow-[0_0_50px_rgba(217,119,6,0.25)] text-[#FAF7F2] text-center space-y-4">
        
        {/* Security Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
          {state === 'VALID' ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-7 h-7 text-amber-400" />
          )}
        </div>

        {/* Title */}
        <div>
          <h3 className="font-serif text-lg font-bold text-amber-100 tracking-wide">
            {title}
          </h3>
          <p className="text-xs text-amber-300/80 font-mono mt-0.5">
            Mandatory Security Gate &bull; {contextAction}
          </p>
        </div>

        {/* Main Error / Notice */}
        <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/40 text-left space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errorMessage || 'Precise location is required. Approximate location is not supported. Please enable Precise location for this site and try again.'}</span>
          </div>
          <p className="text-[11px] text-amber-100/70 leading-relaxed pl-6">
            {getGuidanceText()}
          </p>
        </div>

        {/* Sensor info if available */}
        {location && location.accuracy > 0 && (
          <div className="text-[11px] font-mono text-stone-400 flex items-center justify-between px-2 py-1 bg-black/40 rounded-lg border border-stone-800">
            <span>Detected Sensor Accuracy:</span>
            <span className="text-amber-400 font-bold">&plusmn;{Math.round(location.accuracy)}m</span>
          </div>
        )}

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          disabled={isChecking}
          className="w-full py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:brightness-110 active:scale-95 text-[#070605] shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Verifying precise location...</span>
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 text-black" />
              <span>Enable Precise Location &amp; Retry</span>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

