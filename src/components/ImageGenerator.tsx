import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Sparkles, Loader2, Key, AlertCircle, Edit3, Check, RotateCcw } from 'lucide-react';
import { generateImage, editImage } from '../services/aiService';
import { Language, translations } from '../i18n';

interface ImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  title: string;
  language: Language;
}

export function ImageGenerator({ isOpen, onClose, prompt, title, language }: ImageGeneratorProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    if (isOpen && !imageUrl && !isGenerating) {
      handleGenerate();
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateImage(`A highly detailed, professional illustration of: ${prompt}. Cinematic lighting, 4k resolution, artistic style.`);
      if (!url) {
        throw new Error("Failed to generate image. This might be due to an invalid API key or content safety filters.");
      }
      setImageUrl(url);
      setOriginalUrl(url);
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title.replace(/\s+/g, '_')}_visual.png`;
    link.click();
  };

  const handleApplyEdit = async () => {
    if (!imageUrl || !editPrompt.trim()) return;
    
    setIsApplyingEdit(true);
    setError(null);
    try {
      // Extract base64 and mimeType from data URL
      const [header, base64Data] = imageUrl.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      
      const editedUrl = await editImage(base64Data, mimeType, editPrompt);
      if (!editedUrl) {
        throw new Error("Failed to edit image. Please try a different prompt.");
      }
      setImageUrl(editedUrl);
      setIsEditing(false);
      setEditPrompt('');
    } catch (err: any) {
      console.error("Image editing error:", err);
      setError(err.message || "Failed to edit image.");
    } finally {
      setIsApplyingEdit(false);
    }
  };

  const handleReset = () => {
    setImageUrl(originalUrl);
    setIsEditing(false);
    setEditPrompt('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl glass rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Image Area */}
            <div className="relative flex-grow bg-black/40 aspect-square md:aspect-auto md:h-[600px] flex items-center justify-center overflow-hidden">
              {isGenerating || isApplyingEdit ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                    {isApplyingEdit ? t.editingImage : t.visualizing}
                  </p>
                </div>
              ) : error ? (
                <div className="text-center p-8 max-w-xs">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-6">{error}</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleGenerate}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Retry
                    </button>
                    <button
                      // @ts-ignore
                      onClick={() => window.aistudio?.openSelectKey().then(() => window.location.reload())}
                      className="px-6 py-2 bg-red-500/20 text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                    >
                      <Key className="w-3 h-3" />
                      Select Key
                    </button>
                  </div>
                </div>
              ) : imageUrl ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-400">Failed to generate image. Please try again.</p>
                  <button 
                    onClick={handleGenerate}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Overlay Controls */}
              <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} flex gap-2`}>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-black/40 backdrop-blur-md shadow-lg rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full md:w-80 p-8 flex flex-col justify-between bg-black/20 backdrop-blur-xl">
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center border border-indigo-500/20">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    Nano Banana AI
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold mb-2 text-white">{t.visualTitle}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {t.visualSubtitle}: <span className="font-bold text-white">{title}</span>
                </p>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Prompt Context</p>
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    "{prompt}"
                  </p>
                </div>

                {imageUrl && !isGenerating && !isApplyingEdit && (
                  <div className="mt-6 space-y-4">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-indigo-400 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" /> {t.editImage}
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                      >
                        <textarea
                          value={editPrompt}
                          onChange={(e) => setEditPrompt(e.target.value)}
                          placeholder={t.editPromptPlaceholder}
                          className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:ring-1 focus:ring-indigo-500 outline-none min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleApplyEdit}
                            disabled={!editPrompt.trim() || isApplyingEdit}
                            className="flex-grow py-3 bg-indigo-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <Check className="w-3 h-3" /> {t.applyChanges}
                          </button>
                          <button
                            onClick={handleReset}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                            title="Reset to Original"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 space-y-3">
                {imageUrl && (
                  <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <Download className="w-4 h-4" /> Download Image
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
