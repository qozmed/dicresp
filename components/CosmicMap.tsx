import React, { useEffect, useRef, useState } from 'react';
import { Project } from '../types';
import { ArrowLeft, Layers, Crosshair, Copy, Check, X, Download, FileText, ExternalLink, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CosmicMapProps {
  project: Project;
  onBack: () => void;
}

const CosmicMap: React.FC<CosmicMapProps> = ({ project, onBack }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const objectManagerRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Store original colors externally to prevent loss during Yandex Maps object lifecycle
  const originalColorsRef = useRef<Record<string | number, { fill: string; stroke: string }>>({});
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [activePolygonId, setActivePolygonId] = useState<number | string | null>(null);
  
  // PDF PREVIEW STATE
  const [previewFile, setPreviewFile] = useState<{ url: string; title: string } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // VIDEO PREVIEW STATE
const [videoPreview, setVideoPreview] = useState<{ url: string; title: string } | null>(null);
  // DEBUG STATE
  const [debugCenter, setDebugCenter] = useState<number[]>([0, 0]);
  const [debugZoom, setDebugZoom] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Load Yandex Maps Script
  useEffect(() => {
    if (document.getElementById('ymaps-script')) {
      if ((window as any).ymaps) setIsMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
    script.id = 'ymaps-script';
    script.async = true;
    script.onload = () => {
      (window as any).ymaps.ready(() => {
        setIsMapLoaded(true);
      });
    };
    document.body.appendChild(script);
  }, []);

  // Handle Preview Loading State
  useEffect(() => {
    if (previewFile) {
        setIsLoadingPreview(true);
        // Safety timeout: ensure loading text disappears after 3 seconds even if onLoad doesn't trigger
        const timer = setTimeout(() => {
            setIsLoadingPreview(false);
        }, 3000);
        return () => clearTimeout(timer);
    } else {
        setIsLoadingPreview(false);
    }
  }, [previewFile]);

  // --- HANDLE BALLOON ACTIONS ---
  useEffect(() => {
    const handleBalloonAction = (e: CustomEvent) => {
        const { actionId, iconCaption, description, fileUrl, videoUrl } = e.detail;
        console.log("Balloon Button Clicked:", e.detail);
        
        if (actionId === 'reserve') {
            alert(`Заявка на бронирование: ${iconCaption}`);
        } else if (actionId === 'download_plan') {
            if (fileUrl) {
                setPreviewFile({
                    url: fileUrl,
                    title: iconCaption || 'Документ'
                });
            } else {
                alert(`Файл для скачивания не найден для объекта: ${iconCaption}`);
            }
        } else if (actionId === 'play_video') {
            if (videoUrl) {
                setVideoPreview({
                    url: videoUrl,
                    title: iconCaption || 'Видео презентация'
                });
            } else {
                alert(`Видеофайл не найден: ${iconCaption}`);
            }
        } else if (actionId === 'view_3d') {
            alert(`Запуск 3D тура: ${iconCaption}`);
        } else {
            alert(`Действие для объекта: ${iconCaption}\n${description}`);
        }
    };

    window.addEventListener('cosmic-balloon-click', handleBalloonAction as EventListener);
    return () => {
        window.removeEventListener('cosmic-balloon-click', handleBalloonAction as EventListener);
    };
  }, []);

  // --- POLYGON SHIMMER EFFECT ---
  useEffect(() => {
      if (!isMapLoaded || !objectManagerRef.current) return;

      const animatePolygons = () => {
          const time = Date.now() / 1000;
          
          objectManagerRef.current.objects.each((obj: any) => {
             if (obj.geometry.type === 'Polygon') {
                 const isActive = activePolygonId !== null && obj.id === activePolygonId;
                 const speed = isActive ? 5 : 1; 
                 const baseOpacity = isActive ? 0.6 : 0.3;
                 const range = isActive ? 0.25 : 0.05;
                 const opacity = baseOpacity + Math.sin(time * speed) * range;
                 const original = originalColorsRef.current[obj.id] || { fill: '#ed4543', stroke: '#ed4543' };

                 objectManagerRef.current.objects.setObjectOptions(obj.id, {
                     fillOpacity: opacity,
                     strokeColor: isActive ? '#00F7FF' : original.stroke,
                     fillColor: isActive ? '#00F7FF' : original.fill,
                     strokeWidth: isActive ? 4 : 2,
                     zIndex: isActive ? 10 : 1, 
                     zIndexHover: isActive ? 10 : 1
                 });
             }
          });
          animationFrameRef.current = requestAnimationFrame(animatePolygons);
      };

      animationFrameRef.current = requestAnimationFrame(animatePolygons);
      return () => {
          cancelAnimationFrame(animationFrameRef.current);
      };
  }, [isMapLoaded, activePolygonId]);

  // Helper: Ray-Casting Algorithm to check if point is in polygon
  const isPointInPolygon = (point: number[], vs: number[][]) => {
      const x = point[0], y = point[1];
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
          const xi = vs[i][0], yi = vs[i][1];
          const xj = vs[j][0], yj = vs[j][1];
          const intersect = ((yi > y) !== (yj > y))
              && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
      }
      return inside;
  };

  // Initialize Map Focused on Project
  useEffect(() => {
    if (!isMapLoaded || !mapContainerRef.current) return;

    const ymaps = (window as any).ymaps;

    // --- CONFIGURATION LOGIC ---
    const isMobile = window.innerWidth < 768;
    const markerCoords = project.geoCoordinates || [55.75, 37.62];
    
    let cameraCenter = markerCoords;
    let zoomLevel = 14;
    if (isMobile && project.mobileMapView) {
        cameraCenter = project.mobileMapView.center || cameraCenter;
        zoomLevel = project.mobileMapView.zoom || zoomLevel;
    } else if (project.mapView) {
        cameraCenter = project.mapView.center || cameraCenter;
        zoomLevel = project.mapView.zoom || zoomLevel;
    }

    if (!mapInstanceRef.current) {
        mapInstanceRef.current = new ymaps.Map(mapContainerRef.current, {
            center: cameraCenter,
            zoom: zoomLevel, 
            controls: [] 
        }, {
            suppressMapOpenBlock: true,
            minZoom: 2,
        });
    } else {
        mapInstanceRef.current.setCenter(cameraCenter, zoomLevel, { duration: 800 });
    }

    const map = mapInstanceRef.current;
    const fixLayout = () => { map.container.fitToViewport(); };
    fixLayout();
    setTimeout(fixLayout, 100);
    setTimeout(fixLayout, 300);
    setTimeout(fixLayout, 1000);

    setDebugCenter(map.getCenter());
    setDebugZoom(map.getZoom());

    if (clickListenerRef.current) {
        map.events.remove('click', clickListenerRef.current);
        clickListenerRef.current = null;
    }

    map.geoObjects.removeAll();
    if (objectManagerRef.current) objectManagerRef.current.removeAll();
    originalColorsRef.current = {};

    const animatedMarkerLayout = ymaps.templateLayoutFactory.createClass(`
        <div class="cosmic-marker-wrapper">
            <div class="cosmic-marker-ring"></div>
            <div class="cosmic-marker-core"></div>
            <div class="cosmic-marker-label">$[properties.iconCaption]</div>
        </div>
    `);

    const customBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        `
        <div class="cosmic-plate">
            <div class="plate-header">
                <div class="status-indicator"></div>
                <span class="plate-title">$[properties.iconCaption|default:point_data]</span>
            </div>
            <div class="plate-body">
                $[properties.description|default:Нет описания]
            </div>
            <div class="plate-actions">
                <button class="cosmic-balloon-btn" id="action-btn">
                    $[properties.buttonText|default:Подробнее]
                </button>
                <button class="cosmic-balloon-btn video-btn" id="video-btn" style="display: $[properties.videoUrl|then:inline-block|else:none]; margin-left: 8px;">
                     $[properties.videoButtonText|default:Смотреть видео]
                </button>
            </div>
            <div class="plate-footer">
                <div class="tech-lines"></div>
                <span class="scan-text">TARGET_LOCKED</span>
            </div>
        </div>
        `,
        {
            build: function () {
                // @ts-ignore
                this.constructor.superclass.build.call(this);
                // @ts-ignore
                this._element = this.getParentElement().querySelector('#action-btn');
                if (this._element) {
                    // @ts-ignore
                    this._listener = (e) => {
                        // @ts-ignore
                        const properties = this.getData().properties.getAll();
                        const event = new CustomEvent('cosmic-balloon-click', { detail: properties });
                        window.dispatchEvent(event);
                    };
                    // @ts-ignore
                    this._element.addEventListener('click', this._listener);
                }

                // Attach listener to Video Button
                // @ts-ignore
                this._videoElement = this.getParentElement().querySelector('#video-btn');
                if (this._videoElement) {
                     // @ts-ignore
                     this._videoListener = (e) => {
                         // @ts-ignore
                         const properties = this.getData().properties.getAll();
                         // Override actionId for video button
                         const detail = { ...properties, actionId: 'play_video' };
                         const event = new CustomEvent('cosmic-balloon-click', { detail });
                         window.dispatchEvent(event);
                     };
                     // @ts-ignore
                     this._videoElement.addEventListener('click', this._videoListener);
                }
            },
            clear: function () {
                // @ts-ignore
                if (this._element && this._listener) {
                    // @ts-ignore
                    this._element.removeEventListener('click', this._listener);
                }
                // @ts-ignore
                if (this._videoElement && this._videoListener) {
                    // @ts-ignore
                    this._videoElement.removeEventListener('click', this._videoListener);
                }
                // @ts-ignore
                this.constructor.superclass.clear.call(this);
            }
        }
    );

    if (project.geoJson) {
        const objectManager = new ymaps.ObjectManager({
            clusterize: false,
            geoObjectOpenBalloonOnClick: true, 
        });
        objectManagerRef.current = objectManager;

        const swapCoordinates = (coords: any): any => {
            if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
                return [coords[1], coords[0]];
            }
            if (Array.isArray(coords)) return coords.map(swapCoordinates);
            return coords;
        };

        try {
            const processedGeoJson = JSON.parse(JSON.stringify(project.geoJson));
            if (processedGeoJson.features) {
                processedGeoJson.features.forEach((feature: any) => {
                    if (feature.geometry && feature.geometry.coordinates) {
                        feature.geometry.coordinates = swapCoordinates(feature.geometry.coordinates);
                    }
                    if (!feature.options) feature.options = {};
                    if (feature.geometry.type === 'Point') {
                        feature.options.iconLayout = animatedMarkerLayout;
                        feature.options.iconShape = { type: 'Circle', coordinates: [0, 0], radius: 45 };
                        feature.options.iconOffset = [-20, -20];
                        feature.options.zIndex = 2000;
                        feature.options.hideIconOnBalloonOpen = false;
                        feature.options.balloonContentLayout = customBalloonContentLayout;
                        feature.options.balloonPanelMaxMapArea = 0;
                    } else if (feature.geometry.type === 'Polygon') {
                        const originalFill = feature.properties?.fill || '#ed4543';
                        const originalStroke = feature.properties?.stroke || '#ed4543';
                        if (feature.id !== undefined) originalColorsRef.current[feature.id] = { fill: originalFill, stroke: originalStroke };
                        feature.options.openBalloonOnClick = false;
                        feature.options.cursor = 'default';
                        feature.options.zIndex = 1;
                        feature.options.interactive = false; 
                    }
                });
            }
            objectManager.add(processedGeoJson);
            map.geoObjects.add(objectManager);

            objectManager.objects.events.add('click', (e: any) => {
                const objectId = e.get('objectId');
                const obj = objectManager.objects.getById(objectId);
                if (obj.geometry.type === 'Point') {
                    const pointCoords = obj.geometry.coordinates; 
                    let foundPolygonId = null;
                    objectManager.objects.each((poly: any) => {
                        if (poly.geometry.type === 'Polygon') {
                             if (poly.geometry.coordinates && poly.geometry.coordinates[0]) {
                                 if (isPointInPolygon(pointCoords, poly.geometry.coordinates[0])) {
                                     foundPolygonId = poly.id;
                                 }
                             }
                        }
                    });
                    setActivePolygonId(foundPolygonId);
                    map.panTo(pointCoords, { duration: 600, delay: 0, timingFunction: 'ease-out' });
                }
            });
        } catch (e) {
            console.error("Error parsing GeoJSON:", e);
        }
    }

    const onMapClick = () => {
        setActivePolygonId(null);
        if (objectManagerRef.current) objectManagerRef.current.objects.balloon.close();
        map.balloon.close();
    };
    clickListenerRef.current = onMapClick;
    map.events.add('click', onMapClick);

    map.events.add('boundschange', (e: any) => {
        setDebugCenter(e.get('newCenter'));
        setDebugZoom(e.get('newZoom'));
    });

  }, [isMapLoaded, project]); 
  
  const copyConfig = () => {
    const text = `
    mapView: {
        center: [${debugCenter[0].toFixed(6)}, ${debugCenter[1].toFixed(6)}],
        zoom: ${debugZoom.toFixed(2)}
    },`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] w-full h-full bg-[#050508]"
    >
      {/* Visual Aiming Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-80">
         <div className="relative">
            <Crosshair className="text-red-500 w-6 h-6 sm:w-8 sm:h-8 animate-pulse" strokeWidth={1.5} />
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
         </div>
      </div>

      {/* DEV PANEL */}
      <div className="hidden sm:block absolute top-24 right-6 z-50 bg-black/90 border border-red-500/50 p-4 rounded w-64 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-center mb-2 pb-2 border-b border-white/10">
              <span className="text-red-400 font-mono text-xs font-bold uppercase animate-pulse">DEV MODE :: ACTIVE</span>
              <Layers size={12} className="text-red-500 ml-2"/>
          </div>
          <div className="space-y-2 mb-4">
              <div>
                  <label className="text-[10px] text-gray-500 uppercase font-mono block">Center (Lat, Lng)</label>
                  <div className="text-white font-mono text-xs">
                      [{debugCenter[0].toFixed(5)}, {debugCenter[1].toFixed(5)}]
                  </div>
              </div>
              <div>
                  <label className="text-[10px] text-gray-500 uppercase font-mono block">Zoom</label>
                  <div className="text-white font-mono text-xs">
                      {debugZoom.toFixed(2)}
                  </div>
              </div>
          </div>
          <button 
            onClick={copyConfig}
            className={`w-full flex items-center justify-center space-x-2 py-2 border rounded font-mono text-xs font-bold uppercase transition-all ${copied ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40'}`}
          >
              {copied ? <Check size={14}/> : <Copy size={14}/>}
              <span>{copied ? 'COPIED!' : 'COPY CONFIG'}</span>
          </button>
      </div>

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 w-full p-3 sm:p-4 md:p-6 z-20 pointer-events-none flex justify-between items-start">
         <button 
            onClick={onBack}
            className="pointer-events-auto flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-3 bg-black/60 border border-white/20 hover:border-cyan-500 text-white hover:text-cyan-400 backdrop-blur-md transition-all group rounded-sm touch-manipulation"
         >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest hidden sm:inline">Назад к проектам</span>
            <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest sm:hidden">Назад</span>
         </button>

         <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 px-3 py-2 sm:px-6 sm:py-3 rounded-sm flex flex-col items-end shadow-[0_0_30px_rgba(0,247,255,0.1)] max-w-[200px] sm:max-w-none">
             <span className="text-[8px] sm:text-[10px] text-cyan-500 font-mono uppercase tracking-wider mb-1 text-right">Спутниковая связь установлена</span>
             <h2 className="text-sm sm:text-xl md:text-2xl font-display text-white leading-none text-right">{project.title}</h2>
             <span className="text-[10px] sm:text-xs text-gray-400 font-mono mt-1 text-right">{project.region}</span>
         </div>
      </div>

      {/* VIDEO PREVIEW MODAL */}
      <AnimatePresence>
        {videoPreview && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
                onClick={() => setVideoPreview(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative w-full h-auto md:w-[90vw] md:max-w-[1200px] bg-[#0A0A0F] border border-cyan-500/50 shadow-[0_0_50px_rgba(0,247,255,0.15)] flex flex-col md:rounded-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/50 shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/30 animate-pulse">
                                <Play size={16} fill="currentColor" />
                            </div>
                            <div className="max-w-[150px] sm:max-w-md overflow-hidden">
                                <h3 className="text-white font-mono text-xs md:text-sm uppercase tracking-wider truncate">{videoPreview.title}</h3>
                                <span className="text-[10px] text-gray-400 font-mono uppercase">SECURE VIDEO FEED</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setVideoPreview(null)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Video Player */}
                    <div className="relative bg-black aspect-video flex items-center justify-center">
                        <video 
                            controls 
                            autoPlay 
                            playsInline
                            preload="auto"
                            className="w-full h-full max-h-[80vh] object-contain"
                            src={videoPreview.url}
                        >
                            Ваш браузер не поддерживает видео.
                        </video>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* PDF PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-4"
                onClick={() => setPreviewFile(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    // Full screen on mobile, nice box on desktop
                    className="relative w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-[1600px] bg-[#0A0A0F] border-0 md:border border-cyan-500/50 shadow-[0_0_50px_rgba(0,247,255,0.15)] flex flex-col md:rounded-sm overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-black/50 shrink-0">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-cyan-900/30 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                                <FileText size={16} />
                            </div>
                            <div className="max-w-[150px] sm:max-w-md overflow-hidden">
                                <h3 className="text-white font-mono text-xs md:text-sm uppercase tracking-wider truncate">{previewFile.title}</h3>
                                <span className="text-[10px] text-gray-400 font-mono uppercase">SECURE DOCUMENT VIEWER</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                             {/* Always show Open in New Tab for robustness */}
                             <a 
                                href={previewFile.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                title="Open in new window"
                             >
                                <ExternalLink size={20} />
                             </a>
                             <button 
                                onClick={() => setPreviewFile(null)}
                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                             >
                                <X size={20} />
                             </button>
                        </div>
                    </div>

                    {/* PDF Content Area */}
                    <div className="flex-1 bg-[#1A1B21] relative overflow-hidden">
                         {isLoadingPreview && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                                <span className="text-gray-600 font-mono text-xs animate-pulse">LOADING DATA STREAM...</span>
                            </div>
                         )}
                         
                         {/* 
                            IOS/MOBILE SCROLL FIX:
                            1. Use <object> tag instead of iframe for better native handling
                            2. Container with touch scrolling enabled
                            3. Overscroll behavior auto to ensure events aren't trapped
                         */}
                         <div 
                            className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden" 
                            style={{ 
                                WebkitOverflowScrolling: 'touch',
                                overscrollBehavior: 'auto'
                            }}
                         >
                             <object
                                data={`${previewFile.url}#view=Fit&zoom=page-fit`}
                                type="application/pdf"
                                className="w-full h-full block"
                                style={{ minHeight: '100%' }}
                                onLoad={() => setIsLoadingPreview(false)}
                             >
                                 {/* Fallback for when object fails (some mobile browsers) */}
                                 <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                     <FileText size={48} className="mb-4 text-cyan-900" />
                                     <p className="mb-4 text-sm font-mono">Предпросмотр недоступен на этом устройстве.</p>
                                     <a 
                                        href={previewFile.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 underline font-mono text-xs uppercase"
                                     >
                                        Открыть файл в новой вкладке
                                     </a>
                                 </div>
                             </object>
                         </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 sm:p-4 border-t border-white/10 bg-black/80 flex justify-between items-center backdrop-blur-md shrink-0 z-20">
                        <span className="text-[10px] text-gray-500 font-mono hidden md:block">
                            CONFIDENTIAL // INTERNAL USE ONLY
                        </span>
                        
                        <a 
                            href={previewFile.url} 
                            download
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_15px_rgba(0,247,255,0.3)] hover:shadow-[0_0_25px_rgba(0,247,255,0.5)] w-full md:w-auto justify-center"
                        >
                            <Download size={16} />
                            <span>Скачать файл</span>
                        </a>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN MAP CONTAINER */}
      <div className="relative w-full h-full">
          <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(0,247,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,247,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          <style>{`
            /* MAP FILTERS */
            .cosmic-map-container [class*="ymaps-"][class*="-ground-pane"] {
                filter: grayscale(100%) invert(100%) sepia(100%) saturate(700%) hue-rotate(180deg) brightness(115%) contrast(170%);
            }
            .cosmic-map-container [class*="ymaps-"][class*="-copyright"] {
                filter: invert(100%) opacity(0.5);
            }
            
            /* BALLOON RESET */
            .cosmic-map-container [class*="ymaps-"][class*="-balloon__layout"] {
                box-shadow: none !important;
                background: transparent !important;
                border: none !important;
            }
            .cosmic-map-container [class*="ymaps-"][class*="-balloon__content"] {
                background: transparent !important;
                border: none !important;
                color: white !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
                min-width: 0 !important; 
            }
            .cosmic-map-container [class*="ymaps-"][class*="-balloon__tail"] {
                display: none !important;
            }
            .cosmic-map-container [class*="ymaps-"][class*="-balloon__close-button"] {
                background: none !important; 
                opacity: 0.7 !important;
                filter: invert(100%) drop-shadow(0 0 2px #00F7FF); 
                transform: scale(1.2);
                right: 8px;
                top: 8px;
                z-index: 10;
            }

            /* --- CUSTOM MARKER STYLES --- */
            .cosmic-marker-wrapper {
                position: relative;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: translate(0, 0); 
                cursor: pointer; /* Ensure pointer shows interactivity */
                pointer-events: auto; /* Ensure events are caught */
                background: rgba(0,0,0,0);
            }
            
            .cosmic-marker-core {
                width: 8px;
                height: 8px;
                background: #00F7FF;
                border-radius: 50%;
                box-shadow: 0 0 10px #00F7FF, 0 0 20px #00F7FF;
                z-index: 2;
                animation: markerPulse 2s infinite ease-in-out;
            }
            
            .cosmic-marker-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 1px solid rgba(0, 247, 255, 0.6);
                border-top: 1px solid transparent;
                border-bottom: 1px solid transparent;
                border-radius: 50%;
                animation: markerSpin 4s linear infinite;
                box-shadow: 0 0 15px rgba(0, 247, 255, 0.1) inset;
            }
            
            .cosmic-marker-ring::before {
                content: '';
                position: absolute;
                top: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 4px;
                height: 4px;
                background: #00F7FF;
                border-radius: 50%;
                box-shadow: 0 0 5px #00F7FF;
            }

            .cosmic-marker-label {
                position: absolute;
                top: -18px;
                left: 50%;
                transform: translateX(-50%);
                white-space: nowrap;
                font-family: 'Tektur', monospace;
                font-size: 10px;
                color: #00F7FF;
                text-shadow: 0 0 4px rgba(0,247,255,0.8);
                text-transform: uppercase;
                letter-spacing: 1px;
                background: rgba(0,0,0,0.7);
                padding: 1px 4px;
                border-radius: 2px;
                opacity: 0.8;
                pointer-events: auto; 
            }

            @keyframes markerSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes markerPulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(1); opacity: 1; }
            }

            /* --- BALLOON ANIMATIONS --- */
            @keyframes hologramOpen {
                0% {
                    opacity: 0;
                    transform: scale(0.9) translateY(15px) perspective(500px) rotateX(10deg);
                    filter: blur(8px);
                }
                60% {
                    opacity: 1;
                    filter: blur(0px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0) perspective(500px) rotateX(0deg);
                    filter: blur(0px);
                }
            }
            .cosmic-plate {
                background: rgba(5, 5, 8, 0.95);
                backdrop-filter: blur(12px);
                border: 1px solid #00F7FF;
                box-shadow: 0 0 25px rgba(0, 247, 255, 0.2);
                border-radius: 2px;
                position: relative;
                transform-origin: center bottom;
                animation: hologramOpen 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                font-family: 'Tektur', monospace;
                padding: 12px;
                width: 100%;
                min-width: 250px;
            }
            .plate-header {
                display: flex;
                align-items: center;
                border-bottom: 1px solid rgba(0, 247, 255, 0.3);
                padding-bottom: 8px;
                margin-bottom: 8px;
            }
            .status-indicator {
                width: 6px;
                height: 6px;
                background-color: #00F7FF;
                border-radius: 50%;
                margin-right: 8px;
                box-shadow: 0 0 8px #00F7FF;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            .plate-title {
                font-size: 14px;
                font-weight: 600;
                color: white;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-shadow: 0 0 5px rgba(0, 247, 255, 0.5);
            }
            .plate-body {
                font-size: 12px;
                color: #ccc;
                line-height: 1.4;
                margin-bottom: 10px;
            }
            .plate-actions {
                margin-bottom: 8px;
                text-align: right;
            }
            .cosmic-balloon-btn {
                background: rgba(0, 247, 255, 0.1);
                border: 1px solid rgba(0, 247, 255, 0.5);
                color: #00F7FF;
                font-family: 'Tektur', monospace;
                font-size: 10px;
                font-weight: bold;
                text-transform: uppercase;
                padding: 6px 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                letter-spacing: 0.05em;
                outline: none;
            }
            .cosmic-balloon-btn:hover {
                background: rgba(0, 247, 255, 0.3);
                box-shadow: 0 0 10px rgba(0, 247, 255, 0.4);
                color: white;
            }
            .cosmic-balloon-btn:active {
                transform: translateY(1px);
            }
             /* VIDEO BUTTON SPECIFIC STYLE */
            .video-btn {
                background: rgba(0, 247, 255, 0.1);
                border-color: rgba(0, 247, 255, 0.5);
                color: #00F7FF;
            }
            .video-btn:hover {
                background: rgba(255, 0, 100, 0.3);
                box-shadow: 0 0 10px rgba(255, 0, 100, 0.4);
                color: white;
            }
            .plate-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .tech-lines {
                flex-grow: 1;
                height: 2px;
                background: repeating-linear-gradient(
                    90deg,
                    #00F7FF,
                    #00F7FF 2px,
                    transparent 2px,
                    transparent 4px
                );
                opacity: 0.3;
                margin-right: 8px;
            }
            .scan-text {
                font-size: 8px;
                color: #00F7FF;
                opacity: 0.7;
            }
          `}</style>

          <div 
            ref={mapContainerRef} 
            className="cosmic-map-container w-full h-full bg-[#050508] relative z-0"
          >
            {!isMapLoaded && (
               <div className="absolute inset-0 flex items-center justify-center text-cyan-500 font-mono text-xs animate-pulse bg-black">
                  CONNECTING TO ORBITAL SATELLITE...
               </div>
            )}
          </div>
      </div>

      <div className="absolute bottom-6 left-6 z-20 pointer-events-none">
          <div className="flex items-center space-x-4 text-xs font-mono text-cyan-900">
             <Layers size={14} />
             <span>LAT: {project.geoCoordinates[0].toFixed(4)}</span>
             <span>LNG: {project.geoCoordinates[1].toFixed(4)}</span>
             <span>ZONE: RESTRICTED</span>
          </div>
      </div>

    </motion.div>
  );
};

export default CosmicMap;