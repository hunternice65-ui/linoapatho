
import React, { useState, useEffect } from 'react';
import { LineRequest } from '../types';

interface PublicFormProps {
  gasUrl: string;
  onBack: () => void;
}

const PublicForm: React.FC<PublicFormProps> = ({ gasUrl, onBack }) => {
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [userRequests, setUserRequests] = useState<LineRequest[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [formData, setFormData] = useState({ subject: '', contact: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const fetchUserHistory = async (uid: string) => {
    if (!gasUrl || gasUrl.includes('REPLACE')) return;
    setIsLoadingHistory(true);
    try {
      const url = new URL(gasUrl);
      url.searchParams.append('action', 'getUserRequests');
      url.searchParams.append('userId', uid);
      url.searchParams.append('_t', Date.now().toString());
      const response = await fetch(url.toString());
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserRequests(data);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uidFromUrl = params.get('userId');
    const uidFromStore = localStorage.getItem('line_current_user_id');
    
    const finalUid = uidFromUrl || uidFromStore;
    
    if (finalUid) {
      setLineUserId(finalUid);
      localStorage.setItem('line_current_user_id', finalUid);
      fetchUserHistory(finalUid);
    }
  }, [gasUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasUrl) {
      setError('ระบบยังไม่พร้อมใช้งาน');
      return;
    }
    setIsSubmitting(true);
    setError('');
    
    try {
      // ดึง UID ล่าสุดอีกครั้งเพื่อความชัวร์
      const currentUid = lineUserId || localStorage.getItem('line_current_user_id') || 'DIRECT_WEB_USER';
      
      const response = await fetch(`${gasUrl}?action=submitForm`, {
        method: 'POST',
        body: JSON.stringify({
          action: 'submitForm',
          lineUserId: currentUid,
          ...formData
        })
      });
      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        if (currentUid !== 'DIRECT_WEB_USER') fetchUserHistory(currentUid);
        setFormData({ subject: '', contact: '', message: '' });
        
        // เลื่อนหน้าจอขึ้นไปบนสุดเพื่อดูข้อความแจ้งเตือน
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else { 
        throw new Error(result.error || 'ส่งข้อมูลไม่สำเร็จ'); 
      }
    } catch (err: any) { 
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900">ส่งข้อมูลสำเร็จ!</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            เราได้รับข้อมูลของคุณแล้ว ระบบได้ส่งข้อความยืนยันไปที่ LINE ของคุณเรียบร้อย
          </p>
          <div className="pt-4 space-y-3">
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition"
            >
              แจ้งเรื่องอื่นเพิ่มเติม
            </button>
            <button 
              onClick={onBack}
              className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition"
            >
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 selection:bg-green-100">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            หน้าหลัก
          </button>
          <div className={`px-3 py-1 text-[9px] font-black rounded-full uppercase ${lineUserId && lineUserId !== 'DIRECT_WEB_USER' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            {lineUserId && lineUserId !== 'DIRECT_WEB_USER' ? 'LINE CONNECTED' : 'GUEST MODE'}
          </div>
        </div>
        
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <h1 className="text-2xl font-black relative z-10">แจ้งขอรับบริการ</h1>
            <p className="opacity-60 text-[10px] mt-1 font-mono uppercase tracking-widest relative z-10">Internal Support Portal</p>
            <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 font-bold">{error}</div>}
            
            {!lineUserId || lineUserId === 'DIRECT_WEB_USER' ? (
              <div className="p-4 bg-amber-50 text-amber-700 text-[11px] rounded-2xl border border-amber-100 mb-2 leading-relaxed">
                <span className="font-black uppercase block mb-1">⚠️ คำแนะนำ</span>
                คุณกำลังใช้งานในโหมดทั่วไป เพื่อให้ได้รับการแจ้งเตือนสถานะผ่าน LINE กรุณาเปิดแอปผ่านแชทของ LINE OA โดยตรง
              </div>
            ) : null}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">หัวข้อ</label>
              <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition text-sm font-medium" placeholder="เช่น แจ้งซ่อมคอมพิวเตอร์, ขอใช้อุปกรณ์" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">เบอร์โทรศัพท์ / ชื่อผู้แจ้ง</label>
              <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition text-sm font-medium" placeholder="ระบุข้อมูลติดต่อเพื่อความรวดเร็ว" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">รายละเอียดเพิ่มเติม</label>
              <textarea rows={3} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 transition text-sm font-medium" placeholder="อธิบายความต้องการของคุณ..."></textarea>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  กำลังส่งข้อมูล...
                </span>
              ) : 'ส่งข้อมูลถึงเจ้าหน้าที่'}
            </button>
          </form>
        </div>

        {lineUserId && lineUserId !== 'DIRECT_WEB_USER' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">ประวัติการแจ้งของฉัน</h3>
              {isLoadingHistory && <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>}
            </div>

            <div className="space-y-3">
              {userRequests.map((req) => (
                <div key={req.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${req.status === 'replied' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {req.status === 'replied' ? 'เรียบร้อยแล้ว' : 'รอเจ้าหน้าที่'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-2">{req.subject}</h4>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 italic">"{req.message}"</p>
                  
                  {req.status === 'replied' && (
                    <div className="mt-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-black text-blue-700 uppercase mb-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
                        ตอบกลับจากเจ้าหน้าที่:
                      </p>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed">{req.reply}</p>
                      <p className="text-[9px] text-slate-400 mt-2">โดย {req.assignedTo} • {new Date(req.repliedAt!).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
              ))}
              {!isLoadingHistory && userRequests.length === 0 && (
                <div className="text-center py-10 bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-bold">ไม่พบประวัติการแจ้งบริการ</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicForm;
