import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MousePosition {
  x: number;
  y: number;
  centerX: number;
  centerY: number;
}

const AnimatedLogo: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({
    x: 0,
    y: 0,
    centerX: 0,
    centerY: 0
  });
  const [isHovering, setIsHovering] = useState(false);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate normalized position (-1 to 1) from center
      const x = (e.clientX - centerX) / (rect.width / 2);
      const y = (e.clientY - centerY) / (rect.height / 2);
      
      setMousePos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
        centerX: e.clientX - rect.left,
        centerY: e.clientY - rect.top
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Energy pulse animation along paths
  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.016;
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // 3D rotation based on mouse position
  const rotateX = mousePos.y * -15;
  const rotateY = mousePos.x * 15;
  const translateZ = isHovering ? 30 : 0;

  // Parallax offsets for different layers
  const layer1Offset = { x: mousePos.x * 20, y: mousePos.y * 20 };
  const layer2Offset = { x: mousePos.x * 35, y: mousePos.y * 35 };
  const layer3Offset = { x: mousePos.x * 50, y: mousePos.y * 50 };

  return (
    <motion.div
      ref={containerRef}
      className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[550px] lg:h-[550px]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.02, 1]
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{
          background: 'radial-gradient(circle, rgba(0,247,255,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      {/* Main Logo Container with 3D transform */}
      <motion.div
        className="absolute inset-0"
        animate={{
          rotateX,
          rotateY,
          translateZ
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
        {/* SVG Logo */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F7FF" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00F7FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00F7FF" />
              <stop offset="100%" stopColor="#0066FF" />
            </linearGradient>

            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F7FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0" />
            </radialGradient>

            {/* Glow Filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="6" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Layer 1: Outer Ring - Moves least */}
          <g 
            transform={`translate(${layer1Offset.x}, ${layer1Offset.y})`}
            style={{ opacity: 0.4 }}
          >
            {/* Outer orbital paths */}
            <motion.circle
              cx="200" cy="200" r="160"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="1"
              strokeDasharray="20 10 5 10"
              filter="url(#glow)"
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />
            <motion.circle
              cx="200" cy="200" r="140"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="0.5"
              strokeDasharray="40 20"
              opacity="0.6"
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />
          </g>

          {/* Layer 2: Main Circuit Structure - Medium movement */}
          <g transform={`translate(${layer2Offset.x}, ${layer2Offset.y})`}>
            {/* Central hub ring */}
            <circle
              cx="200" cy="200" r="45"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="2"
              filter="url(#glow)"
            />
            
            {/* Inner tech ring with segments */}
            <motion.circle
              cx="200" cy="200" r="35"
              fill="none"
              stroke="#00F7FF"
              strokeWidth="1"
              strokeDasharray="15 5 10 5"
              filter="url(#glow)"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />

            {/* Main circuit paths from center to outer nodes */}
            {/* Path 1 - Top */}
            <motion.path
              d="M200 155 L200 110 L200 70"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
            />
            
            {/* Path 2 - Top Right */}
            <motion.path
              d="M232 168 L260 130 L290 90"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.7, ease: "easeOut" }}
            />
            
            {/* Path 3 - Bottom Right */}
            <motion.path
              d="M232 232 L270 260 L320 290"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.9, ease: "easeOut" }}
            />
            
            {/* Path 4 - Bottom Left */}
            <motion.path
              d="M168 232 L130 260 L80 290"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.1, ease: "easeOut" }}
            />
            
            {/* Path 5 - Top Left */}
            <motion.path
              d="M168 168 L140 130 L110 90"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 1.3, ease: "easeOut" }}
            />

            {/* Cross connections */}
            <motion.path
              d="M140 130 L260 130"
              fill="none"
              stroke="#00F7FF"
              strokeWidth="1"
              strokeOpacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.5 }}
            />
            <motion.path
              d="M130 260 L270 260"
              fill="none"
              stroke="#00F7FF"
              strokeWidth="1"
              strokeOpacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.6 }}
            />

            {/* Secondary branch paths */}
            <motion.path
              d="M260 130 L300 110"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.8 }}
            />
            <motion.path
              d="M140 130 L100 110"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 1.9 }}
            />
            <motion.path
              d="M270 260 L310 280"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 2.0 }}
            />
            <motion.path
              d="M130 260 L90 280"
              fill="none"
              stroke="#0066FF"
              strokeWidth="1.5"
              strokeOpacity="0.6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 2.1 }}
            />

            {/* Energy flow animations along paths */}
            <g>
              <circle r="3" fill="#FFFFFF" filter="url(#strongGlow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M200 155 L200 110 L200 70"
                />
              </circle>
            </g>
            <g>
              <circle r="3" fill="#FFFFFF" filter="url(#strongGlow)">
                <animateMotion
                  dur="3.5s"
                  repeatCount="indefinite"
                  path="M232 168 L260 130 L290 90"
                  begin="0.5s"
                />
              </circle>
            </g>
            <g>
              <circle r="3" fill="#FFFFFF" filter="url(#strongGlow)">
                <animateMotion
                  dur="4s"
                  repeatCount="indefinite"
                  path="M232 232 L270 260 L320 290"
                  begin="1s"
                />
              </circle>
            </g>
            <g>
              <circle r="3" fill="#FFFFFF" filter="url(#strongGlow)">
                <animateMotion
                  dur="3.5s"
                  repeatCount="indefinite"
                  path="M168 232 L130 260 L80 290"
                  begin="1.5s"
                />
              </circle>
            </g>
            <g>
              <circle r="3" fill="#FFFFFF" filter="url(#strongGlow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  path="M168 168 L140 130 L110 90"
                  begin="2s"
                />
              </circle>
            </g>

            {/* Connection Nodes - Main */}
            {/* Top Node */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 2.5 }}
            >
              <circle cx="200" cy="70" r="12" fill="#050508" stroke="url(#nodeGradient)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="200" cy="70" r="6" fill="url(#nodeGradient)" />
              <motion.circle
                cx="200" cy="70" r="20"
                fill="none"
                stroke="#00F7FF"
                strokeWidth="1"
                strokeOpacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>

            {/* Top Right Node */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 2.6 }}
            >
              <circle cx="290" cy="90" r="12" fill="#050508" stroke="url(#nodeGradient)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="290" cy="90" r="6" fill="url(#nodeGradient)" />
              <motion.circle
                cx="290" cy="90" r="20"
                fill="none"
                stroke="#00F7FF"
                strokeWidth="1"
                strokeOpacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
              />
            </motion.g>

            {/* Bottom Right Node */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 2.7 }}
            >
              <circle cx="320" cy="290" r="12" fill="#050508" stroke="url(#nodeGradient)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="320" cy="290" r="6" fill="url(#nodeGradient)" />
              <motion.circle
                cx="320" cy="290" r="20"
                fill="none"
                stroke="#00F7FF"
                strokeWidth="1"
                strokeOpacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
              />
            </motion.g>

            {/* Bottom Left Node */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 2.8 }}
            >
              <circle cx="80" cy="290" r="12" fill="#050508" stroke="url(#nodeGradient)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="80" cy="290" r="6" fill="url(#nodeGradient)" />
              <motion.circle
                cx="80" cy="290" r="20"
                fill="none"
                stroke="#00F7FF"
                strokeWidth="1"
                strokeOpacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
              />
            </motion.g>

            {/* Top Left Node */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 2.9 }}
            >
              <circle cx="110" cy="90" r="12" fill="#050508" stroke="url(#nodeGradient)" strokeWidth="2" filter="url(#glow)" />
              <circle cx="110" cy="90" r="6" fill="url(#nodeGradient)" />
              <motion.circle
                cx="110" cy="90" r="20"
                fill="none"
                stroke="#00F7FF"
                strokeWidth="1"
                strokeOpacity="0.5"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
              />
            </motion.g>

            {/* Secondary nodes on cross connections */}
            <motion.circle
              cx="200" cy="130" r="4"
              fill="#00F7FF"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3 }}
            />
            <motion.circle
              cx="200" cy="260" r="4"
              fill="#00F7FF"
              filter="url(#glow)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3.1 }}
            />

            {/* Terminal nodes on edges */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3.2 }}
            >
              <rect x="295" y="105" width="10" height="10" rx="2" fill="#050508" stroke="#00F7FF" strokeWidth="1" />
              <rect x="95" y="105" width="10" height="10" rx="2" fill="#050508" stroke="#00F7FF" strokeWidth="1" />
              <rect x="305" y="275" width="10" height="10" rx="2" fill="#050508" stroke="#00F7FF" strokeWidth="1" />
              <rect x="85" y="275" width="10" height="10" rx="2" fill="#050508" stroke="#00F7FF" strokeWidth="1" />
            </motion.g>

            {/* Center Hub */}
            <motion.circle
              cx="200" cy="200" r="20"
              fill="url(#centerGlow)"
              filter="url(#strongGlow)"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="200" cy="200" r="12"
              fill="#050508"
              stroke="#00F7FF"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <circle cx="200" cy="200" r="6" fill="#00F7FF" filter="url(#strongGlow)" />
            
            {/* Inner pulse from center */}
            <motion.circle
              cx="200" cy="200" r="25"
              fill="none"
              stroke="#00F7FF"
              strokeWidth="2"
              animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ transformOrigin: '200px 200px' }}
            />
          </g>

          {/* Layer 3: Floating particles - Most movement */}
          <g transform={`translate(${layer3Offset.x}, ${layer3Offset.y})`}>
            {/* Floating data points */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 180;
              const x = 200 + Math.cos(angle) * radius;
              const y = 200 + Math.sin(angle) * radius;
              
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="#00F7FF"
                  opacity="0.6"
                  filter="url(#glow)"
                  animate={{
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              );
            })}
          </g>
        </svg>
      </motion.div>

      {/* Interactive hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{
          opacity: isHovering ? 0.3 : 0,
          scale: isHovering ? 1.1 : 1
        }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'radial-gradient(circle, rgba(0,247,255,0.3) 0%, transparent 60%)',
          filter: 'blur(60px)'
        }}
      />
    </motion.div>
  );
};

export default AnimatedLogo;
