
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ReplyModal from './components/ReplyModal';
import PublicForm from './components/PublicForm';
import UserLanding from './components/UserLanding';
import { LineRequest, ViewState } from './types';

const APP_CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbyZFth_laMfnFkWCWFX9Q03Q0WS7AyiCLfzbskCFNk6x4p2GFAZhHy1QJuDOcE8Dp3N/exec'
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>('user_landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [requests, setRequests] = useState<LineRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LineRequest | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  
  const gasUrl = APP_CONFIG.GAS_URL;

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
    if (!gasUrl) return;

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
      setError(`ไม่สามารถเชื่อมต่อข้อมูลได้: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [gasUrl]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAdminView = params.get('view') === 'admin';
    const isFormView = params.get('view') === 'form'; // ตรวจสอบว่ามาจาก Rich Menu หรือไม่
    const userIdFromUrl = params.get('userId');
    const savedUserId = localStorage.getItem('line_current_user_id');

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
    } else if (isFormView || effectiveUserId) {
      // ถ้ากำหนด view=form หรือมี userId อยู่แล้ว ให้ไปหน้าแบบฟอร์มทันใจ
      setViewState('public_form');
    } else {
      setViewState('user_landing');
    }

    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const uid = p.get('userId') || localStorage.getItem('line_current_user_id');
      const isForm = p.get('view') === 'form';
      
      if (isForm || uid) setViewState('public_form');
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
        <div className="flex justify-between items-end mb-4 px-2">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Admin Console</h2>
            <p className="text-slate-500 font-medium">จัดการคำขอและตอบกลับผู้ใช้ผ่าน LINE</p>
          </div>
          <button onClick={fetchRequests} disabled={isLoading} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold active:scale-95 hover:bg-slate-50 transition shadow-sm">
            {isLoading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
          </button>
        </div>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-2xl border border-red-100 font-bold mb-4">
            {error}
          </div>
        )}
        <Dashboard requests={requests} onReply={(req) => setSelectedRequest(req)} />
      </div>
      {selectedRequest && <ReplyModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onSubmit={async (reply) => {
        setIsLoading(true);
        try {
          const url = new URL(gasUrl);
          url.searchParams.append('action', 'reply');
          const response = await fetch(url.toString(), { 
            method: 'POST', 
            body: JSON.stringify({ action: 'reply', userId: selectedRequest.lineUserId, text: reply, messageId: selectedRequest.id, admin: currentUser }) 
          });
          if (!response.ok) throw new Error('Reply submission failed');
          await fetchRequests();
          setSelectedRequest(null);
        } catch (e) { alert('ไม่สามารถส่งคำตอบได้'); } finally { setIsLoading(false); }
      }} />}
    </Layout>
  );
};

export default App;
