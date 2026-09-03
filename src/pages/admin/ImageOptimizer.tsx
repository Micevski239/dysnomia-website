import { useState, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useProducts } from '../../hooks/useProducts';
import { Image, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImageRecord {
  id: string;
  title: string;
  image_url: string | null;
  fileName: string;
  thumbExists: boolean;
  status: 'pending' | 'processing' | 'done' | 'error';
  message?: string;
}

const BUCKET = 'product-images';
const THUMB_FOLDER = 'thumbnails';
const THUMB_MAX = 400;
const THUMB_QUALITY = 0.8;

function extractFileName(url: string): string {
  const marker = `/${BUCKET}/`;
  const idx = url.lastIndexOf(marker);
  if (idx === -1) return '';
  return url.slice(idx + marker.length);
}

function createThumbnail(imageUrl: string, maxSize: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Thumbnail generation failed'))),
        'image/webp',
        quality
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid #E8E8E8',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
  padding: '24px',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  backgroundColor: '#0A0A0A',
  color: '#FFFFFF',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  backgroundColor: '#FFFFFF',
  color: '#1a1a1a',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  border: '1px solid #E5E5E5',
  cursor: 'pointer',
};

const statBox: React.CSSProperties = {
  backgroundColor: '#F7F7F7',
  borderRadius: '12px',
  padding: '16px 20px',
  textAlign: 'center' as const,
};

export default function ImageOptimizer() {
  const { products, loading: productsLoading } = useProducts(true);
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(0);
  const stoppedRef = useRef(false);

  const scanProducts = useCallback(async () => {
    setScanning(true);
    setRecords([]);
    setDone(0);
    setFailed(0);

    const items: ImageRecord[] = [];

    for (const p of products) {
      if (!p.image_url) continue;

      const fileName = extractFileName(p.image_url);
      if (!fileName) continue;

      const thumbPath = `${THUMB_FOLDER}/${fileName.replace(/\.\w+$/, '.webp')}`;
      let thumbExists = false;

      try {
        // Check if thumbnail file exists by trying to get its public URL
        // and checking the folder listing
        const folder = thumbPath.substring(0, thumbPath.lastIndexOf('/'));
        const file = thumbPath.substring(thumbPath.lastIndexOf('/') + 1);
        const { data } = await supabase.storage.from(BUCKET).list(folder, { search: file });
        thumbExists = (data && data.length > 0) || false;
      } catch {
        // If we can't check, assume it doesn't exist
      }

      items.push({
        id: p.id,
        title: p.title,
        image_url: p.image_url,
        fileName,
        thumbExists,
        status: thumbExists ? 'done' : 'pending',
        message: thumbExists ? 'Thumbnail exists' : 'Missing thumbnail',
      });
    }

    setRecords(items);
    setScanning(false);
  }, [products]);

  const generateThumbnails = useCallback(async () => {
    stoppedRef.current = false;
    setRunning(true);
    setDone(0);
    setFailed(0);

    let doneCount = 0;
    let failCount = 0;

    const pending = records.filter((r) => r.status === 'pending');

    for (const rec of pending) {
      if (stoppedRef.current) break;

      setRecords((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, status: 'processing', message: 'Generating...' } : r))
      );

      try {
        if (!rec.image_url) throw new Error('No image URL');

        const thumbBlob = await createThumbnail(rec.image_url, THUMB_MAX, THUMB_QUALITY);
        const webpName = rec.fileName.replace(/\.\w+$/, '.webp');
        const thumbPath = `${THUMB_FOLDER}/${webpName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(thumbPath, thumbBlob, {
            contentType: 'image/webp',
            cacheControl: '31536000',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        doneCount++;
        setDone(doneCount);
        setRecords((prev) =>
          prev.map((r) =>
            r.id === rec.id
              ? { ...r, status: 'done', thumbExists: true, message: 'Thumbnail created' }
              : r
          )
        );
      } catch (err) {
        failCount++;
        setFailed(failCount);
        setRecords((prev) =>
          prev.map((r) =>
            r.id === rec.id
              ? { ...r, status: 'error', message: err instanceof Error ? err.message : 'Failed' }
              : r
          )
        );
      }
    }

    setRunning(false);
  }, [records]);

  const stop = () => {
    stoppedRef.current = true;
  };

  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const existingCount = records.filter((r) => r.thumbExists).length;
  const errorCount = records.filter((r) => r.status === 'error').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0A0A0A', letterSpacing: '-0.5px' }}>
          Image Optimizer
        </h1>
        <p style={{ fontSize: '15px', color: '#888', marginTop: '6px' }}>
          Scan product images and generate missing thumbnails for faster page loads.
        </p>
      </div>

      {/* Scan Section */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Product Images</h2>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {productsLoading
                ? 'Loading products...'
                : `${products.filter((p) => p.image_url).length} products with images`}
            </p>
          </div>
          <button
            style={btnSecondary}
            onClick={scanProducts}
            disabled={scanning || productsLoading}
          >
            {scanning ? (
              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <RefreshCw style={{ width: '16px', height: '16px' }} />
            )}
            {scanning ? 'Scanning...' : 'Scan for Missing Thumbnails'}
          </button>
        </div>
      </div>

      {/* Stats + Actions */}
      {records.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={statBox}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#0A0A0A' }}>{records.length}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#22c55e' }}>{existingCount}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Have Thumbnail</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#eab308' }}>{pendingCount}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missing</div>
            </div>
            <div style={statBox}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: done > 0 ? '#3b82f6' : '#ccc' }}>{done}</div>
              <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Generated</div>
            </div>
            {errorCount > 0 && (
              <div style={statBox}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#ef4444' }}>{errorCount}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed</div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {running && (
            <div style={{ backgroundColor: '#F0F0F0', borderRadius: '8px', height: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  backgroundColor: '#0A0A0A',
                  borderRadius: '8px',
                  transition: 'width 0.3s',
                  width: `${pendingCount > 0 ? ((done + failed) / (pendingCount + done + failed)) * 100 : 0}%`,
                }}
              />
            </div>
          )}

          {/* Action Buttons */}
          {pendingCount > 0 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {!running ? (
                <button style={btnPrimary} onClick={generateThumbnails}>
                  <Image style={{ width: '16px', height: '16px' }} />
                  Generate {pendingCount} Missing Thumbnail{pendingCount !== 1 ? 's' : ''}
                </button>
              ) : (
                <button
                  style={{ ...btnSecondary, borderColor: '#ef4444', color: '#ef4444' }}
                  onClick={stop}
                >
                  Stop
                </button>
              )}
            </div>
          )}

          {/* Image List */}
          <div style={card}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A', marginBottom: '16px' }}>
              Image Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {records.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: rec.status === 'error' ? '#fef2f2' : rec.status === 'done' ? '#f0fdf4' : '#f9fafb',
                    border: `1px solid ${rec.status === 'error' ? '#fecaca' : rec.status === 'done' ? '#bbf7d0' : '#e5e7eb'}`,
                  }}
                >
                  {/* Thumbnail preview */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      backgroundColor: '#eee',
                    }}
                  >
                    {rec.image_url && (
                      <img
                        src={rec.image_url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rec.fileName}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    {rec.status === 'done' && <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />}
                    {rec.status === 'error' && <AlertCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />}
                    {rec.status === 'processing' && (
                      <Loader2 style={{ width: '16px', height: '16px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                    )}
                    {rec.status === 'pending' && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                    )}
                    <span style={{ fontSize: '12px', color: '#888' }}>{rec.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
