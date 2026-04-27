import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const isTouchDevice = useRef(false);

  useEffect(() => {
    setMounted(true);
    isTouchDevice.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current || isTouchDevice.current) return;
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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      const scrollContainer = document.querySelector('.snap-container') as HTMLElement | null;

      if (window.innerWidth < 768 && scrollContainer) {
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const elementTop = (element as HTMLElement).getBoundingClientRect().top;
        const targetTop = scrollContainer.scrollTop + (elementTop - containerTop);
        scrollContainer.scrollTo({ top: targetTop, behavior: 'smooth' });
      } else {
        (element as HTMLElement).scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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

  const navLinks = [
    { name: 'Главная', href: '#home' },
    { name: 'Философия', href: '#philosophy' },
    { name: 'Проекты', href: '#projects' },
    { name: 'Контакты', href: '#contact' },
  ];

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
    <section className="relative w-full min-h-[100svh] flex flex-col overflow-hidden pointer-events-none pt-8 sm:pt-24 lg:pt-28 pb-4 sm:pb-8">
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pointer-events-auto">
        <div className="relative flex flex-col min-h-[calc(100svh-5rem)]">
          {/* Main 3-column layout */}
          <div className="w-full sm:flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 auto-rows-min sm:auto-rows-auto gap-2 sm:gap-8 lg:gap-6 items-start sm:items-center content-start sm:content-center py-0 sm:py-8 lg:py-0">
            
            {/* Left Column: Logo Text Only */}
            <motion.div 
              className="hidden sm:flex lg:col-span-3 flex-col items-center lg:items-start text-center lg:text-left order-1 lg:order-1"
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
                      className="font-edit-undo text-xl sm:text-2xl md:text-3xl lg:text-5xl text-white inline-block leading-none tracking-wider"
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
                      className="font-edit-undo text-2xl sm:text-3xl md:text-4xl lg:text-6xl inline-block leading-none tracking-wider animate-gradient-text"
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
                      className="font-edit-undo text-xl sm:text-2xl md:text-3xl lg:text-5xl text-white inline-block leading-none tracking-wider"
                      style={{
                        textShadow: '0 0 20px rgba(0, 247, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)',
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </div>
              </div>

              <div className="hidden lg:block mt-6 w-full max-w-[320px]">
                <div className="flex flex-col items-start gap-5">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="font-tech text-2xl uppercase tracking-widest text-white/90 hover:text-[#00F7FF] transition-colors text-left"
                      style={{ textShadow: '0 0 18px rgba(0, 247, 255, 0.25)' }}
                    >
                      {link.name}
                      <span className="block w-16 h-[1px] bg-gradient-to-l from-[#00F7FF] to-transparent mt-2 origin-right" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Center Column: Your Logo */}
            <motion.div 
              ref={logoRef}
              className="lg:col-span-6 flex items-center justify-center order-2 lg:order-2 py-0 sm:py-4 lg:py-0"
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
                <div
                  className="relative w-[clamp(170px,42vw,360px)] h-[clamp(170px,42vw,360px)] sm:w-[clamp(260px,50vw,560px)] sm:h-[clamp(260px,50vw,560px)] lg:w-[clamp(360px,30vw,520px)] lg:h-[clamp(360px,30vw,520px)]"
                  style={{ maxWidth: '42svh', maxHeight: '42svh' }}
                >
                  <motion.img
                    src="/images/logo.webp"
                    alt="Digital Creative Space"
                    className="w-full h-full object-contain brightness-0 invert"
                    style={{
                      filter: 'brightness(0) invert(1) drop-shadow(0 0 30px rgba(0, 247, 255, 0.2)) drop-shadow(0 0 60px rgba(0, 102, 255, 0.15))',
                      opacity: 0.22,
                    }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  />

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 25%, rgba(255,255,255,0) 60%)',
                      mixBlendMode: 'overlay',
                      WebkitMaskImage: 'url(/images/logo.webp)',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskImage: 'url(/images/logo.webp)',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain',
                      opacity: 0.6,
                    }}
                  />

                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 25%, rgba(0,247,255,0.25) 0%, rgba(0,247,255,0) 55%)',
                      mixBlendMode: 'screen',
                      WebkitMaskImage: 'url(/images/logo.webp)',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskImage: 'url(/images/logo.webp)',
                      maskRepeat: 'no-repeat',
                      maskPosition: 'center',
                      maskSize: 'contain',
                      opacity: 0.7,
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Description */}
            <motion.div 
              className="lg:col-span-3 flex flex-col items-center lg:items-start text-center lg:text-left order-3 lg:order-3 mt-7 sm:mt-0"
              initial="hidden"
              animate={mounted ? "visible" : "hidden"}
            >
              {/* Title */}
              <motion.h2
                custom={1.4}
                variants={fadeInUp}
                className="font-tech text-xl sm:text-2xl lg:text-2xl text-white mb-2 lg:mb-4 leading-tight"
                style={{ textShadow: '0 0 15px rgba(0, 247, 255, 0.3)' }}
              >
                Цифровое Креативное<br className="hidden sm:block" /> Пространство
              </motion.h2>

              {/* Decorative line */}
              <motion.div
                custom={1}
                variants={lineVariants}
                className="hidden lg:block w-16 h-[1px] bg-gradient-to-r from-[#00F7FF] to-transparent mb-6 origin-left"
              />

              {/* Description text */}
              <div className="w-full max-w-[320px] px-4 sm:px-0">
                <motion.p
                  custom={1.6}
                  variants={fadeInUp}
                  className="font-mono text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed"
                >
                  экспертная цифровая
                  платформа по продвижению
                  земельных активов и
                  девелоперских решений.
                </motion.p>
                <motion.p
                  custom={1.8}
                  variants={fadeInUp}
                  className="font-mono text-xs sm:text-sm lg:text-base text-white/80 leading-relaxed mt-3 sm:mt-4"
                >
                  Мы объединяем технологии
                  визуализации, маркетинга
                  и аналитики, чтобы помочь
                  собственникам эффективно
                  представить свои участки
                  инвесторам и покупателям.
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            className="mt-auto flex flex-col items-center mb-2 sm:mb-6 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.05 }}>
                <span
                  className="font-mono text-1xl sm:text-1xl md:text-2xl text-[#00F7FF] tracking-wider"
                  style={{ textShadow: '0 0 20px rgba(0, 247, 255, 0.6)' }}
                >
                  2026
                </span>
              </motion.div>
              <motion.div
                className="mt-0.5 sm:mt-2 cursor-pointer pointer-events-auto"
                onClick={handleScrollDown}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00F7FF]/60">
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;