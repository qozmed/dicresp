import React from 'react';
import { PHILOSOPHY_STATS } from '../constants';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';

// Counter Component
const AnimatedCounter = ({ value, suffix }: { value: string, suffix?: string }) => {
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(count, numericValue, { duration: 2.5, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, numericValue]);

  return (
    <span ref={ref} className="inline-flex items-baseline">
      <motion.span>{rounded}</motion.span>
      {suffix && <span className="text-lg md:text-xl lg:text-2xl text-cyan-400 ml-1 font-mono">{suffix}</span>}
    </span>
  );
};

const Philosophy: React.FC = () => {
  return (
    <section className="relative w-full h-full flex flex-col justify-start md:justify-center overflow-visible md:overflow-hidden pointer-events-none pt-8 sm:pt-12 md:pt-20 lg:pt-0 pb-6 md:pb-0">
      <div className="container mx-auto px-4 md:px-6 relative z-10 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false }}
          className="mb-4 sm:mb-6 md:mb-10 lg:mb-24"
        >
            <div className="flex items-center space-x-2 sm:space-x-4 mb-2 md:mb-4">
                <div className="h-[1px] w-6 sm:w-8 md:w-12 bg-cyan-500"></div>
                <span className="text-cyan-500 uppercase tracking-widest text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-mono">Наша Миссия</span>
            </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-display text-white leading-tight max-w-4xl">
            Мы создаем <span className="inline-block pt-[1px] pb-[3px] leading-[1.2] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-600">будущее</span> сегодня
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {PHILOSOPHY_STATS.map((stat, index) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="tech-border bg-[#0A0A0F]/90 backdrop-blur-xl p-3 md:p-5 lg:p-8 group hover:bg-[#0F1025] transition-colors shadow-lg border-cyan-500/20"
            >
              <div className="flex justify-between items-start mb-2 md:mb-4 lg:mb-8">
                 <span className="font-mono text-[10px] md:text-[10px] lg:text-xs text-gray-400">DATA_0{index + 1}</span>
                 <div className="w-2 h-2 bg-cyan-500 rounded-full opacity-50 group-hover:animate-ping"></div>
              </div>
              
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-white mb-2 md:mb-3 lg:mb-4 font-display tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              
              <p className="text-gray-300 font-mono uppercase tracking-[0.15em] text-[10px] md:text-xs lg:text-sm border-t border-white/10 pt-2 md:pt-3 lg:pt-4 mt-2 md:mt-3 lg:mt-4 group-hover:border-cyan-500/50 transition-colors">
                  {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-4 md:mt-12 lg:mt-24 p-3 md:p-6 lg:p-8 border-l-4 border-cyan-500 bg-[#0A0A0F]/80 backdrop-blur-md shadow-2xl"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.4, duration: 1 }}
        >
          <p className="text-xs sm:text-sm md:text-lg lg:text-xl xl:text-2xl text-white leading-relaxed max-w-4xl">
            <span className="text-cyan-400">Цифровое Креативное Пространство</span> объединяет передовые технологии лэнд-девелопмента и философию гармонии с природой, 
            Наши проекты — это не просто квадратные метры. это <span className="text-white glow-text">экосистемы</span> для жизни нового поколения,
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Philosophy;