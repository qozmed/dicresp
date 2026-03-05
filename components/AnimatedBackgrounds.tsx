import React, { useEffect, useRef } from 'react';

// Updated interface to include mouse position
const BaseCanvas: React.FC<{ draw: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number, mouse: {x: number, y: number}) => void }> = ({ draw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let running = true;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    
    // Track internal dimensions
    let w = 0;
    let h = 0;

    const render = () => {
      if (!running || reduceMotion) return;
      time += 0.01;
      draw(ctx, w, h, time, mouseRef.current);
      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      
      // Set Actual Size in memory (scaled to account for extra pixel density)
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // Normalize coordinate system to use CSS pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isCoarsePointer) return;
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        running = true;
        animationFrameId = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Initial setup
    handleResize();
    // Initial center mouse pos
    mouseRef.current = { x: w / 2, y: h / 2 };

    if (!reduceMotion) {
      render();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ width: '100%', height: '100%' }} />;
};

// 1. Hero Background: Topographic 3D Landscape
export const TopographicBackground = () => {
  const smoothedMouse = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);
  const isCoarsePointer = useRef(false);

  useEffect(() => {
    isCoarsePointer.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);

  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
      // Smooth mouse interpolation (lerp) for fluid movement
      if (!initialized.current) {
          smoothedMouse.current = { x: mouse.x || w/2, y: mouse.y || h/2 };
          initialized.current = true;
      } else {
          smoothedMouse.current.x += (mouse.x - smoothedMouse.current.x) * 0.05;
          smoothedMouse.current.y += (mouse.y - smoothedMouse.current.y) * 0.05;
      }
      
      const sm = smoothedMouse.current;

      ctx.clearRect(0, 0, w, h);

      // Optimized grid size for 60+ FPS
      const coarse = isCoarsePointer.current || w < 900;
      const cols = coarse ? 28 : 45;
      const rows = coarse ? 20 : 30;
      const scale = coarse ? 190 : 160;
      
      const terrain: number[][] = [];
      
      // Generate terrain
      let yoff = -time * 1.5; 
      for (let y = 0; y < rows; y++) {
          let xoff = 0;
          terrain[y] = [];
          for (let x = 0; x < cols; x++) {
              const height = Math.sin(xoff) * Math.cos(yoff) * 120 + Math.sin(xoff * 0.4 - yoff * 0.6) * 80;
              terrain[y][x] = height;
              xoff += 0.15;
          }
          yoff += 0.15;
      }

      // Camera settings with mouse interaction
      const camX = 0;
      
      // Normalize mouse Y offset between -1 and 1 to prevent extreme values on large screens
      const normalizedY = Math.max(-1, Math.min(1, (sm.y - h/2) / (h/2)));
      
      // Lifts up and down based on mouse Y, constrained to prevent falling under
      const camY = -250 + normalizedY * 80; 
      const camZ = -100;
      
      // Slight tilt adjustment based on mouse Y
      const angleX = 0.35 - normalizedY * 0.08; 
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const project = (x: number, y: number, z: number) => {
          let dx = x - camX;
          let dy = y - camY;
          let dz = z - camZ;
          
          // Rotate around X axis only
          const dyRotX = dy * cosX - dz * sinX;
          const dzRotX = dy * sinX + dz * cosX;
          dy = dyRotX;
          dz = dzRotX;
          
          // Perspective
          const fov = 600;
          if (dz < 1) dz = 1; 
          
          const projX = w / 2 + (dx * fov) / dz;
          const projY = h + (dy * fov) / dz; // Shifted to bottom
          
          return { x: projX, y: projY, z: dz };
      };

      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';

      // Draw polygons from back to front
      for (let y = rows - 2; y >= 0; y--) {
          for (let x = 0; x < cols - 1; x++) {
              const p1 = project((x - cols / 2) * scale, terrain[y][x], y * scale);
              const p2 = project((x + 1 - cols / 2) * scale, terrain[y][x + 1], y * scale);
              const p3 = project((x + 1 - cols / 2) * scale, terrain[y + 1][x + 1], (y + 1) * scale);
              const p4 = project((x - cols / 2) * scale, terrain[y + 1][x], (y + 1) * scale);
              
              if (p1.z < 10 || p2.z < 10 || p3.z < 10 || p4.z < 10) continue;

              const depth = (p1.z + p2.z + p3.z + p4.z) / 4;
              const maxDepth = rows * scale * 0.8;
              const alpha = Math.max(0, 1 - depth / maxDepth);

              if (alpha <= 0) continue;

              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.lineTo(p3.x, p3.y);
              ctx.lineTo(p4.x, p4.y);
              ctx.closePath();

              ctx.strokeStyle = `rgba(0, 247, 255, ${alpha * 0.6})`;
              ctx.stroke();
          }
      }
  };

  return <div className="absolute inset-0 bg-transparent"><BaseCanvas draw={draw} /></div>;
};

