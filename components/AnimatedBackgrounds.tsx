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
    
    // Track internal dimensions
    let w = 0;
    let h = 0;

    const render = () => {
      time += 0.01;
      draw(ctx, w, h, time, mouseRef.current);
      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      
      // Set Actual Size in memory (scaled to account for extra pixel density)
      canvas.width = w * dpr;
      canvas.height = h * dpr;

      // Normalize coordinate system to use CSS pixels
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Initial setup
    handleResize();
    // Initial center mouse pos
    mouseRef.current = { x: w / 2, y: h / 2 };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ width: '100%', height: '100%' }} />;
};

// 1. Hero Background: 3D Orbital Rings & Floating Particles
export const OrbitalBackground = () => {
  const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, time: number, mouse: {x: number, y: number}) => {
    // Clear with trail effect
    ctx.fillStyle = 'rgba(5, 5, 8, 0.2)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    
    // Parallax effect based on mouse
    const mx = (mouse.x - cx) * 0.05;
    const my = (mouse.y - cy) * 0.05;

    // Rings
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        // 3D rotation effect using sine/cosine squashing
        const radius = 100 * i + Math.sin(time * 0.5) * 20;
        const squash = 0.4; // Tilt
        
        for (let a = 0; a <= Math.PI * 2; a += 0.05) {
            // Rotate the ring
            const angle = a + time * (0.1 / i);
            const x = cx + Math.cos(angle) * radius - mx * (i * 0.5);
            const y = cy + Math.sin(angle) * radius * squash - my * (i * 0.5);
            if (a === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    // Floating Particles
    const pCount = 50;
    for(let i=0; i<pCount; i++) {
        const angle = i + time * 0.2;
        const r = (200 + i * 10) % (w/2);
        const px = cx + Math.cos(angle * 0.5) * r - mx;
        const py = cy + Math.sin(angle * 0.3) * r - my;
        
        ctx.fillStyle = i % 2 === 0 ? '#00F7FF' : '#0066FF';
        ctx.globalAlpha = 0.5 + Math.sin(time + i) * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, Math.random() * 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  return <div className="absolute inset-0 bg-[#050508]"><BaseCanvas draw={draw} /></div>;
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