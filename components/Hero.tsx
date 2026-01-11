import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullText = 'Развиваем территории с умом!';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setIsTyping(false); // Скрываем курсор после завершения печати
      }
      if (index === fullText.length) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.getElementById('philosophy');
    if (nextSection) {
      const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;

      // Mobile: scroll inside the snap container (body is locked)
      if (window.innerWidth < 768 && scrollContainer) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = nextSection.getBoundingClientRect().top;
        const targetTop = scrollContainer.scrollTop + (elementTop - containerTop);
        scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative w-full h-full min-h-[100vh] flex items-center justify-center overflow-hidden pointer-events-none">
      {/* Content Container */}
      <div className="relative z-20 text-center px-4 sm:px-6 max-w-4xl pointer-events-auto mt-0 md:mt-0 -translate-y-8 sm:-translate-y-10 md:-translate-y-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          viewport={{ once: false }}
        >
          
          <h1 className="font-edit-undo uppercase text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4 tracking-normal md:tracking-wide leading-relaxed text-center">
            <span className="block text-white mb-1 md:mb-2">DIGITAL</span>
            <span className="block inline-block pt-[1px] pb-[2px] leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glow-text">
              CREATIVE
            </span>
            <span className="block text-white">SPACE</span>
          </h1>

          <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl text-cyan-200 mb-4 md:mb-6 lg:mb-8 tracking-[0.05em] md:tracking-[0.1em] lg:tracking-[0.15em] font-display uppercase max-w-[95vw] mx-auto text-center">
             Цифровое Креативное Пространство
          </h2>
        </motion.div>

        <div className="h-4 sm:h-6 md:h-8 lg:h-12 mt-1 md:mt-3 lg:mt-6 flex justify-center">
          <p className={`text-xs md:text-2xl text-gray-100 tracking-[0.1em] md:tracking-[0.2em] font-sans pr-2 border-r-2 ${isTyping ? 'border-cyan-400' : 'border-transparent'}`}>
            {text}
          </p>
        </div>
      </div>

      <div className="absolute bottom-24 sm:bottom-20 md:bottom-13 lg:bottom-12. left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <motion.div 
          className="flex flex-col items-center cursor-pointer group touch-manipulation"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={handleScrollDown}
        >
          <span className="text-[10px] sm:text-[12px] md:text-sm lg:text-base font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] mb-4 text-cyan-500/80 group-hover:text-cyan-400 transition-colors text-center whitespace-nowrap">2025</span>
          <ChevronDown className="text-cyan-400" size={24} />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;