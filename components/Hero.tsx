import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePos({
        x: Math.max(-1, Math.min(1, x)) * 15,
        y: Math.max(-1, Math.min(1, y)) * 15
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.getElementById('philosophy');
    if (nextSection) {
      const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;
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

  const brandName = ['D', 'I', 'G', 'I', 'T', 'A', 'L'];
  const brandName2 = ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'];
  const brandName3 = ['S', 'P', 'A', 'C', 'E'];

  const letterVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -90 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        delay: 0.2 + i * 0.06,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const lineVariants = {
    hidden: { scaleX: 0 },
    visible: (i: number) => ({
      scaleX: 1,
      transition: {
        duration: 0.6,
        delay: 0.8 + i * 0.1,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };

  return (
    <section className="relative w-full h-full min-h-[100vh] flex items-center justify-center overflow-hidden pointer-events-none">
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pointer-events-auto">
        <div className="h-full min-h-[100vh] relative flex items-center">
          {/* Main 3-column layout */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center py-16 lg:py-0">
            
            {/* Left Column: Logo Text Only */}
            <motion.div 
              className="lg:col-span-3 flex flex-col items-center lg:items-start lg:-ml-8 text-center lg:text-left order-2 lg:order-2"
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Brand Name - DIGITAL */}
              <div className="mb-2">
                <div className="flex justify-center lg:justify-start flex-wrap">
                  {brandName.map((letter, i) => (
                    <motion.span
                      key={`d1-${i}`}
                      custom={i}
                      variants={letterVariants}
                      className="font-edit-undo text-base sm:text-lg md:text-xl lg:text-5xl text-white inline-block leading-none tracking-wider"
                      style={{
                        textShadow: '0 0 20px rgba(0, 247, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Brand Name - CREATIVE with animated gradient */}
              <div className="mb-2">
                <div className="flex justify-center lg:justify-start flex-wrap">
                  {brandName2.map((letter, i) => (
                    <motion.span
                      key={`d2-${i}`}
                      custom={i + 7}
                      variants={letterVariants}
                      className="font-edit-undo text-base sm:text-lg md:text-xl lg:text-6xl inline-block leading-none tracking-wider animate-gradient-text"
                      style={{
                        background: 'linear-gradient(90deg, #00F7FF, #0066FF, #00F7FF, #0066FF, #00F7FF)',
                        backgroundSize: '400% 100%',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Brand Name - SPACE */}
              <div className="mb-0">
                <div className="flex justify-center lg:justify-start flex-wrap">
                  {brandName3.map((letter, i) => (
                    <motion.span
                      key={`d3-${i}`}
                      custom={i + 15}
                      variants={letterVariants}
                      className="font-edit-undo text-base sm:text-lg md:text-xl lg:text-5xl text-white inline-block leading-none tracking-wider"
                      style={{
                        textShadow: '0 0 20px rgba(0, 247, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Center Column: Your Logo */}
            <motion.div 
              ref={logoRef}
              className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2 py-8 lg:py-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              <motion.div
                animate={{
                  rotateX: -mousePos.y,
                  rotateY: mousePos.x,
                }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 20
                }}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                <motion.img
                  src="/images/logo.png"
                  alt="Digital Creative Space"
                  className="w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[260px] lg:h-[260px] object-contain brightness-0 invert"
                  style={{
                    filter: 'brightness(0) invert(1) drop-shadow(0 0 40px rgba(0, 247, 255, 0.4)) drop-shadow(0 0 80px rgba(0, 102, 255, 0.3))',
                  }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                />
              </motion.div>
            </motion.div>

            {/* Right Column: Description */}
            <motion.div 
              className="lg:col-span-3 flex flex-col items-center lg:items-end text-center lg:text-right order-3"
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Title */}
              <motion.h2
                custom={1.4}
                variants={fadeInUp}
                className="font-tech text-base sm:text-lg lg:text-xl text-white mb-3 lg:mb-4 leading-tight"
                style={{ textShadow: '0 0 15px rgba(0, 247, 255, 0.3)' }}
              >
                Цифровое Креативное<br />Пространство
              </motion.h2>

              {/* Decorative line */}
              <motion.div
                custom={1}
                variants={lineVariants}
                className="hidden lg:block w-16 h-[1px] bg-gradient-to-l from-[#00F7FF] to-transparent mb-6 origin-right"
              />

              {/* Description text */}
              <motion.p
                custom={1.6}
                variants={fadeInUp}
                className="font-lcd text-xs sm:text-sm lg:text-base text-white/70 leading-relaxed max-w-xs lg:max-w-sm mb-3"
              >
                экспертная цифровая платформа по продвижению земельных активов и девелоперских решений.
              </motion.p>

              <motion.p
                custom={1.8}
                variants={fadeInUp}
                className="font-lcd text-xs sm:text-sm lg:text-base text-white/70 leading-relaxed max-w-xs lg:max-w-sm mb-3"
              >
                Мы объединяем технологии визуализации, маркетинга и аналитики, чтобы помочь собственникам эффективно представить свои участки инвесторам и покупателям.
              </motion.p>

              {/* Tech specs / Features */}
              <motion.div
                custom={2.0}
                variants={fadeInUp}
                className="mt-4 lg:mt-6 space-y-2"
              >
                {['Визуализация', 'Маркетинг', 'Аналитика'].map((feature, i) => (
                  <motion.div
                    key={feature}
                    className="flex items-center justify-center lg:justify-end space-x-2 text-xs sm:text-sm font-mono text-[#00F7FF]/80"
                    initial={{ opacity: 0, x: 20 }}
                    animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ delay: 2.2 + i * 0.15, duration: 0.5 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F7FF] animate-pulse" />
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            className="absolute bottom-8 sm:bottom-12 left-0 right-0 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            {/* Bottom text */}
            <motion.p
              className="font-tech text-lg sm:text-xl md:text-3xl text-white/80 tracking-[0.2em] mb-16"
              style={{ textShadow: '0 0 15px rgba(0, 247, 255, 0.4)' }}
            >
              Цифровое креативное пространство
            </motion.p>

            {/* Year badge */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <span className="font-lcd text-2xl sm:text-1xl md:text-2xl text-[#00F7FF] tracking-wider"
                style={{ textShadow: '0 0 20px rgba(0, 247, 255, 0.6)' }}
              >
                2026
              </span>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              className="mt-6 cursor-pointer pointer-events-auto"
              onClick={handleScrollDown}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="text-[#00F7FF]/60"
              >
                <path
                  d="M12 5V19M12 19L5 12M12 19L19 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;