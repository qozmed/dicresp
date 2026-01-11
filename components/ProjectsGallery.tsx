import React from 'react';
import { PROJECTS } from '../constants';
import { Project } from '../types';
import { ArrowUpRight, CornerRightDown, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { DigitalCityBackground } from './AnimatedBackgrounds';

interface ProjectsGalleryProps {
  onSelectProject: (project: Project) => void;
  onOpenMap: (project: Project) => void;
}

const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ onSelectProject, onOpenMap }) => {
  // Sort projects by order before rendering
  const sortedProjects = [...PROJECTS].sort((a, b) => a.order - b.order);
  return (
    <section className="relative w-full h-full flex flex-col justify-start md:justify-center py-5 sm:py-8 md:py-16 lg:py-20 overflow-hidden bg-[#050508] sm:bg-transparent md:bg-transparent lg:bg-transparent">
      
      {/* Animated Matrix/Data Background */}
      <DigitalCityBackground />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 h-full flex flex-col justify-start md:justify-center relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-4 sm:mb-6 md:mb-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
             <div className="flex items-center space-x-2 text-cyan-500 mb-1 md:mb-2 font-mono text-xs sm:text-sm md:text-base">
                <CornerRightDown size={14} />
                <span>ПРОЕКТЫ</span>
             </div>
            <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-display text-white uppercase tracking-wide">
                Наши <span className="inline-block pt-[1px] pb-[3px] leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Территории</span>
            </h2>
          </motion.div>
          
          <div className="hidden lg:block text-right mt-4 lg:mt-0">
             <p className="text-gray-400 font-mono text-sm max-w-xs mb-2 bg-black/50 p-2 rounded backdrop-blur-sm border-l border-cyan-500">
                 Каждый проект — это отдельная вселенная с уникальной философией.
             </p>
          </div>
        </div>

        {/* Mobile: Static grid (no carousel) */}
        <div className="sm:hidden grid grid-cols-3 gap-2 px-2 py-3">
          {sortedProjects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative h-[60vh] bg-[#0A0A0F] cursor-pointer overflow-hidden border border-white/10 transition-all duration-500 rounded-sm touch-manipulation"
            >
              {/* Click handler for Main Details (Whole Card) */}
              <div className="absolute inset-0 z-20" onClick={() => onSelectProject(project)}></div>

              {/* Image Layer */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>

              {/* Holographic Border Effect on Hover */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
              </div>

              {/* Holographic Shimmer Overlay */}
              <div className="holo-overlay"></div>

              {/* Content Overlay */}
              <div className="absolute inset-0 p-1.5 z-40 flex flex-col justify-between pointer-events-none">
                
                {/* Top Info */}
                <div className="flex justify-between items-start opacity-100 transition-opacity">
                    <span className="font-mono text-[7px] text-cyan-400 border border-cyan-500/30 px-0.5 py-0.5 rounded bg-black/80 backdrop-blur-md shadow-lg">
                        {project.id.toUpperCase()} <span className="text-gray-500 mx-1">/</span> 00{index+1}
                    </span>
                    <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center bg-black/60 backdrop-blur-md group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all duration-300">
                        <ArrowUpRight size={6} />
                    </div>
                </div>

                {/* Bottom Info */}
                <div className="transform translate-y-0 md:translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-auto">
                    <p className="text-cyan-400 font-mono text-[7px] mb-0.5 tracking-widest uppercase">{project.region}</p>
                    <h3 className="text-sm font-display text-white mb-0.5 leading-none group-hover:text-cyan-200 transition-all">
                        {project.title}
                    </h3>
                    
                    {/* Hover Details with MAP BUTTON */}
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 block">
                        <div className="pt-0.5 border-t border-white/20 bg-black/80 backdrop-blur-md p-0.5 rounded">
                            <div className="grid grid-cols-2 gap-0.5 text-[7px] font-mono text-gray-300 mb-0.5">
                                <div>
                                    <span className="block text-gray-500 uppercase text-[6px]">Площадь</span>
                                    <span className="text-white text-[7px]">{project.stats.area}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[6px]">Статус</span>
                                    <span className={`text-[7px] ${project.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {project.status === 'completed' ? 'ГОТОВ' : 'В РАБОТЕ'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* GO TO MAP BUTTON */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent opening detail modal
                                    onOpenMap(project);
                                }}
                                className="w-full flex items-center justify-center space-x-0.5 py-0.5 bg-cyan-900/40 hover:bg-cyan-500/80 border border-cyan-500/50 text-cyan-400 hover:text-white transition-all rounded text-[6px] font-mono font-bold uppercase tracking-widest touch-manipulation"
                            >
                                <Map size={4} />
                                <span className="text-[7px]">Перейти к карте</span>
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop/tablet grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {sortedProjects.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative h-[320px] md:h-[400px] lg:h-[450px] bg-[#0A0A0F] cursor-pointer overflow-hidden border border-white/10 hover:border-cyan-400/60 transition-all duration-500 rounded-sm hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(0,247,255,0.15)] hover:scale-[1.02] touch-manipulation"
            >
              <div className="absolute inset-0 z-20" onClick={() => onSelectProject(project)}></div>

              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent opacity-100 group-hover:opacity-80 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
              </div>

              <div className="absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
                  <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-500 to-transparent"></div>
              </div>

              <div className="holo-overlay"></div>

              <div className="absolute inset-0 p-4 md:p-6 z-40 flex flex-col justify-between pointer-events-none">
                <div className="flex justify-between items-start opacity-100 transition-opacity">
                    <span className="font-mono text-[10px] md:text-xs text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded bg-black/80 backdrop-blur-md shadow-lg">
                        {project.id.toUpperCase()} <span className="text-gray-500 mx-1">/</span> 00{index+1}
                    </span>
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/60 backdrop-blur-md group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-500 transition-all duration-300">
                        <ArrowUpRight size={16} />
                    </div>
                </div>

                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 pointer-events-auto">
                    <p className="text-cyan-400 font-mono text-[10px] md:text-xs mb-2 tracking-widest uppercase">{project.region}</p>
                    <h3 className="text-xl md:text-2xl font-display text-white mb-4 leading-none group-hover:text-cyan-200 transition-all">
                        {project.title}
                    </h3>
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 block">
                        <div className="pt-4 border-t border-white/20 bg-black/80 backdrop-blur-md p-2 rounded">
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-300 mb-3">
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px]">Площадь</span>
                                    <span className="text-white text-sm">{project.stats.area}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px]">Статус</span>
                                    <span className={`text-sm ${project.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {project.status === 'completed' ? 'ГОТОВ' : 'В РАБОТЕ'}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenMap(project);
                                }}
                                className="w-full flex items-center justify-center space-x-2 py-2 bg-cyan-900/40 hover:bg-cyan-500/80 border border-cyan-500/50 text-cyan-400 hover:text-white transition-all rounded text-xs font-mono font-bold uppercase tracking-widest touch-manipulation"
                            >
                                <Map size={4} />
                                <span>Перейти к карте</span>
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsGallery;