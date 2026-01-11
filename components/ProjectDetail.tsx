import React, { useState } from 'react';
import { Project } from '../types';
import { 
  X, CheckCircle, Clock, Calendar, MapPin, 
  ChevronLeft, ChevronRight, 
  Maximize2, ZoomIn, ZoomOut, Map
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onOpenMap: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, onOpenMap }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  // Combine main image + gallery for the carousel
  const images = project.gallery && project.gallery.length > 0 
    ? project.gallery 
    : [project.image];

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const toggleLightbox = () => {
    setIsLightboxOpen(!isLightboxOpen);
    setLightboxZoom(1); // Reset zoom on open/close
  };

  const handleZoom = (e: React.MouseEvent, delta: number) => {
    e.stopPropagation();
    setLightboxZoom(prev => Math.min(Math.max(1, prev + delta), 3));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 lg:p-12">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          onClick={onClose}
        ></motion.div>
        
        {/* Modal Card Structure */}
        <motion.div 
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full md:h-[90vh] md:max-w-7xl bg-[#0F1014] flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.8)] md:rounded-[30px] border-t md:border border-white/5 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* Close Button (Global) */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-8 h-8 md:w-10 md:h-10 bg-black/50 hover:bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10 group backdrop-blur-md"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* LEFT SIDE: Carousel & Visuals */}
          <div className="w-full md:w-[55%] h-[35vh] md:h-full relative group bg-black shrink-0">
            
            {/* Main Image */}
            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
                <img 
                    src={images[currentImageIndex]} 
                    alt={`${project.title} view ${currentImageIndex + 1}`} 
                    className="w-full h-full object-cover opacity-90"
                />
            </motion.div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1014] via-transparent to-transparent opacity-100 md:opacity-60"></div>
            
            {/* Carousel Controls */}
            {images.length > 1 && (
                <>
                    <button onClick={prevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-cyan-500/80 text-white transition-all backdrop-blur-sm opacity-100 md:opacity-0 group-hover:opacity-100">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-cyan-500/80 text-white transition-all backdrop-blur-sm opacity-100 md:opacity-0 group-hover:opacity-100">
                        <ChevronRight size={20} />
                    </button>
                    
                    {/* Dots */}
                    <div className="absolute bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
                        {images.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 md:w-6 bg-cyan-400' : 'w-1.5 md:w-2 bg-white/30 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Lightbox Trigger */}
            <button 
                onClick={toggleLightbox}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/30 hover:bg-white/20 text-white/70 hover:text-cyan-400 transition-all backdrop-blur-md z-30"
            >
                <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Title Block (Positioned absolutely on image for visual impact) */}
            <div className="absolute bottom-6 md:bottom-20 left-4 md:left-10 z-20 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div 
                        className="pointer-events-auto inline-flex items-center text-cyan-400 font-mono text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-1 md:mb-2 drop-shadow-md cursor-pointer hover:text-white transition-colors group/map"
                        onClick={() => onOpenMap(project)}
                    >
                        <MapPin size={10} className="mr-1 md:mr-2" />
                        {project.region}
                        <span className="ml-2 text-[8px] bg-cyan-900/50 px-1 rounded border border-cyan-500/30 opacity-0 group-hover/map:opacity-100 transition-opacity">MAP VIEW</span>
                    </div>
                    <h2 className="text-2xl md:text-5xl lg:text-7xl font-display font-normal text-white tracking-tighter leading-[0.9] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                        {project.title}
                    </h2>
                </motion.div>
            </div>
          </div>

          {/* RIGHT SIDE: Info & Controls */}
          <div className="w-full md:w-[45%] flex flex-col bg-[#0F1014] relative h-[65vh] md:h-full">
            
            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 lg:p-12 relative z-10 pb-28 md:pb-12">
              
              {/* Header Tags */}
              <div className="flex flex-wrap gap-2 mb-6 md:mb-8 items-center">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1A1B21] rounded-full border border-white/5">
                    {project.status === 'completed' ? <CheckCircle size={12} className="text-emerald-500"/> : <Clock size={12} className="text-amber-500"/>}
                    <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-gray-200">
                      {project.status === 'completed' ? 'Реализован' : project.status === 'in-progress' ? 'В процессе' : 'Планируется'}
                    </span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-[#1A1B21] rounded-full border border-white/5">
                    <Calendar size={12} className="text-cyan-500"/>
                    <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-gray-200">2024-2025</span>
                </div>
                
                {/* NEW MAP BUTTON IN CONTENT */}
                <button 
                  onClick={() => onOpenMap(project)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-900/20 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 rounded-full transition-all group"
                >
                  <Map size={12} className="text-cyan-400 group-hover:text-white" />
                  <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-cyan-400 group-hover:text-white">
                    На карте
                  </span>
                </button>
              </div>

              {/* Description - Increased readability */}
              <div className="relative pl-4 md:pl-6 mb-8 md:mb-10 border-l-2 border-cyan-500/30">
                 <p className="text-gray-300 text-sm md:text-lg leading-relaxed font-normal">
                  {project.description}
                 </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8 md:mb-10">
                {[
                  { label: 'Площадь', val: project.stats.area },
                  { label: 'Юнитов', val: project.stats.units },
                  { label: 'Готовность', val: `${project.stats.completion}%` }
                ].map((item, i) => (
                  <div key={i} className="aspect-[4/3] bg-[#1A1B21] rounded-xl flex flex-col items-center justify-center border border-white/5 hover:border-cyan-500/30 transition-colors group p-2">
                    <div className="text-sm md:text-xl font-display font-bold text-white mb-1 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{item.val}</div>
                    <div className="text-[8px] md:text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Ecosystem Features */}
              <div className="mb-24 md:mb-8">
                <h3 className="flex items-center text-xs font-mono font-bold text-cyan-500 uppercase tracking-widest mb-4">
                  <span className="w-6 h-[1px] bg-cyan-500 mr-2"></span>
                  Технологии
                </h3>
                
                <div className="grid grid-cols-1 gap-2 md:gap-3">
                  {project.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-colors border border-transparent hover:border-cyan-900/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-3 shadow-[0_0_8px_rgba(0,247,255,0.6)]"></div>
                      <span className="text-gray-200 text-xs md:text-sm font-normal">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fixed CTA Button Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 bg-gradient-to-t from-[#0F1014] via-[#0F1014] to-transparent z-20">
                <button className="w-full group relative py-4 bg-gradient-to-r from-[#0066FF] to-[#00F7FF] rounded-lg shadow-[0_0_20px_rgba(0,102,255,0.2)] hover:shadow-[0_0_35px_rgba(0,247,255,0.4)] transition-all duration-500 overflow-hidden min-h-[50px]">
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                   <span className="relative z-10 flex items-center justify-center font-mono font-bold text-white tracking-[0.15em] uppercase text-xs md:text-sm">
                      Запросить презентацию
                   </span>
                </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lightbox / Fullscreen Zoom Mode */}
      {isLightboxOpen && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col justify-center items-center"
            onClick={(e) => { e.stopPropagation(); toggleLightbox(); }}
        >
            {/* Toolbar */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent" onClick={e => e.stopPropagation()}>
                <div className="text-white/70 font-mono text-xs font-bold">
                    {currentImageIndex + 1} / {images.length}
                </div>
                <div className="flex space-x-4">
                    <button onClick={(e) => handleZoom(e, 0.5)} className="p-2 bg-white/10 rounded-full hover:bg-cyan-500/20 text-white"><ZoomIn size={20} /></button>
                    <button onClick={(e) => handleZoom(e, -0.5)} className="p-2 bg-white/10 rounded-full hover:bg-cyan-500/20 text-white"><ZoomOut size={20} /></button>
                    <button onClick={toggleLightbox} className="p-2 bg-white/10 rounded-full hover:bg-red-500/20 text-white"><X size={20} /></button>
                </div>
            </div>

            {/* Image Container with Zoom */}
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <motion.img 
                    src={images[currentImageIndex]} 
                    alt="Fullscreen view"
                    className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
                    style={{ scale: lightboxZoom }}
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                />
            </div>

            {/* Nav Arrows */}
            <button 
                onClick={(e) => { e.stopPropagation(); prevImage(e); }} 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-cyan-400 transition-colors"
            >
                <ChevronLeft size={40} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); nextImage(e); }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-cyan-400 transition-colors"
            >
                <ChevronRight size={40} />
            </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectDetail;