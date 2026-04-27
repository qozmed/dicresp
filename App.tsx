import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import ProjectsGallery from './components/ProjectsGallery';
import CosmicMap from './components/CosmicMap';
import ContactFooter from './components/ContactFooter';
import MoscowProjectsModal from './components/MoscowProjectsModal';
import {  
  NetworkBackground, 
  VortexBackground,
  TopographicBackground
} from './components/AnimatedBackgrounds';
import { Project } from './types';
import { PROJECTS } from './constants';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [mapProject, setMapProject] = useState<Project | null>(null); // For Full Screen Map
  const [isMoscowModalOpen, setIsMoscowModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>('home');
  
  const mainRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const isNavigatingRef = useRef(false);

  // -- HANDLERS --

  // Direct Map Access (Replaces Modal)
  const handleSelectProject = (project: Project) => {
    if (project.id === 'p2') {
      setIsMoscowModalOpen(true);
      return;
    }
    setMapProject(project);
  };

  const handleMoscowSelect = (project: Project) => {
    setIsMoscowModalOpen(false);
    setMapProject(project);
  };

  const handleCloseMap = () => {
    setMapProject(null);
  };

  // Logo Click
  const handleLogoClick = () => {
    // If in map mode, close it first
    if (mapProject) {
        setMapProject(null);
    }

    isNavigatingRef.current = true;

    const scrollContainer = mainRef.current;

    if (overlayRef.current) {
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.transition = 'opacity 0.3s ease-in';
    }

    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setTimeout(() => {
        isNavigatingRef.current = false;
        if (overlayRef.current && mainRef.current) {
             overlayRef.current.style.transition = 'opacity 0.8s ease-out';
             overlayRef.current.style.opacity = '0';
        }
    }, 1200);
  };

  // -- SCROLL EFFECT --
  useEffect(() => {
    const container = mainRef.current;
    const overlay = overlayRef.current;
    
    if (!container || !overlay) return;

    let lastScrollTop = 0;
    let isScrolling = false;

    const handleScroll = () => {
        if (isNavigatingRef.current) return;
        
        const currentScrollTop = container.scrollTop;
        const scrollDelta = Math.abs(currentScrollTop - lastScrollTop);
        
        // Only trigger fade on significant scroll (page transitions)
        if (scrollDelta > 10 && !isScrolling) {
            isScrolling = true;
            
            // Smooth dark fade with transition
            overlay.style.transition = 'opacity 0.2s ease-in-out';
            overlay.style.opacity = '1';
            
            // Clear fade after longer duration
            setTimeout(() => {
                overlay.style.transition = 'opacity 0.3s ease-out';
                overlay.style.opacity = '0';
                isScrolling = false;
            }, 600);
        }
        
        lastScrollTop = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll, { passive: true } as AddEventListenerOptions);
    handleScroll();

    return () => {
        container.removeEventListener('scroll', handleScroll as EventListener);
    };
  }, []);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;

    const sections = Array.from(container.querySelectorAll('.snap-section')) as HTMLElement[];
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          if (!id) continue;
          if (!best || entry.intersectionRatio > best.ratio) {
            best = { id, ratio: entry.intersectionRatio };
          }
        }
        if (best) setActiveSectionId(best.id);
      },
      {
        root: container,
        threshold: [0.25, 0.4, 0.55, 0.7],
      }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative text-white h-screen w-screen overflow-hidden bg-[#050508]">
      
      {/* Navigation - Always visible unless strictly hidden, but works fine on top of map too */}
      {!mapProject && (
        <Navigation onLogoClick={handleLogoClick} activeSectionId={activeSectionId} />
      )}
      
      {/* Scroll Transition Darkening Overlay */}
      {!mapProject && (
        <div 
            ref={overlayRef}
            className="fixed inset-0 pointer-events-none z-[60] bg-black will-change-opacity"
            style={{ opacity: 0 }}
        />
      )}

      {/* MAIN VIEW: Scroll Snap Container */}
      {/* We hide this container if Map is active to save performance/visuals */}
      <main 
        ref={mainRef} 
        className={`snap-container bg-transparent relative z-10 transition-opacity duration-500 ${mapProject ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        
        {/* Section 1: Hero */}
        <div className="snap-section relative" id="home">
          <div
            className="absolute inset-0 pointer-events-none z-0 bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: "url('/images/pole.webp')", filter: 'brightness(0.88) saturate(0.95)' }}
          />
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none z-[5] h-[78vh]"
            style={{
              background: 'linear-gradient(to top, rgba(5, 5, 8, 1) 0%, rgba(5, 5, 8, 0.85) 25%, rgba(5, 5, 8, 0) 100%)',
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-10 opacity-60">
            <TopographicBackground />
          </div>
          <div className="relative z-20">
            <Hero />
          </div>
        </div>

        {/* Section 2: Philosophy */}
        <div className="snap-section" id="philosophy">
           <NetworkBackground />
           <Philosophy />
        </div>

        {/* Section 3: Projects (Map access point) */}
        <div className="snap-section" id="projects">
           <ProjectsGallery 
              onSelectProject={handleSelectProject} 
              onOpenMap={handleSelectProject}
           />
        </div>
        
        {/* Section 4: Contact */}
        <div className="snap-section" id="contact">
           <VortexBackground />
           <ContactFooter />
        </div>

      </main>

      <MoscowProjectsModal
        isOpen={isMoscowModalOpen}
        projects={PROJECTS.filter((p) => p.id === 'p2' || p.id === 'p2k' || p.id === 'p3k')}
        onClose={() => setIsMoscowModalOpen(false)}
        onSelect={handleMoscowSelect}
      />

      {/* FULL SCREEN MAP OVERLAY */}
      <AnimatePresence>
        {mapProject && (
            <CosmicMap project={mapProject} onBack={handleCloseMap} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;