// 2. Philosophy Background: Neural Network / Constellation
export const NetworkBackground = () => {
    const nodesRef = useRef<any[]>([]);

    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
        ctx.fillStyle = '#050508'; // Solid clean
        ctx.fillRect(0, 0, w, h);
        
        // Use time for animation effects
        const pulseFactor = Math.sin(time * 2) * 0.5 + 0.5;
        
        // Init nodes if empty
        if (nodesRef.current.length === 0) {
            for(let i=0; i<60; i++) {
                nodesRef.current.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        }

        // Mouse interaction range
        const interactionRadius = 200;

        // Update and Draw
        nodesRef.current.forEach((node, i) => {
            node.x += node.vx;
            node.y += node.vy;

            // Bounce
            if (node.x < 0 || node.x > w) node.vx *= -1;
            if (node.y < 0 || node.y > h) node.vy *= -1;

            // Mouse repulsion/attraction
            const dx = mouse.x - node.x;
            const dy = mouse.y - node.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < interactionRadius) {
                const force = (interactionRadius - dist) / interactionRadius;
                node.x -= dx * force * 0.05;
                node.y -= dy * force * 0.05;
            }

            // Draw Node with time-based pulsing
            const nodeSize = 2 + pulseFactor * 1;
            ctx.fillStyle = `rgba(0, 247, 255, ${0.8 + pulseFactor * 0.2})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
            ctx.fill();

            // Connections
            for (let j = i + 1; j < nodesRef.current.length; j++) {
                const other = nodesRef.current[j];
                const dx2 = node.x - other.x;
                const dy2 = node.y - other.y;
                const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);

                if (dist2 < 150) {
                    ctx.strokeStyle = `rgba(0, 247, 255, ${1 - dist2 / 150})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }
        });
    };

    return <div className="absolute inset-0 bg-transparent sm:bg-transparent md:bg-transparent lg:bg-transparent"><BaseCanvas draw={draw} /></div>;
};

// 3. Projects Background: Digital City (Isometric Rising Blocks) - CENTERED & ADJUSTED
export const DigitalCityBackground = () => {
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        // Moved up to be visually centered (blocks rise up, so base needs to be slightly below center)
        const cy = h * 0.6; 

        // Slightly reduced scale from the "Massive" version
        const tileWidth = 50; 
        const tileHeight = 25; 
        const gridSize = 14; 

        // Isometric projection helper
        const isoX = (x: number, y: number) => (x - y) * tileWidth;
        const isoY = (x: number, y: number) => (x + y) * tileHeight;

        // Loop through grid
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                // Center the grid coordinates
                const x = i - gridSize / 2;
                const y = j - gridSize / 2;

                // Calculate distance from center/mouse for animation
                const dist = Math.sqrt(x * x + y * y);
                
                // Height animation: Adjusted for new scale
                let height = Math.sin(dist * 0.3 - time * 1.2) * 70 + 60; 
                
                // Mouse interaction
                const screenX = cx + isoX(x, y);
                const screenY = cy + isoY(x, y);
                const distToMouse = Math.sqrt((screenX - mouse.x)**2 + (screenY - mouse.y)**2);
                
                if (distToMouse < 400) { 
                    height += (400 - distToMouse) * 0.6; 
                }

                // Draw Block
                const px = cx + isoX(x, y);
                const py = cy + isoY(x, y);

                // Colors
                const hue = 180 + height * 0.5; // Adjusted hue shift
                const color = `hsla(${hue}, 100%, 50%, 0.15)`;
                const strokeColor = `hsla(${hue}, 100%, 70%, 0.3)`;

                // Draw Top Face
                ctx.fillStyle = color;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.moveTo(px, py - height);
                ctx.lineTo(px + tileWidth, py + tileHeight - height);
                ctx.lineTo(px, py + tileHeight * 2 - height);
                ctx.lineTo(px - tileWidth, py + tileHeight - height);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw Sides (Right)
                ctx.fillStyle = `hsla(${hue}, 100%, 30%, 0.1)`;
                ctx.beginPath();
                ctx.moveTo(px + tileWidth, py + tileHeight - height);
                ctx.lineTo(px, py + tileHeight * 2 - height);
                ctx.lineTo(px, py + tileHeight * 2); // Base
                ctx.lineTo(px + tileWidth, py + tileHeight); // Base
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Draw Sides (Left)
                ctx.fillStyle = `hsla(${hue}, 100%, 40%, 0.1)`;
                ctx.beginPath();
                ctx.moveTo(px - tileWidth, py + tileHeight - height);
                ctx.lineTo(px, py + tileHeight * 2 - height);
                ctx.lineTo(px, py + tileHeight * 2); // Base
                ctx.lineTo(px - tileWidth, py + tileHeight); // Base
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    };

    return <div className="absolute inset-0 bg-transparent sm:bg-transparent md:bg-transparent lg:bg-transparent"><BaseCanvas draw={draw} /></div>;
};

