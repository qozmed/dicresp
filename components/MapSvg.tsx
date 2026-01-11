import React from 'react';

interface MapSvgProps {
  className?: string;
}

const MapSvg: React.FC<MapSvgProps> = ({ className }) => {
  return (
    <img 
      /* 
         ВАЖНО: Положите ваш файл с именем 'map.svg' в папку public/ в корне проекта.
         Убедитесь, что в самом SVG файле линии уже покрашены в нужный цвет (например, #00F7FF),
         так как CSS color не применяется к тегу <img>.
      */
      src="/map.svg" 
      alt="Interactive Map Layer" 
      className={`${className} pointer-events-none select-none block`}
      style={{ 
        objectFit: 'contain',
        width: '100%', 
        height: '100%' 
      }}
      draggable={false}
    />
  );
};

export default MapSvg;