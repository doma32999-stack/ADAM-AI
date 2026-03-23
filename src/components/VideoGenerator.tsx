import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Video, Loader2, Key, AlertCircle } from 'lucide-react';
import { generateVideo } from '../services/aiService';
import { Language, translations } from '../i18n';

interface VideoGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  title: string;
  language: Language;
}

export function VideoGenerator({ isOpen, onClose, prompt, title, language }: VideoGeneratorProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];
  const isRtl = language === 'ar';

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, [isOpen]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleGenerate = async () => {
    if (!hasKey) return;
    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateVideo(`A cinematic, high-quality video showing: ${prompt}. Professional lighting, 4k detail.`);
      if (!url) {
        throw new Error("Failed to generate video. This might be due to an invalid API key, lack of credits, or content safety filters.");
      }
      setVideoUrl(url);
    } catch (err: any) {
      console.error("Video generation error:", err);
      setError(err.message || "Failed to generate video.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${title.replace(/\s+/g, '_')}_video.mp4`;
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8">
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
            {/* Video Area */}
            <div className="relative flex-grow bg-black/40 aspect-video md:aspect-auto md:h-[600px] flex items-center justify-center overflow-hidden">
              {!hasKey ? (
                <div className="flex flex-col items-center gap-6 p-8 text-center max-w-md">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <Key className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white">{t.selectKeyTitle}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {t.selectKeyDesc}
                    </p>
                  </div>
                  <button
                    onClick={handleSelectKey}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    {t.selectKeyBtn}
                  </button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    Learn about Gemini API billing
                  </a>
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-6 p-8 text-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-400 animate-spin" />
                    <Video className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white mb-2">{t.creatingVideo}</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto">
                      {t.videoWait}
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-indigo-600"
                      animate={{ x: [-200, 200] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    />
                  </div>
                </div>
              ) : videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              ) : error ? (
                <div className="text-center p-8 max-w-xs">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm mb-6">{error}</p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={handleGenerate}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleSelectKey}
                      className="px-8 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                    >
                      <Key className="w-3 h-3" />
                      Select Different Key
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
                    <Video className="w-8 h-8 text-indigo-400" />
                  </div>
                  <p className="text-white font-bold mb-4">Ready to create your video?</p>
                  <button 
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    {t.generateVideo}
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
                    <Video className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                    Veo Video AI
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-bold mb-2 text-white">{t.videoTitle}</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  {t.videoSubtitle}: <span className="font-bold text-white">{title}</span>
                </p>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-3 h-3 text-indigo-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Context</p>
                  </div>
                  <p className="text-xs text-gray-400 italic leading-relaxed">
                    "{prompt}"
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                {videoUrl && (
                  <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    <Download className="w-4 h-4" /> {t.downloadVideo}
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
