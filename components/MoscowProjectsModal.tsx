import React, { useEffect } from 'react';
import { Project } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, ArrowUpRight } from 'lucide-react';

interface MoscowProjectsModalProps {
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
  onSelect: (project: Project) => void;
}

const MoscowProjectsModal: React.FC<MoscowProjectsModalProps> = ({
  isOpen,
  projects,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full h-[88vh] md:h-auto md:max-w-5xl bg-[#0F1014] shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-[30px] border-t md:border border-white/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 group backdrop-blur-md"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="p-5 sm:p-6 md:p-10 lg:p-12 h-full overflow-y-auto custom-scrollbar">
              <div className="mb-6 md:mb-8">
                <div className="flex items-center space-x-2 text-cyan-500 mb-2 font-mono text-xs md:text-sm">
                  <MapPin size={14} />
                  <span>МОСКОВСКАЯ ОБЛАСТЬ</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-display text-white uppercase tracking-wide">
                  Выберите <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">проект</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-4">
                {projects.map((project) => {
                  const selectorTitle = project.selectorTitle ?? project.title;
                  const selectorSubtitle = project.selectorSubtitle ?? project.region;
                  const selectorDescription = project.selectorDescription ?? project.description;

                  return (
                  <button
                    key={project.id}
                    onClick={() => onSelect(project)}
                    className="group relative text-left overflow-hidden rounded-2xl border border-white/10 hover:border-cyan-400/60 bg-[#0A0A0F] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,247,255,0.12)] touch-manipulation"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={project.image}
                        alt={selectorTitle}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'data:image/svg+xml;charset=utf-8,' +
                            encodeURIComponent(
                              '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#050508"/><stop offset="1" stop-color="#0A0A0F"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#00F7FF" font-family="monospace" font-size="28">IMAGE UNAVAILABLE</text></svg>'
                            );
                        }}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1014] via-[#0F1014]/50 to-transparent"></div>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                      <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                      <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                    </div>

                    <div className="holo-overlay"></div>

                    <div className="relative p-5 md:p-7 min-h-[220px] md:min-h-[260px] flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="font-mono text-[10px] md:text-xs text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded bg-black/70 backdrop-blur-md">
                          {project.id.toUpperCase()}
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur-md group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all duration-300">
                          <ArrowUpRight size={16} />
                        </div>
                      </div>

                      <div>
                        <p className="text-cyan-400 font-mono text-xs md:text-sm mb-2 tracking-widest uppercase">{selectorSubtitle}</p>
                        <h3 className="text-2xl md:text-3xl font-display text-white leading-none group-hover:text-cyan-200 transition-all">
                          {selectorTitle}
                        </h3>
                        <p className="mt-3 text-gray-300 text-xs md:text-sm leading-relaxed max-w-[48ch]">
                          {selectorDescription}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MoscowProjectsModal;
