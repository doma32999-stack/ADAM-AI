import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Brain, Info, LayoutGrid, MessageSquare, Sparkles, Mic, Languages, AlertTriangle, Key, X, Share2, Check } from 'lucide-react';
import { KNOWLEDGE_BASE, InfoCard } from './constants';
import { KnowledgeCard } from './components/KnowledgeCard';
import { AIChat } from './components/AIChat';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ImageGenerator } from './components/ImageGenerator';
import { VideoGenerator } from './components/VideoGenerator';
import { Language, translations } from './i18n';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<InfoCard | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVisualOpen, setIsVisualOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [visualData, setVisualData] = useState<{ prompt: string; title: string } | null>(null);
  const [videoData, setVideoData] = useState<{ prompt: string; title: string } | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = "https://ais-pre-v5upnlwfpl6q4bfc3xf2sx-441966396357.europe-west2.run.app";
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore - aistudio is injected by the platform
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      setHasApiKey(true);
      // Reload to ensure environment variables are updated
      window.location.reload();
    }
  };

  const t = translations[language];
  const isRtl = language === 'ar';

  const filteredCards = useMemo(() => {
    return KNOWLEDGE_BASE.filter(card => 
      card.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.category[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags[language].some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, language]);

  const handleExplore = (card: InfoCard) => {
    setSelectedCard(card);
    setIsChatOpen(true);
  };

  const handleGenerateVisual = (card: InfoCard) => {
    setVisualData({
      prompt: card.content[language],
      title: card.title[language]
    });
    setIsVisualOpen(true);
  };

  const handleGenerateVideo = (card: InfoCard) => {
    setVideoData({
      prompt: card.content[language],
      title: card.title[language]
    });
    setIsVideoOpen(true);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={`min-h-[100dvh] flex flex-col font-sans ai-grid ${isRtl ? 'font-arabic' : ''}`} dir={isRtl ? 'rtl' : 'ltr'} id="app-root">
      {/* API Key Warning Banner */}
      {!hasApiKey && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between gap-4 z-50">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {language === 'en' 
                ? "AI features require an API key. Please select a valid key to continue."
                : "تتطلب ميزات الذكاء الاصطناعي مفتاح API. يرجى تحديد مفتاح صالح للمتابعة."}
            </p>
          </div>
          <button
            onClick={handleOpenKeySelector}
            className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Key className="w-3 h-3" />
            {language === 'en' ? "Select Key" : "تحديد المفتاح"}
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className={isRtl ? 'text-right' : 'text-left'}>
              <h1 className="text-xl font-serif font-bold tracking-tight text-white">{t.title}</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400/80">{t.subtitle}</p>
            </div>
          </div>

          <div className="relative flex-grow max-w-md">
            <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-3 bg-white/5 backdrop-blur-md rounded-2xl text-sm border border-white/10 text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none ${isRtl ? 'pr-11 pl-12 text-right' : 'pl-11 pr-12 text-left'}`}
              id="search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors`}
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>

          <div className={`hidden lg:flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <nav className={`flex items-center gap-4 ${isRtl ? 'ml-2' : 'mr-2'}`}>
              <a href="#" className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white flex items-center gap-2 transition-colors">
                <LayoutGrid className="w-4 h-4" /> {t.library}
              </a>
            </nav>
            
            <button 
              onClick={handleShare}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 border ${
                copied 
                  ? 'bg-green-500/20 text-green-400 border-green-500/20' 
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
              id="share-btn"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
              {copied ? (language === 'en' ? 'Copied!' : 'تم النسخ!') : (language === 'en' ? 'Share' : 'مشاركة')}
            </button>

            <button 
              onClick={toggleLanguage}
              className="px-4 py-2.5 bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 border border-white/10"
              id="lang-toggle-btn"
            >
              <Languages className="w-4 h-4 text-indigo-400" />
              {language === 'en' ? 'العربية' : 'English'}
            </button>

            <button 
              onClick={() => setIsVoiceOpen(true)}
              className="px-5 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
              id="start-talking-btn"
            >
              <Mic className="w-4 h-4 text-indigo-400" /> {t.startTalking}
            </button>

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
              id="toggle-chat-btn"
            >
              <MessageSquare className="w-4 h-4" /> {t.aiAssistant}
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full flex gap-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Knowledge Grid */}
        <div className={`flex-grow transition-all duration-500 ${isChatOpen ? 'lg:w-2/3' : 'w-full'} ${isRtl ? 'text-right' : 'text-left'}`}>
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight text-white">
              {language === 'en' ? (
                <>Discover the <span className="italic text-indigo-400">Unseen</span> World</>
              ) : (
                <>اكتشف العالم <span className="italic text-indigo-400">الخفي</span></>
              )}
            </h2>
            <p className="text-gray-400 max-w-2xl leading-relaxed">
              {t.heroSubtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <button 
                onClick={handleShare}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 border border-white/10"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4 text-indigo-400" />}
                {copied ? (language === 'en' ? 'Link Copied' : 'تم نسخ الرابط') : (language === 'en' ? 'Copy App Link' : 'نسخ رابط التطبيق')}
              </button>
            </div>
          </div>

          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCards.map((card) => (
                  <KnowledgeCard 
                    key={card.id} 
                    card={card} 
                    onExplore={handleExplore}
                    onGenerateImage={handleGenerateVisual}
                    onGenerateVideo={handleGenerateVideo}
                    language={language}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium">{t.noResults} "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-indigo-400 font-bold text-sm hover:underline"
              >
                {t.clearSearch}
              </button>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <aside className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} w-full md:w-[400px] lg:relative lg:w-1/3 z-50 lg:z-0 p-4 lg:p-0`}>
              <div className="h-full">
                <AIChat 
                  selectedCard={selectedCard} 
                  onClose={() => setIsChatOpen(false)} 
                  language={language}
                />
              </div>
            </aside>
          )}
        </AnimatePresence>
      </main>

      {/* Voice Assistant Overlay */}
      <VoiceAssistant 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
      />

      {/* Visual Explorer Overlay */}
      {visualData && (
        <ImageGenerator
          isOpen={isVisualOpen}
          onClose={() => setIsVisualOpen(false)}
          prompt={visualData.prompt}
          title={visualData.title}
          language={language}
        />
      )}

      {/* Video Explorer Overlay */}
      {videoData && (
        <VideoGenerator
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          prompt={videoData.prompt}
          title={videoData.title}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="p-10 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-serif font-bold text-lg text-white">{t.title}</span>
          </div>
          
          <div className={`flex gap-10 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.resources}</h5>
              <ul className="text-sm space-y-2 font-medium text-gray-400">
                <li><a href="https://ai.google.dev/gemini-api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">API Reference</a></li>
              </ul>
            </div>
            <div className={`space-y-3 ${isRtl ? 'text-right' : 'text-left'}`}>
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.connect}</h5>
              <ul className="text-sm space-y-2 font-medium text-gray-400">
                <li><button onClick={handleShare} className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> {language === 'en' ? 'Share App' : 'مشاركة التطبيق'}
                </button></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className={isRtl ? 'text-left' : 'text-right'}>
            <p className="text-xs text-gray-500 font-medium">{t.poweredBy}</p>
            <div className={`flex items-center gap-1 mt-1 ${isRtl ? 'justify-start' : 'justify-end'}`}>
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-indigo-400">{t.intelligenceEnhanced}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
