
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReplyModal from './components/ReplyModal';
import SetupGuide from './components/SetupGuide';
import PublicForm from './components/PublicForm';
import UserLanding from './components/UserLanding';
import { LineRequest, ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('user_landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<LineRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LineRequest | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  const [gasUrl, setGasUrl] = useState(() => {
    return localStorage.getItem('line_gas_url') || '';
  });

  const navigateTo = (view: ViewState, params: Record<string, string> = {}) => {
    setViewState(view);
    const url = new URL(window.location.href);
    const newSearchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, val]) => newSearchParams.set(key, val));
    
    const currentUserId = new URLSearchParams(window.location.search).get('userId') || localStorage.getItem('line_current_user_id');
    if (currentUserId && !newSearchParams.has('userId')) {
      newSearchParams.set('userId', currentUserId);
    }

    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
    
    if (view === 'dashboard' || (view === 'login' && currentUser)) {
      fetchRequests();
    }
  };

  const fetchRequests = useCallback(async () => {
    if (!gasUrl || gasUrl.includes('REPLACE') || !gasUrl.startsWith('http')) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const url = new URL(gasUrl);
      url.searchParams.append('action', 'getRequests');
      url.searchParams.append('_t', Date.now().toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        mode: 'cors',
        redirect: 'follow'
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(`ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [gasUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAdminView = params.get('view') === 'admin';
    const userIdFromUrl = params.get('userId');
    const savedUserId = localStorage.getItem('line_current_user_id');

    // ถ้าเจอ userId ใน URL ให้จำไว้ทันที
    if (userIdFromUrl) {
      localStorage.setItem('line_current_user_id', userIdFromUrl);
    }

    const effectiveUserId = userIdFromUrl || savedUserId;

    if (isAdminView) {
      const savedAdmin = localStorage.getItem('line_admin_user');
      if (savedAdmin) {
        setCurrentUser(savedAdmin);
        setViewState('dashboard');
        fetchRequests();
      } else {
        setViewState('login');
      }
    } else if (effectiveUserId) {
      // ถ้าเป็นเพื่อนแล้ว (มี userId) ให้ไปหน้าแบบฟอร์มเลย
      setViewState('public_form');
    } else {
      setViewState('user_landing');
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const uid = p.get('userId') || localStorage.getItem('line_current_user_id');
      if (uid) setViewState('public_form');
      else if (p.get('view') === 'admin') setViewState(localStorage.getItem('line_admin_user') ? 'dashboard' : 'login');
      else setViewState('user_landing');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [fetchRequests]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'password') {
      setCurrentUser(loginForm.username);
      localStorage.setItem('line_admin_user', loginForm.username);
      navigateTo('dashboard', { view: 'admin' });
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('line_admin_user');
    navigateTo('login', { view: 'admin' });
  };

  const saveGasUrl = (url: string) => {
    const cleanUrl = url.trim();
    setGasUrl(cleanUrl);
    localStorage.setItem('line_gas_url', cleanUrl);
  };

  if (viewState === 'user_landing') {
    return <UserLanding onAdminClick={() => navigateTo('login', { view: 'admin' })} onOpenForm={() => navigateTo('public_form')} />;
  }

  if (viewState === 'public_form') {
    return <PublicForm gasUrl={gasUrl} onBack={() => navigateTo('user_landing')} />;
  }

  if (viewState === 'login') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-slate-900">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            {error && <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl text-center font-bold">{error}</div>}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Username</label>
              <input type="text" value={loginForm.username} onChange={(e) => setLoginForm({...loginForm, username: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="admin" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
              <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95">เข้าสู่ระบบ Dashboard</button>
            <button type="button" onClick={() => navigateTo('user_landing')} className="w-full text-slate-400 text-xs mt-6 font-bold uppercase tracking-wider">← กลับหน้าหลักสำหรับพนักงาน</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser || undefined} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="flex flex-col gap-6">
        {activeTab === 'setup' ? (
          <div className="space-y-6">
            <section className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-2xl font-black mb-2">Configure Web App URL</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" value={gasUrl} onChange={(e) => saveGasUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" className="flex-1 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 outline-none text-white text-sm" />
                <button onClick={fetchRequests} className="bg-white text-indigo-600 px-10 py-4 rounded-2xl text-sm font-black shadow-lg">Save & Sync</button>
              </div>
            </section>
            <SetupGuide />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-4 px-2">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h2>
                <p className="text-slate-500 font-medium">จัดการคำขอและตอบกลับผู้ใช้ผ่าน LINE</p>
              </div>
              <button onClick={fetchRequests} disabled={isLoading} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold active:scale-95">{isLoading ? 'Loading...' : 'Refresh Data'}</button>
            </div>
            <Dashboard requests={requests} onReply={(req) => setSelectedRequest(req)} />
          </>
        )}
      </div>
      {selectedRequest && <ReplyModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onSubmit={async (reply) => {
        setIsLoading(true);
        try {
          const url = new URL(gasUrl);
          url.searchParams.append('action', 'reply');
          await fetch(url.toString(), { method: 'POST', body: JSON.stringify({ action: 'reply', userId: selectedRequest.lineUserId, text: reply, messageId: selectedRequest.id, admin: currentUser }) });
          await fetchRequests();
          setSelectedRequest(null);
        } catch (e) { alert('ไม่สามารถส่งคำตอบได้'); } finally { setIsLoading(false); }
      }} />}
    </Layout>
  );
};

export default App;
