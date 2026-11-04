'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, FolderOpen } from 'lucide-react';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  uploadEndpoint?: string;
}

const ALLOWED_FORMATS = 'image/jpeg, image/png, image/webp, image/gif, image/avif';
const MAX_SIZE_MB = 10;

export default function ImagePicker({
  value,
  onChange,
  label = 'Gambar Konser',
  required = false,
  uploadEndpoint = '/api/upload',
}: ImagePickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ Core upload logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileUpload = useCallback(
    async (file: File) => {
      setUploadError('');

      // Client-side validation
      if (!file.type.startsWith('image/')) {
        setUploadError('File harus berupa gambar (JPG, PNG, WebP, GIF, AVIF).');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB} MB.`);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Fake progress indicator while uploading
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 15, 85));
      }, 120);

      try {
        const form = new FormData();
        form.append('file', file);

        const res = await fetch(uploadEndpoint, { method: 'POST', body: form });
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Upload gagal. Coba lagi.');
        }

        clearInterval(progressInterval);
        setUploadProgress(100);
        onChange(data.url);
        setUploadedFileName(file.name);
      } catch (err: unknown) {
        clearInterval(progressInterval);
        setUploadError(err instanceof Error ? err.message : 'Upload gagal. Coba lagi.');
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 400);
      }
    },
    [onChange, uploadEndpoint]
  );

  // â”€â”€ Drag & Drop handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    // Only fire if leaving the drop zone itself (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  // â”€â”€ File input via dialog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const openFileBrowser = () => fileInputRef.current?.click();

  const clearImage = () => {
    onChange('');
    setUploadedFileName('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isSuccess = !!value && !!uploadedFileName;

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: '0.6rem',
        }}
      >
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
      </label>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={isUploading ? undefined : openFileBrowser}
        style={{
          border: `2px dashed ${
            isDragging
              ? 'var(--text-primary)'
              : isSuccess
              ? '#10b981'
              : uploadError
              ? '#ef4444'
              : 'var(--border-default)'
          }`,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isDragging
            ? 'var(--bg-surface-elevated)'
            : isSuccess
            ? 'rgba(16, 185, 129, 0.05)'
            : 'var(--bg-glass-input)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.65rem',
          cursor: isUploading ? 'wait' : 'pointer',
          transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'center',
          minHeight: '140px',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* Uploading state */}
        {isUploading && (
          <>
            <Loader2
              size={32}
              style={{ color: 'var(--text-secondary)', animation: 'ip-spin 0.8s linear infinite' }}
            />
            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Mengunggah gambar...
            </span>
            {/* Progress bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '3px',
                width: `${uploadProgress}%`,
                backgroundColor: 'var(--text-primary)',
                transition: 'width 0.15s ease',
                borderRadius: '0 2px 2px 0',
              }}
            />
          </>
        )}

        {/* Success state */}
        {!isUploading && isSuccess && (
          <>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16,185,129,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={22} style={{ color: '#10b981' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>
                Upload berhasil!
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.15rem',
                  wordBreak: 'break-all',
                  maxWidth: '280px',
                }}
              >
                {uploadedFileName}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openFileBrowser(); }}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', marginTop: '0.15rem' }}
            >
              Ganti Gambar
            </button>
          </>
        )}

        {/* Idle / drag state */}
        {!isUploading && !isSuccess && (
          <>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isDragging ? 'var(--text-primary)' : 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              {isDragging ? (
                <Upload size={22} style={{ color: 'var(--text-inverse)' }} />
              ) : (
                <ImageIcon size={22} style={{ color: 'var(--text-secondary)' }} />
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isDragging ? 'Lepaskan untuk upload' : 'Klik atau drag & drop gambar'}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                JPG, PNG, WebP, GIF, AVIF â€” Maks. {MAX_SIZE_MB} MB
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); openFileBrowser(); }}
              className="btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                padding: '0.45rem 1rem',
                marginTop: '0.1rem',
              }}
            >
              <FolderOpen size={15} />
              Buka File Manager
            </button>
          </>
        )}
      </div>

      {/* Hidden file input â€” connected to OS file browser */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_FORMATS}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
          // Reset so re-selecting same file triggers onChange
          e.target.value = '';
        }}
      />

      {/* Error message */}
      {uploadError && (
        <div
          style={{
            marginTop: '0.55rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 0.9rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: '0.8rem',
            fontWeight: 500,
          }}
        >
          <X size={14} style={{ flexShrink: 0 }} />
          {uploadError}
        </div>
      )}

      {/* Preview + clear */}
      {value && (
        <div
          style={{
            marginTop: '0.9rem',
            display: 'flex',
            gap: '0.9rem',
            alignItems: 'flex-start',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Thumbnail */}
          <div
            style={{
              width: '100px',
              height: '70px',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              border: '1px solid var(--border-default)',
              flexShrink: 0,
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
            />
          </div>

          {/* Info + clear button */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
              Preview Gambar
            </div>
            <div
              style={{
                fontSize: '0.71rem',
                color: 'var(--text-muted)',
                wordBreak: 'break-all',
                lineHeight: 1.4,
              }}
            >
              {value}
            </div>
            <button
              type="button"
              onClick={clearImage}
              style={{
                marginTop: '0.45rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.74rem',
                color: '#ef4444',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 600,
              }}
            >
              <X size={13} />
              Hapus Gambar
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes ip-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

