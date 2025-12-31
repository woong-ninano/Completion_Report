
import React, { useState } from 'react';
import { SiteConfig, ContentItem } from '../types';
import { uploadImage } from '../lib/supabase';

interface AdminDashboardProps {
  config: SiteConfig;
  onSave: (config: SiteConfig) => void;
  onLogout: () => void;
}

/**
 * AdminDashboard component provides an interface for administrators to manage site configuration,
 * including text content and image uploads via Supabase.
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onSave, onLogout }) => {
  const [editConfig, setEditConfig] = useState<SiteConfig>(config);
  const [isUploading, setIsUploading] = useState(false);

  // Helper to update top-level config fields
  const handleConfigChange = (field: keyof SiteConfig, value: any) => {
    setEditConfig(prev => ({ ...prev, [field]: value }));
  };

  // Helper to update specific fields within a content item
  const handleItemChange = (index: number, field: keyof ContentItem, value: any) => {
    const newItems = [...editConfig.contentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    handleConfigChange('contentItems', newItems);
  };

  const handleAddItem = () => {
    const newItem: ContentItem = {
      title: '새 섹션 제목',
      description: '설명을 입력하세요.',
      images: []
    };
    handleConfigChange('contentItems', [...editConfig.contentItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editConfig.contentItems.filter((_, i) => i !== index);
    handleConfigChange('contentItems', newItems);
  };

  // Handles image selection and upload to Supabase storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemIndex?: number, imageIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      
      if (itemIndex !== undefined) {
        const newItems = [...editConfig.contentItems];
        if (imageIndex !== undefined) {
          // Replace existing image in the array
          newItems[itemIndex].images[imageIndex] = url;
        } else {
          // Append new image to the array
          newItems[itemIndex].images = [...newItems[itemIndex].images, url];
        }
        handleConfigChange('contentItems', newItems);
      } else {
        // Update header logo
        handleConfigChange('headerLogoUrl', url);
      }
    } catch (err) {
      alert('이미지 업로드 실패: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
          <div className="flex gap-4">
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
            >
              로그아웃
            </button>
            {/* Fix: Added the button from the original snippet with all required variable bindings */}
            <button 
              disabled={isUploading}
              onClick={() => onSave(editConfig)} 
              className={`px-8 py-2 bg-[#004a99] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              설정 저장하기
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Site-wide Settings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">기본 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">로고 URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editConfig.headerLogoUrl} 
                    onChange={(e) => handleConfigChange('headerLogoUrl', e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  />
                  <label className="px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 text-xs flex items-center">
                    파일 업로드
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e)} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">프로젝트 타이틀</label>
                <input 
                  type="text" 
                  value={editConfig.headerProjectTitle} 
                  onChange={(e) => handleConfigChange('headerProjectTitle', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero 제목 1 (줄바꿈 가능)</label>
                <textarea 
                  value={editConfig.heroTitle1} 
                  onChange={(e) => handleConfigChange('heroTitle1', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-20"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero 제목 2</label>
                <textarea 
                  value={editConfig.heroTitle2} 
                  onChange={(e) => handleConfigChange('heroTitle2', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">관리자 비밀번호</label>
                <input 
                  type="text" 
                  value={editConfig.adminPassword} 
                  onChange={(e) => handleConfigChange('adminPassword', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Content Sections */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">콘텐츠 섹션 관리</h2>
              <button 
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-50 text-[#004a99] font-bold rounded-lg hover:bg-blue-100 transition-all text-sm"
              >
                + 새 섹션 추가
              </button>
            </div>

            <div className="space-y-8">
              {editConfig.contentItems.map((item, idx) => (
                <div key={idx} className="p-6 bg-gray-50 rounded-xl relative border border-gray-200">
                  <button 
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600 font-bold text-xs"
                  >
                    삭제
                  </button>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">섹션 제목</label>
                      <input 
                        type="text" 
                        value={item.title} 
                        onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">섹션 설명</label>
                      <textarea 
                        value={item.description} 
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm h-24"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">스크린샷 이미지 ({item.images.length})</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {item.images.map((img, imgIdx) => (
                          <div key={imgIdx} className="relative group aspect-[9/16] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity">
                              <label className="p-1 bg-white rounded cursor-pointer text-[10px] font-bold text-gray-900">
                                교체
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, idx, imgIdx)} />
                              </label>
                              <button 
                                onClick={() => {
                                  const newImages = item.images.filter((_, i) => i !== imgIdx);
                                  handleItemChange(idx, 'images', newImages);
                                }}
                                className="p-1 bg-red-500 text-white rounded text-[10px] font-bold"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        ))}
                        <label className="aspect-[9/16] bg-white border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                          <span className="text-2xl text-gray-300">+</span>
                          <span className="text-[10px] font-bold text-gray-400">이미지 추가</span>
                          <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, idx)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {editConfig.contentItems.length === 0 && (
                <div className="py-12 text-center text-gray-400 text-sm">등록된 섹션이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
