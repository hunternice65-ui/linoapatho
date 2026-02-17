
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user?: string;
  onLogout?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, setActiveTab }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-green-500 w-3 h-3 rounded-full"></span>
            LINE Internal
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </button>
        </nav>

        {user && (
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                {user.charAt(0).toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <p className="text-sm font-medium">{user}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-2 bg-slate-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-sm transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
          <h1 className="text-lg font-bold">LINE Manager</h1>
        </header>

        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
