import React from 'react';
import { motion } from 'motion/react';
import { InfoCard } from '../constants';
import { Sparkles, Tag, Image as ImageIcon, Video } from 'lucide-react';
import { Language, translations } from '../i18n';

interface KnowledgeCardProps {
  card: InfoCard;
  onExplore: (card: InfoCard) => void;
  onGenerateImage: (card: InfoCard) => void;
  onGenerateVideo: (card: InfoCard) => void;
  language: Language;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ card, onExplore, onGenerateImage, onGenerateVideo, language }) => {
  const t = translations[language];
  const isRtl = language === 'ar';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass p-6 rounded-2xl shadow-xl flex flex-col h-full group ${isRtl ? 'text-right' : 'text-left'}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      id={`card-${card.id}`}
    >
      <div className={`flex justify-between items-start mb-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
          {card.category[language]}
        </span>
        <Sparkles className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
      </div>
      
      <h3 className="text-xl font-serif font-bold mb-3 text-white leading-tight">
        {card.title[language]}
      </h3>
      
      <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
        {card.content[language]}
      </p>
      
      <div className={`flex flex-wrap gap-2 mb-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
        {card.tags[language].map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onExplore(card)}
          className="flex-grow py-3 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          id={`explore-btn-${card.id}`}
        >
          {t.askAi}
        </button>
        <button
          onClick={() => onGenerateImage(card)}
          className="p-3 bg-white/5 text-indigo-400 rounded-xl hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center"
          title={t.generateVisual}
          id={`visual-btn-${card.id}`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => onGenerateVideo(card)}
          className="p-3 bg-white/5 text-indigo-400 rounded-xl hover:bg-white/10 border border-white/10 transition-all active:scale-[0.98] flex items-center justify-center"
          title={t.generateVideo}
          id={`video-btn-${card.id}`}
        >
          <Video className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
