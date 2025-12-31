
import React, { useEffect, useRef, useState } from 'react';
import { SectionData } from '../types';

const InfoSection: React.FC<SectionData> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [subImageIndices, setSubImageIndices] = useState<number[]>(items.map(() => 0));

  // 드래그 상태 관리
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (top < 0 && Math.abs(top) < height) {
        const totalScrollableHeight = height - windowHeight;
        const progress = Math.abs(top) / totalScrollableHeight;
        const index = Math.min(
          Math.floor(progress * items.length),
          items.length - 1
        );
        setActiveItemIndex(index);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length]);

  // 이미지 변경 시 스크롤 위치 초기화
  useEffect(() => {
    const currentContainer = scrollContainerRefs.current[activeItemIndex];
    if (currentContainer) {
      currentContainer.scrollTop = 0;
    }
  }, [activeItemIndex, subImageIndices]);

  const handlePrevSubImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      next[activeItemIndex] = Math.max(0, next[activeItemIndex] - 1);
      return next;
    });
  };

  const handleNextSubImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      const maxIdx = items[activeItemIndex].images.length - 1;
      next[activeItemIndex] = Math.min(maxIdx, next[activeItemIndex] + 1);
      return next;
    });
  };

  // 드래그 이벤트 핸들러
  const onMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRefs.current[activeItemIndex];
    if (!container) return;
    setIsDragging(true);
    setStartY(e.pageY - container.offsetTop);
    setScrollTop(container.scrollTop);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRefs.current[activeItemIndex];
    if (!container) return;
    const y = e.pageY - container.offsetTop;
    const walk = (y - startY) * 1.5; // 스크롤 속도 조절
    container.scrollTop = scrollTop - walk;
  };

  const currentSubImageIndex = subImageIndices[activeItemIndex];
  const currentItemImages = items[activeItemIndex].images;

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${items.length * 150}vh` }} // 스크롤 감도를 위해 높이 상향 조정
    >
      <div className="sticky top-0 h-screen w-full flex flex-col md:flex-row items-center overflow-hidden max-w-7xl mx-auto px-6">
        
        {/* Left side: Text Content */}
        <div className="flex-1 md:w-[60%] w-full order-2 md:order-1 flex items-center h-full">
          <div className="relative w-full">
            {items.map((item, idx) => (
              <div
                key={idx}
                className={`transition-all duration-1000 ease-in-out w-full md:max-w-[85%] ${
                  idx === activeItemIndex 
                    ? 'opacity-100 visible translate-y-0 relative' 
                    : 'opacity-0 invisible absolute top-0 translate-y-10'
                }`}
              >
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-8 whitespace-pre-line">
                  {item.title}
                </h2>
                <div className="w-12 h-[2px] bg-[#004a99] mb-8"></div>
                <p className="text-xl md:text-2xl text-[#666666] leading-relaxed font-light whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Device Frame (Centered vertically) */}
        <div className="flex-1 w-full md:w-[40%] order-1 md:order-2 flex flex-col items-center justify-center h-full">
          <div className="flex flex-col items-center w-full mt-16">
            {/* Device Border */}
            <div className="relative w-full max-w-[260px] md:max-w-[310px] aspect-[9/19] bg-white rounded-[3rem] p-2 shadow-[0_40px_100px_rgba(0,0,0,0.15)] border-[8px] border-black overflow-hidden transition-transform duration-500">
              {/* Speaker/Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-30"></div>
              
              {/* Screen Content Container (Scrollable by Drag) */}
              <div 
                ref={(el) => { scrollContainerRefs.current[activeItemIndex] = el; }}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
                className={`relative w-full h-full overflow-y-auto rounded-[2.4rem] bg-gray-50 no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
              >
                <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                
                {items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx}
                    className={`absolute inset-0 transition-opacity duration-700 ${itemIdx === activeItemIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                  >
                    {item.images.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`absolute inset-0 w-full transition-all duration-500 transform ${
                          imgIdx === subImageIndices[itemIdx] ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Screen ${itemIdx}-${imgIdx}`}
                          className="w-full object-contain object-top"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-Image Navigation Controls */}
            <div className="flex items-center gap-6 mt-8 bg-gray-50/50 px-6 py-3 rounded-full border border-gray-100 shadow-sm backdrop-blur-sm">
              <button 
                onClick={handlePrevSubImage}
                disabled={currentSubImageIndex === 0}
                className={`p-2 rounded-full text-gray-400 hover:bg-white hover:text-gray-900 transition-all ${currentSubImageIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 shadow-sm border border-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>
              
              <div className="text-sm font-bold text-gray-900 tabular-nums flex items-center">
                <span className="text-[#004a99] w-4 text-center">{currentSubImageIndex + 1}</span>
                <span className="mx-2 text-gray-300">/</span>
                <span className="text-gray-400 w-4 text-center">{currentItemImages.length}</span>
              </div>

              <button 
                onClick={handleNextSubImage}
                disabled={currentSubImageIndex === currentItemImages.length - 1}
                className={`p-2 rounded-full text-gray-400 hover:bg-white hover:text-gray-900 transition-all ${currentSubImageIndex === currentItemImages.length - 1 ? 'opacity-20 cursor-not-allowed' : 'active:scale-90 shadow-sm border border-gray-100'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InfoSection;
