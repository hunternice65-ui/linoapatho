
import React, { useState } from 'react';
import { CODE_GS } from '../services/gasCode';

const SetupGuide: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">คู่มือการติดตั้ง (v2.5)</h2>
        <p className="text-slate-500 mt-2">ขั้นตอนการเชื่อมต่อ Google Sheets และ LINE OA</p>
      </div>

      <div className="grid gap-6">
        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            เตรียม Google Sheets
          </h3>
          <div className="mt-4 space-y-3 text-slate-600 text-sm">
            <p>1. สร้าง Google Sheet ใหม่</p>
            <p>2. เปลี่ยนชื่อ Sheet แรกเป็น <code className="bg-slate-100 px-2 py-0.5 rounded font-bold text-green-700">Requests</code> (ตัวใหญ่ตัวเล็กต้องเป๊ะ)</p>
            <p>3. ระบบจะสร้างหัวตารางให้โดยอัตโนมัติในการรันครั้งแรก</p>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Deploy โค้ดลง Apps Script
            </h3>
            <button 
              onClick={() => copyToClipboard(CODE_GS, 'gs')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition flex items-center gap-2"
            >
              {copied === 'gs' ? 'คัดลอกสำเร็จ!' : 'คัดลอกโค้ด Code.gs'}
            </button>
          </div>

          <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-amber-800 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                จุดที่ต้องแก้ไขในโค้ด
              </h4>
              <ul className="list-disc list-inside space-y-1">
                <li>บรรทัด 13: <code>CHANNEL_ACCESS_TOKEN</code></li>
                <li>บรรทัด 14: <code>ADMIN_LINE_USER_IDS</code> (User ID ส่วนตัวขึ้นต้นด้วย U)</li>
                <li>บรรทัด 17: <code>MY_WEB_APP_URL</code> (ใส่ URL ของหน้าเว็บนี้เพื่อส่งลิงก์ใน LINE)</li>
              </ul>
            </div>

            <ol className="list-decimal list-inside space-y-3 ml-2">
              <li>ไปที่เมนู <strong>Extensions > Apps Script</strong></li>
              <li>ลบโค้ดเก่าออกและวางโค้ดที่คัดลอกไป</li>
              <li>กด <strong>Deploy > New Deployment</strong></li>
              <li>เลือก Type: <strong>Web App</strong></li>
              <li>ตั้งค่า Execute as: <strong>Me</strong> และ Who has access: <strong>Anyone</strong></li>
              <li>Copy <strong>Web App URL</strong> มาใส่ในช่องด้านบนของหน้านี้</li>
            </ol>
          </div>
        </section>

        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
            ตั้งค่า LINE Webhook
          </h3>
          <div className="mt-4 space-y-3 text-slate-600 text-sm">
            <p>1. นำ <strong>Web App URL</strong> เดียวกันไปใส่ใน LINE Developers Console</p>
            <p>2. ตรงหัวข้อ Messaging API > <strong>Webhook URL</strong></p>
            <p>3. เปิดสวิตช์ <strong>Use Webhook</strong> เป็น ON</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SetupGuide;
