import React, { useState, useEffect, useRef } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Philosophy from './components/Philosophy';
import ProjectsGallery from './components/ProjectsGallery';
import CosmicMap from './components/CosmicMap';
import ContactFooter from './components/ContactFooter';
import { 
  OrbitalBackground, 
  NetworkBackground, 
  VortexBackground 
} from './components/AnimatedBackgrounds';
import { Project } from './types';
import { AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [mapProject, setMapProject] = useState<Project | null>(null); // For Full Screen Map
  
  const mainRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const isNavigatingRef = useRef(false);

  // -- HANDLERS --

  // Direct Map Access (Replaces Modal)
  const handleSelectProject = (project: Project) => {
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

  return (
    <div className="relative text-white h-screen w-screen overflow-hidden bg-[#050508]">
      
      {/* Navigation - Always visible unless strictly hidden, but works fine on top of map too */}
      <Navigation onLogoClick={handleLogoClick} />
      
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
        <div className="snap-section" id="home">
          <OrbitalBackground />
          <Hero />
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