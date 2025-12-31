
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import InfoSection from './components/InfoSection';
import AdminDashboard from './components/AdminDashboard';
import { SiteConfig } from './types';
import { supabase } from './lib/supabase';

const INITIAL_CONFIG: SiteConfig = {
  headerLogoUrl: "https://i.ibb.co/k2Yn9STr/img-logo-ty1.png",
  headerProjectTitle: "다이렉트 플랫폼 고도화 구축",
  headerTopText: "Project Completion Report",
  heroBadge: "Project Completion Report 2025",
  heroTitle1: "현대해상 다이렉트\n디지털 혁신의 기록",
  heroTitle2: "보험의 본질은 지키고,\n경험의 가치는 새롭게 정의하다.",
  heroDesc1: "보험의 본질은 지키고,",
  heroDesc2: "경험의 가치는 새롭게 정의하다.",
  contentItems: [],
  adminPassword: "1234" // 초기 비밀번호
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');
  const [isLoggedIn, setIsLoggedIn] = useState(sessionStorage.getItem('admin_auth') === 'true');
  const [passwordInput, setPasswordInput] = useState('');
  const [footerLogoError, setFooterLogoError] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_configs')
          .select('config')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) {
          const fetchedConfig = data.config as SiteConfig;
          // DB에 비밀번호가 없으면 초기값 유지
          if (!fetchedConfig.adminPassword) {
            fetchedConfig.adminPassword = "1234";
          }
          setConfig(fetchedConfig);
        }
      } catch (err) {
        console.error('Supabase fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase
        .from('site_configs')
        .update({ config: newConfig, updated_at: new Date() })
        .eq('id', 1);

      if (error) throw error;
      
      setConfig(newConfig);
      alert('데이터가 클라우드 DB에 안전하게 저장되었습니다.');
    } catch (err) {
      console.error('Supabase save error:', err);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPassword = config.adminPassword || '1234';
    if (passwordInput === currentPassword) {
      setIsLoggedIn(true);
      sessionStorage.setItem('admin_auth', 'true');
      setPasswordInput('');
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('admin_auth');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-400">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center p-8 md:p-12 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#004a99]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">관리자 모드</h1>
            <p className="text-gray-400 mb-8 text-sm">접속 비밀번호를 입력해주세요.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Password"
                autoFocus
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-center tracking-widest font-bold"
              />
              <button 
                type="submit"
                className="w-full py-3 bg-[#004a99] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100"
              >
                접속하기
              </button>
            </form>
            
            <button 
              onClick={() => window.location.hash = ''}
              className="mt-6 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }
    return <AdminDashboard config={config} onSave={saveConfig} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        logoUrl={config.headerLogoUrl} 
        projectTitle={config.headerProjectTitle} 
        topText={config.headerTopText}
      />

      <section id="hero" className="relative h-screen flex items-center justify-center bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center z-10">
          <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#004a99] uppercase bg-blue-50 rounded-full">
            {config.heroBadge}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight whitespace-pre-line">
            {config.heroTitle1}
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-400 font-light leading-relaxed whitespace-pre-line">
            {config.heroTitle2}
          </p>
          <div className="mt-12 animate-bounce flex justify-center opacity-30">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7-7-7m14-8l-7 7-7-7" /></svg>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] border-[1px] border-gray-100 rounded-full -z-0"></div>
      </section>

      <main className="bg-white">
        {config.contentItems.length > 0 && <InfoSection items={config.contentItems} id="main-content" />}
      </main>

      <footer className="bg-white py-24 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-8 h-12">
            {!footerLogoError ? (
              <img src={config.headerLogoUrl} alt="로고" className="h-9 md:h-10 object-contain" onError={() => setFooterLogoError(true)} />
            ) : (
              <div className="text-[#004a99] font-bold text-2xl tracking-tighter">현대해상 <span className="text-[#ff6a00]">다이렉트</span></div>
            )}
          </div>
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 text-xs md:text-sm font-medium text-gray-400 relative">
            <span>현대해상화재보험(주) CM사업본부</span>
            <span className="hidden md:block w-px h-3 bg-gray-200"></span>
            <span>디지털 기획 및 구축 완료 보고서</span>
            <button onClick={() => window.location.hash = '#admin'} className="absolute -right-4 bottom-0 md:static opacity-10 hover:opacity-100 transition-opacity text-[10px] font-bold underline decoration-dotted ml-4">ADMIN</button>
          </div>
          <p className="text-[10px] text-gray-300 mt-16 tracking-[0.3em] uppercase">© 2025 Hyundai Marine & Fire Insurance Direct.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
