
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
  contentItems: []
};

const App: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [loading, setLoading] = useState(true);
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [footerLogoError, setFooterLogoError] = useState(false);

  // URL Hash 감지 (라우팅 대용)
  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. 데이터 불러오기 (Supabase)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_configs')
          .select('config')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data) setConfig(data.config as SiteConfig);
      } catch (err) {
        console.error('Supabase fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
    
    // 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. 데이터 저장하기 (Supabase)
  const saveConfig = async (newConfig: SiteConfig) => {
    try {
      const { error } = await supabase
        .from('site_configs')
        .update({ config: newConfig, updated_at: new Date() })
        .eq('id', 1);

      if (error) throw error;
      
      setConfig(newConfig);
      alert('데이터가 클라우드 DB에 안전하게 저장되었습니다.');
      // 저장 후 사용자 화면으로 이동하고 싶을 경우: window.location.hash = '';
    } catch (err) {
      console.error('Supabase save error:', err);
      alert('저장 중 오류가 발생했습니다. 권한을 확인하세요.');
    }
  };

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname + '#admin'
      }
    });
    if (error) alert('로그인 중 오류 발생: ' + error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
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

  // 관리자 라우트일 때
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-12 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">관리자 로그인</h1>
            <p className="text-gray-500 mb-8 text-sm">시스템 수정을 위해 구글 계정으로 로그인해주세요.</p>
            <button 
              onClick={handleAdminLogin}
              className="w-full py-4 bg-[#004a99] text-white rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google로 로그인
            </button>
            <button 
              onClick={() => window.location.hash = ''}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }
    return <AdminDashboard config={config} onSave={saveConfig} onLogout={handleLogout} />;
  }

  // 사용자 화면
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
