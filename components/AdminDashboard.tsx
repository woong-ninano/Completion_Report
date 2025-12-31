
import React, { useState } from 'react';
import { SiteConfig, ContentItem } from '../types';

interface AdminDashboardProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onSave, onLogout }) => {
  const [editConfig, setEditConfig] = useState<SiteConfig>(config);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof ContentItem, value: any) => {
    const newItems = [...editConfig.contentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  const addItem = () => {
    setEditConfig(prev => ({
      ...prev,
      contentItems: [
        ...prev.contentItems,
        { title: '새 섹션 타이틀', description: '내용을 입력하세요.', images: [] }
      ]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = editConfig.contentItems.filter((_, i) => i !== index);
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  const handleImageChange = (itemIdx: number, imgIdx: number, value: string) => {
    const newItems = [...editConfig.contentItems];
    newItems[itemIdx].images[imgIdx] = value;
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  const addImageField = (itemIdx: number) => {
    const newItems = [...editConfig.contentItems];
    newItems[itemIdx].images.push("");
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">시스템 관리자</h1>
          <div className="flex gap-4">
            <button onClick={onLogout} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">로그아웃</button>
            <button onClick={() => onSave(editConfig)} className="px-6 py-2 bg-[#004a99] text-white font-bold rounded-lg hover:bg-blue-800 transition-colors shadow-lg">설정 저장하기</button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> 상단 및 히어로 섹션
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">로고 이미지 URL</label>
              <input name="headerLogoUrl" value={editConfig.headerLogoUrl} onChange={handleInputChange} className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">우측 상단 프로젝트명</label>
              <input name="headerProjectTitle" value={editConfig.headerProjectTitle} onChange={handleInputChange} className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-gray-600">히어로 뱃지 텍스트</label>
              <input name="heroBadge" value={editConfig.heroBadge} onChange={handleInputChange} className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-600">히어로 타이틀 (줄바꿈 \n 사용)</label>
              <input name="heroTitle1" value={editConfig.heroTitle1} onChange={handleInputChange} className="border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500 font-bold" />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-600">히어로 설명문 1</label>
              <textarea name="heroDesc1" value={editConfig.heroDesc1} onChange={handleInputChange} className="border border-gray-200 rounded-lg px-4 py-2 h-20 outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
        </div>

        {/* Content Items Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> 컨텐츠 섹션 관리
            </h2>
            <button onClick={addItem} className="px-4 py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors text-sm">+ 섹션 추가</button>
          </div>

          <div className="space-y-12">
            {editConfig.contentItems.map((item, idx) => (
              <div key={idx} className="p-6 bg-gray-50 rounded-xl relative group border border-transparent hover:border-gray-200 transition-all">
                <button onClick={() => removeItem(idx)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">삭제</button>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-4">
                    <input 
                      value={item.title} 
                      placeholder="섹션 타이틀 (줄바꿈 \n 가능)" 
                      onChange={(e) => handleItemChange(idx, 'title', e.target.value)} 
                      className="text-lg font-bold bg-white border border-gray-200 rounded-lg px-4 py-2 outline-none focus:border-blue-500" 
                    />
                    <textarea 
                      value={item.description} 
                      placeholder="주요 설명" 
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 h-24 outline-none focus:border-blue-500 resize-none" 
                    />
                    <textarea 
                      value={item.subDescription || ''} 
                      placeholder="보조 설명 (선택사항)" 
                      onChange={(e) => handleItemChange(idx, 'subDescription', e.target.value)} 
                      className="bg-white border border-gray-200 rounded-lg px-4 py-2 h-20 outline-none focus:border-blue-500 resize-none text-sm" 
                    />
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">이미지 리스트</label>
                    <div className="grid grid-cols-1 gap-2">
                      {item.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="flex gap-2">
                          <input 
                            value={img} 
                            placeholder={`이미지 URL ${imgIdx + 1}`}
                            onChange={(e) => handleImageChange(idx, imgIdx, e.target.value)}
                            className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-500" 
                          />
                        </div>
                      ))}
                      <button onClick={() => addImageField(idx)} className="text-xs text-blue-500 font-bold hover:underline self-start">+ 이미지 추가</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
