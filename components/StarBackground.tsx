import React, { useEffect, useRef } from 'react';

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // 3D Star structure
    interface Star {
      x: number;
      y: number;
      z: number;
      prevZ: number;
    }

    const stars: Star[] = [];
    const numStars = 800;
    const speed = 2; // Base speed
    
    // Initialize stars
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: Math.random() * width,
        prevZ: Math.random() * width
      });
    }

    let animationFrameId: number;

    const animate = () => {
      // Clear with slight trail for "warp" feel? No, let's keep it crisp for now, maybe add trails later if needed.
      // A slight fade out creates trails:
      ctx.fillStyle = 'rgba(10, 10, 15, 0.4)'; 
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;

      ctx.fillStyle = '#FFFFFF';
      
      stars.forEach((star) => {
        // Move star closer
        star.z -= speed;

        // Reset if it passes screen
        if (star.z <= 0) {
          star.z = width;
          star.prevZ = width;
          star.x = (Math.random() - 0.5) * width;
          star.y = (Math.random() - 0.5) * height;
        }

        // Project 3D coordinates to 2D
        const k = 128.0 / star.z;
        const x = star.x * k + cx;
        const y = star.y * k + cy;

        // Previous position for trails (optional, makes it look like streaks)
        // For a clean look, let's just do circles with size based on Z
        
        const size = (1 - star.z / width) * 2.5;
        const opacity = (1 - star.z / width);

        if (x >= 0 && x < width && y >= 0 && y < height) {
           ctx.globalAlpha = opacity;
           ctx.beginPath();
           ctx.arc(x, y, Math.max(0.1, size), 0, Math.PI * 2);
           ctx.fill();
           ctx.globalAlpha = 1.0;
        }
        
        star.prevZ = star.z;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'linear-gradient(to bottom, #050508 0%, #0F1025 100%)', width: '100%', height: '100%' }}
    />
  );
};

export default StarBackground;