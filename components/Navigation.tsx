import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  onLogoClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onLogoClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
        const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;

        // Mobile: scroll inside the snap container (body is locked)
        if (window.innerWidth < 768 && scrollContainer) {
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const elementTop = (element as HTMLElement).getBoundingClientRect().top;
            const targetTop = scrollContainer.scrollTop + (elementTop - containerTop);
            scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
        } else {
            // Desktop: normal behavior (scroll container + snap)
            (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    }
  };

  const handleLogoClickInternal = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onLogoClick) {
        onLogoClick();
    } else {
        handleSmoothScroll(e, '#home');
    }
    setIsMenuOpen(false);
  }

  const navLinks = [
    { name: 'Главная', href: '#home' },
    { name: 'Философия', href: '#philosophy' },
    { name: 'Проекты', href: '#projects' },
    // Map link removed
  ];

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 py-3 md:py-6 bg-transparent transition-all duration-300 pointer-events-none sm:bg-transparent lg:bg-transparent"
    >
      <div className="container mx-auto px-3 md:px-6 flex justify-between items-center pointer-events-auto">
        {/* Logo Replaced with Image */}
        <a 
          href="#home" 
          onClick={handleLogoClickInternal}
          className="group cursor-pointer relative z-50"
        >
          <img 
            src="https://i.ibb.co/5xSX5FnV/LOGO-DCS.png" 
            alt="Logo" 
            className="h-8 md:h-12 w-auto object-contain drop-shadow-[0_0_8px_rgba(0,247,255,0.5)] brightness-0 invert hover:brightness-100 hover:invert-0 hover:drop-shadow-[0_0_12px_rgba(0,247,255,0.8)] transition-all duration-300"
          />
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex space-x-8 xl:space-x-12">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-base lg:text-lg xl:text-xl uppercase tracking-widest text-gray-300 hover:text-[#00F7FF] transition-colors relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#00F7FF] transition-all group-hover:w-full"></span>
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white relative z-50 p-2 touch-manipulation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <Menu size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden fixed top-0 left-0 w-full h-full bg-[#050508]/95 backdrop-blur-lg p-6 flex flex-col justify-center items-center space-y-6 z-40 pointer-events-auto overflow-hidden"
          >
            <button
              className="absolute top-4 right-4 text-white p-2 touch-manipulation"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
              style={{ display: 'none' }}
            >
              <X size={32} />
            </button>
            
            <div className="flex flex-col items-center space-y-8 w-full">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-2xl lg:text-3xl text-white hover:text-[#00F7FF] uppercase tracking-widest text-center font-display transition-colors touch-manipulation"
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleSmoothScroll(e, link.href)}
                >
                  {link.name}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;