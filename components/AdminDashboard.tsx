
import React, { useState } from 'react';
import { SiteConfig, ContentItem } from '../types';
import { uploadImage } from '../lib/supabase';

interface AdminDashboardProps {
  config: SiteConfig;
  onSave: (newConfig: SiteConfig) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onSave, onLogout }) => {
  const [editConfig, setEditConfig] = useState<SiteConfig>(config);
  const [isUploading, setIsUploading] = useState(false);
  const [showPwdChange, setShowPwdChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'itemImage', itemIdx?: number, imgIdx?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기가 너무 큽니다. (최대 10MB)');
      return;
    }

    try {
      setIsUploading(true);
      const publicUrl = await uploadImage(file);
      
      if (type === 'logo') {
        setEditConfig(prev => ({ ...prev, headerLogoUrl: publicUrl }));
      } else if (type === 'itemImage' && itemIdx !== undefined && imgIdx !== undefined) {
        const newItems = [...editConfig.contentItems];
        newItems[itemIdx].images[imgIdx] = publicUrl;
        setEditConfig(prev => ({ ...prev, contentItems: newItems }));
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      alert('파일 업로드 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
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
        { title: '새 섹션 타이틀', description: '내용을 입력하세요.', images: [""] }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (window.confirm("정말 이 섹션을 삭제하시겠습니까?")) {
      const newItems = editConfig.contentItems.filter((_, i) => i !== index);
      setEditConfig(prev => ({ ...prev, contentItems: newItems }));
    }
  };

  const addImageField = (itemIdx: number) => {
    const newItems = [...editConfig.contentItems];
    newItems[itemIdx].images.push("");
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  const removeImageField = (itemIdx: number, imgIdx: number) => {
    const newItems = [...editConfig.contentItems];
    newItems[itemIdx].images = newItems[itemIdx].images.filter((_, i) => i !== imgIdx);
    setEditConfig(prev => ({ ...prev, contentItems: newItems }));
  };

  const changePassword = () => {
    if (!newPassword.trim()) return alert('새 비밀번호를 입력해주세요.');
    setEditConfig(prev => ({ ...prev, adminPassword: newPassword }));
    setNewPassword('');
    setShowPwdChange(false);
    alert('비밀번호가 변경되었습니다. 상단의 [설정 저장하기] 버튼을 눌러야 최종 반영됩니다.');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-24 px-6 overflow-y-auto text-[#333]">
      <div className="max-w-4xl mx-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 flex flex-col gap-4 mb-10 py-4 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-[#004a99]">시스템</span> 관리자
              {isUploading && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                  <span className="text-xs font-bold text-blue-500 uppercase">Uploading</span>
                </div>
              )}
            </h1>
            <div className="flex gap-3">
              <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">로그아웃</button>
              <button 
                disabled={isUploading}
                onClick={() => onSave(editConfig)} 
                className={`px-8 py-2 bg-[#004a99] text-white font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-200/50 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                설정 저장하기
              </button>
            </div>
          </div>
        </div>

        {/* Basic Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> 기본 시스템 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">로고 이미지</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200 overflow-hidden shrink-0">
                  {editConfig.headerLogoUrl ? (
                    <img src={editConfig.headerLogoUrl} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="text-[10px] text-gray-300">No Image</div>
                  )}
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileUpload(e, 'logo')} 
                  className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">프로젝트명</label>
              <input name="headerProjectTitle" value={editConfig.headerProjectTitle} onChange={handleInputChange} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-600">뱃지 텍스트</label>
              <input name="heroBadge" value={editConfig.heroBadge} onChange={handleInputChange} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="text-sm font-bold text-gray-600">메인 히어로 타이틀 (\n 개행 가능)</label>
              <textarea name="heroTitle1" value={editConfig.heroTitle1} onChange={handleInputChange} rows={2} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all font-bold resize-none" />
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="text-sm font-bold text-gray-600">히어로 서브 설명</label>
              <textarea name="heroTitle2" value={editConfig.heroTitle2} onChange={handleInputChange} rows={2} className="border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all resize-none" />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> 상세 컨텐츠 구성
            </h2>
            <button onClick={addItem} className="px-6 py-2 bg-orange-50 text-orange-600 font-bold rounded-xl hover:bg-orange-100 transition-all text-sm">+ 섹션 추가</button>
          </div>

          <div className="space-y-12">
            {editConfig.contentItems.map((item, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-2xl relative group border border-gray-100 hover:border-blue-200 transition-all">
                <div className="absolute -top-3 left-6 px-4 py-1.5 bg-[#004a99] text-white text-[10px] font-black rounded-full shadow-lg z-10 tracking-widest uppercase">
                  Section {(idx + 1).toString().padStart(2, '0')}
                </div>

                <button onClick={() => removeItem(idx)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <div className="flex flex-col gap-6 mt-2">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">타이틀</label>
                      <input 
                        value={item.title} 
                        onChange={(e) => handleItemChange(idx, 'title', e.target.value)} 
                        placeholder="섹션의 제목을 입력하세요."
                        className="text-xl font-bold bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">상세 설명</label>
                      <textarea 
                        value={item.description} 
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                        placeholder="구축 결과나 특징을 설명해주세요."
                        className="bg-white border border-gray-200 rounded-xl px-4 py-3 h-28 outline-none focus:border-blue-500 resize-none transition-all leading-relaxed" 
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">디바이스 이미지 업로드</label>
                      <button onClick={() => addImageField(idx)} className="text-xs text-[#004a99] font-bold hover:underline px-3 py-1 bg-blue-50 rounded-lg">+ 이미지 추가</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3 group/img transition-all hover:shadow-md">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-gray-300">IMAGE {imgIdx + 1}</span>
                            <button onClick={() => removeImageField(idx, imgIdx)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                          <div className="h-32 w-full bg-gray-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center border border-gray-50">
                            {img ? (
                              <img src={img} className="h-full w-full object-contain" />
                            ) : (
                              <div className="text-[10px] text-gray-300 font-medium">이미지 없음</div>
                            )}
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, 'itemImage', idx, imgIdx)}
                            className="text-[10px] w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Password Change Section */}
        <div className="mt-20 flex flex-col items-center gap-4">
          {showPwdChange && (
            <div className="bg-orange-50 p-6 rounded-2xl shadow-xl border border-orange-100 flex flex-col md:flex-row items-center gap-4 animate-in slide-in-from-bottom-4 duration-300 w-full max-w-lg mb-4">
              <div className="flex items-center gap-4 flex-1 w-full">
                <span className="text-sm font-bold text-orange-900 shrink-0">새 암호:</span>
                <input 
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새로운 비밀번호 입력"
                  className="flex-1 border border-orange-200 rounded-lg px-4 py-2 outline-none focus:border-orange-500 text-sm"
                />
                <button 
                  onClick={changePassword}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors shadow-sm shrink-0"
                >
                  변경
                </button>
              </div>
              <button onClick={() => setShowPwdChange(false)} className="text-orange-400 p-2 hover:text-orange-600 self-end md:self-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setShowPwdChange(!showPwdChange)}
            className="text-[10px] text-gray-300 underline decoration-dotted font-bold px-4 py-2 opacity-10 hover:opacity-100 transition-opacity"
          >
            ADMIN_SECURITY_SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