// 4. Contact Background: Vortex
export const VortexBackground = () => {
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
        ctx.fillStyle = 'rgba(5, 5, 8, 0.3)';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        // Shift vortex center slightly based on mouse
        const tx = cx + (mouse.x - cx) * 0.1;
        const ty = cy + (mouse.y - cy) * 0.1;

        const count = 100;
        
        ctx.translate(tx, ty);
        
        for (let i = 0; i < count; i++) {
            const angle = i * 0.5 + time * 0.5;
            const dist = (i * 5 + time * 50) % (Math.max(w, h) / 1.5);
            
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            const size = dist * 0.01;

            ctx.fillStyle = i % 3 === 0 ? '#FFFFFF' : '#00F7FF';
            ctx.beginPath();
            ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.translate(-tx, -ty);
    };

    return <div className="absolute inset-0 bg-transparent sm:bg-transparent md:bg-transparent lg:bg-transparent"><BaseCanvas draw={draw} /></div>;
};

// 5. Map Background: Digital Terrain Wave (Interactive) - FIXED ARTIFACTS
export const MapBackground = () => {
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
        // Clean dark fill
        ctx.fillStyle = '#020205'; 
        ctx.fillRect(0, 0, w, h);

        const spacing = 50;
        const rows = Math.ceil(h / spacing);
        const cols = Math.ceil(w / spacing);
        const mx = mouse.x;
        const my = mouse.y;

        for (let r = 0; r <= rows; r++) {
            for (let c = 0; c <= cols; c++) {
                const x = c * spacing;
                const y = r * spacing;
                
                const distToMouse = Math.sqrt((x - mx)**2 + (y - my)**2);
                const mouseActive = distToMouse < 300;
                
                // Stable breathing effect, no complex interference
                const breathe = Math.sin(time * 2 + (x + y) * 0.01) * 0.3 + 0.5; // 0.2 to 0.8
                
                let size = 1.5;
                let alpha = 0.1;

                if (mouseActive) {
                    const intensity = 1 - distToMouse / 300;
                    size = 1.5 + intensity * 2;
                    alpha = 0.1 + intensity * 0.6;
                }

                ctx.fillStyle = '#00F7FF';
                ctx.globalAlpha = alpha * breathe;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
        
        // Scan Scanline
        const scanY = (time * 100) % (h + 200) - 100;
        const grad = ctx.createLinearGradient(0, scanY, w, scanY);
        grad.addColorStop(0, 'rgba(0, 247, 255, 0)');
        grad.addColorStop(0.5, 'rgba(0, 247, 255, 0.15)');
        grad.addColorStop(1, 'rgba(0, 247, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, scanY - 2, w, 4);
    };

    return <div className="absolute inset-0 bg-[#020205]"><BaseCanvas draw={draw} /></div>;
};