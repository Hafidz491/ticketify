'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, AlertCircle, Volume2, VolumeX, CheckCircle } from 'lucide-react';

interface LiveQRScannerProps {
  onScanSuccess: (decodedCode: string) => void;
  isLoading?: boolean;
}

// Helper to extract booking code from various QR code formats
export function parseBookingCode(raw: string): string {
  const text = raw.trim();

  // 1. If it's a JSON string (e.g. { code: 'TCK-782914', ... })
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed.code === 'string') {
      return parsed.code.trim().toUpperCase();
    }
  } catch { }

  // 2. If it's prefix format "TICKETIFY:TCK-XXXXXX:..."
  if (text.startsWith('TICKETIFY:')) {
    const parts = text.split(':');
    if (parts[1]) return parts[1].trim().toUpperCase();
  }

  // 3. Regex match for standard Ticketify code TCK-XXXXXX
  const match = text.match(/TCK-\d{6}/i);
  if (match) {
    return match[0].toUpperCase();
  }

  return text.toUpperCase();
}

export default function LiveQRScanner({ onScanSuccess, isLoading }: LiveQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const lastScanTimestamp = useRef<number>(0);
  const readerElementId = 'ticketify-qr-reader-viewport';

  // Audio feedback with Web Audio API (cross-platform, zero asset dependency)
  const playScanBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch { }
  }, [soundEnabled]);

  // Vibrate mobile device if available
  const triggerHaptic = useCallback(() => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(180);
      }
    } catch { }
  }, []);

  // Stop camera stream safely
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      } finally {
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  // Start camera stream
  const startScanner = useCallback(async (cameraIdToUse?: string) => {
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Stop any existing instance
      await stopScanner();

      // Ensure element exists in DOM
      const targetElement = document.getElementById(readerElementId);
      if (!targetElement) {
        throw new Error('Element scanner container tidak ditemukan');
      }

      // Enumerate available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id}` })));
        }
      } catch {
        // Fallback if browser blocks enumerateDevices prior to permission
      }

      const html5QrCode = new Html5Qrcode(readerElementId);
      scannerRef.current = html5QrCode;

      // Select camera: preferred environment/back camera or specific device
      const cameraConfig = cameraIdToUse
        ? { deviceId: { exact: cameraIdToUse } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: { width: 200, height: 200 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText: string) => {
          // Debounce scan: avoid triggering repeatedly on same code within 2.5 seconds
          const now = Date.now();
          const cleanCode = parseBookingCode(decodedText);

          if (now - lastScanTimestamp.current < 2500) {
            return;
          }

          lastScanTimestamp.current = now;
          setLastScannedCode(cleanCode);
          playScanBeep();
          triggerHaptic();

          // Dispatch to parent handler
          onScanSuccess(cleanCode);
        },
        () => {
          // Frame without QR - do nothing
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Camera Scanner Error:', err);
      let errorMsg = 'Gagal mengakses kamera.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        errorMsg = 'Izin akses kamera ditolak. Harap izinkan akses kamera di peramban Anda.';
      } else if (err?.name === 'NotFoundError' || err?.message?.includes('No device')) {
        errorMsg = 'Kamera tidak terdeteksi pada perangkat ini.';
      } else if (err?.message) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      setIsScanning(false);
    }
  }, [stopScanner, onScanSuccess, playScanBeep, triggerHaptic]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch { }
      }
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: isScanning ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              color: isScanning ? '#10b981' : '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Camera size={17} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Live Camera Scanner</span>
              {isScanning && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    fontWeight: 800,
                  }}
                >
                  LIVE
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
              Pindai QR Code tiket langsung menggunakan kamera laptop atau smartphone petugas.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} color="var(--text-muted)" />}
          </button>

          {/* Toggle Camera On/Off */}
          {!isScanning ? (
            <button
              type="button"
              onClick={() => startScanner(selectedCameraId)}
              className="btn-primary"
              style={{
                height: '34px',
                fontSize: '0.78rem',
                gap: '0.4rem',
                backgroundColor: '#0284c7',
                border: 'none',
              }}
            >
              <Camera size={14} />
              <span>Buka Kamera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanner}
              className="btn-secondary"
              style={{
                height: '34px',
                fontSize: '0.78rem',
                gap: '0.4rem',
                color: '#ef4444',
              }}
            >
              <CameraOff size={14} />
              <span>Tutup Kamera</span>
            </button>
          )}
        </div>
      </div>

      {/* Camera Selection Dropdown (if multiple cameras detected) */}
      {cameras.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem' }}>
          <label style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pilih Kamera:</label>
          <select
            value={selectedCameraId}
            onChange={(e) => {
              setSelectedCameraId(e.target.value);
              if (isScanning) startScanner(e.target.value);
            }}
            style={{
              flex: 1,
              maxWidth: '300px',
              height: '30px',
              padding: '0 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-glass-input)',
              fontSize: '0.74rem',
            }}
          >
            <option value="">Otomatis (Kamera Belakang)</option>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Camera Error Alert */}
      {cameraError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.78rem',
            color: '#ef4444',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Scanner Viewport Container (Strictly Square Aspect Ratio) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          aspectRatio: '1 / 1',
          margin: '0 auto',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#090d16',
          border: '1.5px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Placeholder when camera is OFF */}
        {!isScanning && (
          <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-secondary)' }}>
            <Camera size={38} style={{ margin: '0 auto 0.65rem', opacity: 0.35, color: '#38bdf8' }} />
            <p style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Kamera Sedang Nonaktif
            </p>
            <p style={{ fontSize: '0.72rem', maxWidth: '240px', margin: '0 auto 0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Klik tombol di bawah untuk mengaktifkan pemindai QR Code.
            </p>
            <button
              type="button"
              onClick={() => startScanner(selectedCameraId)}
              className="btn-primary"
              style={{ height: '34px', fontSize: '0.78rem', gap: '0.35rem' }}
            >
              <Camera size={13} />
              <span>Nyalakan Pemindai Kamera</span>
            </button>
          </div>
        )}

        {/* Video stream container for html5-qrcode */}
        <div
          id={readerElementId}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: isScanning ? 'block' : 'none',
            overflow: 'hidden',
          }}
        />

        {/* Futuristic Viewfinder Frame Overlay (Only active when scanning) */}
        {isScanning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Viewfinder Target Box (Square) */}
            <div
              style={{
                position: 'relative',
                width: '190px',
                height: '190px',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                borderRadius: '14px',
              }}
            >
              {/* Corner brackets */}
              <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '22px', height: '22px', borderTop: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderTopLeftRadius: '8px' }} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '22px', height: '22px', borderTop: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderTopRightRadius: '8px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '22px', height: '22px', borderBottom: '3px solid #38bdf8', borderLeft: '3px solid #38bdf8', borderBottomLeftRadius: '8px' }} />
              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', borderBottom: '3px solid #38bdf8', borderRight: '3px solid #38bdf8', borderBottomRightRadius: '8px' }} />

              {/* Animated Laser Scanning Line */}
              <div
                className="qr-laser-line"
                style={{
                  position: 'absolute',
                  left: '4px',
                  right: '4px',
                  height: '2px',
                  backgroundColor: '#38bdf8',
                  boxShadow: '0 0 10px #38bdf8, 0 0 4px #0284c7',
                }}
              />
            </div>

            {/* Instruction Badge */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.68rem',
                color: '#ffffff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={11} className="spin-animation" />
                  <span>Memverifikasi tiket...</span>
                </>
              ) : (
                <span>Arahkan kamera ke QR Code</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Last Scanned Code Feedback */}
      {lastScannedCode && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.74rem',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>Hasil Pindaian Terakhir:</span>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
            {lastScannedCode}
          </span>
        </div>
      )}

      <style jsx global>{`
        #ticketify-qr-reader-viewport {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: none !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        #ticketify-qr-reader-viewport > div {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
        }
        #ticketify-qr-reader-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: var(--radius-lg) !important;
        }
        #ticketify-qr-reader-viewport img {
          display: none !important;
        }
        #ticketify-qr-reader-viewport #ticketify-qr-reader-viewport__scan_region {
          min-height: unset !important;
        }
        @keyframes scanLaser {
          0% {
            top: 4px;
            opacity: 0.8;
          }
          50% {
            top: 180px;
            opacity: 1;
          }
          100% {
            top: 4px;
            opacity: 0.8;
          }
        }
        .qr-laser-line {
          animation: scanLaser 2s ease-in-out infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

