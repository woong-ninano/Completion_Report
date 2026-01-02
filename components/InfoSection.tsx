
import React, { useEffect, useRef, useState } from 'react';
import { SectionData } from '../types';

const InfoSection: React.FC<SectionData> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [subImageIndices, setSubImageIndices] = useState<number[]>(items.map(() => 0));

  // 드래그 상태 관리 (데스크톱 전용)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || window.innerWidth < 768) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (top <= 0 && Math.abs(top) < height - windowHeight) {
        const totalScrollableHeight = height - windowHeight;
        const progress = Math.abs(top) / totalScrollableHeight;
        
        const index = Math.min(
          Math.floor(progress * items.length),
          items.length - 1
        );
        
        if (index !== activeItemIndex) {
          setActiveItemIndex(index);
        }
      } else if (top > 0) {
        setActiveItemIndex(0);
      } else {
        setActiveItemIndex(items.length - 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [items.length, activeItemIndex]);

  const handlePrevSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      next[idx] = Math.max(0, next[idx] - 1);
      return next;
    });
  };

  const handleNextSubImage = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setSubImageIndices(prev => {
      const next = [...prev];
      const maxIdx = items[idx].images.length - 1;
      next[idx] = Math.min(maxIdx, next[idx] + 1);
      return next;
    });
  };

  const onMouseDown = (e: React.MouseEvent, idx: number) => {
    if (window.innerWidth < 768) return;
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    setIsDragging(true);
    setStartY(e.pageY - container.offsetTop);
    setScrollTop(container.scrollTop);
  };

  const onMouseMove = (e: React.MouseEvent, idx: number) => {
    if (!isDragging || window.innerWidth < 768) return;
    e.preventDefault();
    const container = scrollContainerRefs.current[idx];
    if (!container) return;
    const y = e.pageY - container.offsetTop;
    const walk = (y - startY) * 1.5;
    container.scrollTop = scrollTop - walk;
  };

  return (
    <div className="w-full">
      {/* --- 모바일 레이아웃 (768px 미만): 스크롤리텔링 제거 및 순차 나열 --- */}
      <div className="block md:hidden bg-white w-full">
        {items.map((item, idx) => (
          <div key={idx} className="px-6 py-12 border-b border-gray-50 last:border-0 flex flex-col gap-8">
            {/* 문구 영역 */}
            <div className="w-full">
              <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-2">Section {(idx + 1).toString().padStart(2, '0')}</div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-4 whitespace-pre-line">
                {item.title}
              </h2>
              <div className="w-8 h-[2px] bg-[#004a99] mb-4"></div>
              <p className="text-base text-[#666666] leading-relaxed font-light whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* 이미지 영역: 프레임 테두리에 완전 밀착 (상단/좌우 여백 제거) */}
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-[260px] aspect-[9/19] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border-[6px] border-black overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-2xl z-30"></div>
                
                {/* Screen Content: p-0으로 여백 제거 */}
                <div className="relative w-full h-full bg-gray-50 overflow-hidden">
                   {item.images.map((img, imgIdx) => (
                      <div
                        key={imgIdx}
                        className={`absolute inset-0 w-full transition-all duration-500 ${
                          imgIdx === subImageIndices[idx] ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${item.title} ${imgIdx}`} 
                          className="w-full h-full object-cover object-top" 
                        />
                      </div>
                    ))}
                </div>
              </div>
              
              {/* 이미지 전환 페이징 버튼 */}
              {item.images.length > 1 && (
                <div className="flex items-center gap-6 mt-6 bg-gray-50/80 px-4 py-2 rounded-full border border-gray-100">
                  <button onClick={(e) => handlePrevSubImage(e, idx)} disabled={subImageIndices[idx] === 0} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <span className="text-[10px] font-bold text-gray-900">{subImageIndices[idx] + 1} / {item.images.length}</span>
                  <button onClick={(e) => handleNextSubImage(e, idx)} disabled={subImageIndices[idx] === item.images.length - 1} className="p-1 disabled:opacity-10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- 데스크톱 레이아웃 (768px 이상): 기존 스크롤리텔링 유지 --- */}
      <div 
        ref={containerRef}
        className="hidden md:block relative w-full"
        style={{ height: `${items.length * 100}vh` }}
      >
        <div className="sticky top-0 h-screen w-full flex flex-row items-center overflow-hidden max-w-7xl mx-auto px-6">
          <div className="flex-[1.2] w-[60%] flex items-center h-full">
            <div className="relative w-full">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`transition-all duration-700 ease-out w-full max-w-[85%] ${
                    idx === activeItemIndex 
                      ? 'opacity-100 visible translate-y-0 relative' 
                      : 'opacity-0 invisible absolute top-0 translate-y-8'
                  }`}
                >
                  <div className="text-[#004a99] font-black text-[10px] tracking-widest uppercase mb-4">Section {(idx + 1).toString().padStart(2, '0')}</div>
                  <h2 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900 mb-6 whitespace-pre-line">
                    {item.title}
                  </h2>
                  <div className={`w-12 h-[3px] bg-[#004a99] mb-8 transition-all duration-700 delay-100 ${idx === activeItemIndex ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}></div>
                  <p className="text-2xl text-[#666666] leading-relaxed font-light whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-[40%] flex flex-col items-center justify-center h-full">
            <div className="flex flex-col items-center w-full">
              {/* PC 프레임에서도 p-0으로 여백 제거 */}
              <div className="relative w-full max-w-[300px] aspect-[9/19] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.12)] border-[8px] border-black overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-b-2xl z-30"></div>
                <div 
                  ref={(el) => { scrollContainerRefs.current[activeItemIndex] = el; }}
                  onMouseDown={(e) => onMouseDown(e, activeItemIndex)}
                  onMouseLeave={() => setIsDragging(false)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseMove={(e) => onMouseMove(e, activeItemIndex)}
                  className={`relative w-full h-full overflow-y-auto rounded-[2.4rem] bg-gray-50 no-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                  style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
                >
                  <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                  {items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx}
                      className={`absolute inset-0 transition-opacity duration-500 ${itemIdx === activeItemIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                      {item.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={`absolute inset-0 w-full transition-all duration-500 transform ${
                            imgIdx === subImageIndices[itemIdx] ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                          }`}
                        >
                          {/* PC에서도 object-cover와 object-top으로 폭 밀착 노출 */}
                          <img 
                            src={img} 
                            alt={`Screen ${itemIdx}-${imgIdx}`} 
                            className="w-full h-full object-cover object-top" 
                            draggable={false} 
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 mt-8 bg-white/80 px-5 py-2.5 rounded-full border border-gray-100 shadow-sm backdrop-blur-md">
                <button onClick={(e) => handlePrevSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === 0} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="text-xs font-bold text-gray-900 tabular-nums">
                  <span className="text-[#004a99]">{subImageIndices[activeItemIndex] + 1}</span>
                  <span className="mx-2 text-gray-200">/</span>
                  <span className="text-gray-400">{items[activeItemIndex]?.images.length}</span>
                </div>
                <button onClick={(e) => handleNextSubImage(e, activeItemIndex)} disabled={subImageIndices[activeItemIndex] === (items[activeItemIndex]?.images.length - 1)} className="p-1.5 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;
