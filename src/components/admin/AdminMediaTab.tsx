import React, { useState } from 'react';
import { Upload, Trash2, Copy, Check, Eye, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminMediaTabProps {
  media: any[];
  onRefresh: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
  onSelectMedia?: (url: string) => void;
  isPickerMode?: boolean;
}

export const AdminMediaTab: React.FC<AdminMediaTabProps> = ({
  media,
  onRefresh,
  onShowToast,
  onSelectMedia,
  isPickerMode = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await api.uploadMedia(base64, file.name, file.type);
        successCount++;
      } catch (err: any) {
        console.error('Upload error:', err);
      }
    }

    setIsUploading(false);
    onShowToast(`Successfully uploaded ${successCount} photograph(s) to permanent storage.`);
    onRefresh();
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    onShowToast('Image URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Permanently delete this image from server disk storage?')) return;
    try {
      await api.deleteMedia(id);
      onShowToast('Photograph deleted.');
      onRefresh();
    } catch (err: any) {
      onShowToast(err.message || 'Failed to delete image', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-lg font-bold text-[#172B4D]">Centralized Media & Photograph Library</h2>
          <p className="text-xs text-slate-500">
            Upload, preview, organize, and copy persistent URLs for product photos, banners, and store graphics.
          </p>
        </div>

        <label className="px-4 py-2.5 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto">
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to Storage...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload New Photograph</span>
            </>
          )}
          <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
        </label>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between hover:border-[#783D1B]/50 transition-all"
          >
            <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <img
                src={item.url}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMedia(item)}
                  className="p-1.5 bg-white text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item.url, item.id)}
                  className="p-1.5 bg-white text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Copy URL"
                >
                  {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {!isPickerMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(item.id)}
                    className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-2.5 text-left border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800 truncate" title={item.name}>
                {item.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {(item.size / 1024).toFixed(1)} KB
              </p>
              {isPickerMode && onSelectMedia && (
                <button
                  type="button"
                  onClick={() => onSelectMedia(item.url)}
                  className="w-full mt-2 py-1 bg-[#783D1B] text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Select Photo
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {media.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">Media Library is empty</p>
          <p className="mt-1">Upload JPEG, PNG or WebP photographs to store them permanently on server disk storage.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <h3 className="font-bold text-sm text-[#172B4D] truncate">{previewMedia.name}</h3>
              <button onClick={() => setPreviewMedia(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
              <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[60vh] w-auto object-contain" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Path: {previewMedia.url}</span>
              <button
                onClick={() => handleCopyUrl(previewMedia.url, previewMedia.id)}
                className="px-3 py-1 bg-[#783D1B] text-white rounded-lg font-sans font-bold cursor-pointer"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
