
import React from 'react';

interface UserLandingProps {
  onAdminClick: () => void;
  onOpenForm: () => void;
}

const UserLanding: React.FC<UserLandingProps> = ({ onAdminClick, onOpenForm }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-green-100">
      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-2xl shadow-lg flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Internal Support
          </h1>
        </div>
        <button 
          onClick={(e) => {
            e.preventDefault();
            onAdminClick();
          }}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-900 transition-all border-b-2 border-transparent hover:border-slate-900 pb-1"
        >
          Admin Portal
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          <div className="inline-block px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 mb-2">
            Employee Support System
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
            แจ้งบริการผ่าน LINE <br/> ง่ายและรวดเร็ว
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed pt-4">
            เชื่อมต่อระบบแจ้งซ่อมและบริการภายในเข้ากับ LINE Official Account <br className="hidden md:block"/>
            สะดวก รวดเร็ว ติดตามสถานะได้ทันใจ
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onOpenForm}
              className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition shadow-2xl active:scale-95 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              เข้าสู่แบบฟอร์มบริการ
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6 w-full mt-20 text-left">
          <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-slate-100/50 transition duration-500 group">
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl mb-6 group-hover:scale-110 transition duration-500">1</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">เพิ่มเพื่อนใน LINE</h3>
            <p className="text-slate-500 font-medium">สแกน QR Code เพื่อเพิ่มเพื่อนกับ LINE Official Account ของบริษัท</p>
          </div>
          <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:bg-slate-100/50 transition duration-500 group">
            <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center text-slate-900 font-black text-xl mb-6 group-hover:scale-110 transition duration-500">2</div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">รับลิงก์บริการ</h3>
            <p className="text-slate-500 font-medium">ระบบจะส่งลิงก์แบบฟอร์มให้ท่านทางแชท หรือกดปุ่มด้านบนเพื่อเข้าใช้งานได้ทันที</p>
          </div>
        </div>

        {/* QR Section */}
        <div className="mt-20 flex flex-col items-center">
          <div className="relative p-3 bg-gradient-to-tr from-green-500 to-green-300 rounded-[3rem] shadow-2xl">
            <div className="bg-white p-8 rounded-[2.5rem] border border-white/20">
              <div className="w-48 h-48 bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-200 border-2 border-dashed border-slate-200">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">SCAN TO ADD LINE</span>
              </div>
            </div>
          </div>
          <p className="mt-8 text-[11px] text-slate-300 uppercase font-black tracking-[0.4em] animate-pulse">Scan to start</p>
        </div>
      </div>

      <footer className="p-12 border-t mt-20 flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto w-full opacity-50">
        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
          &copy; 2024 Corporate Internal Logistics
        </p>
        <div className="flex gap-8">
          <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900 transition">Terms</span>
          <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900 transition">Privacy</span>
          <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-slate-900 transition">Support</span>
        </div>
      </footer>
    </div>
  );
};

export default UserLanding;
