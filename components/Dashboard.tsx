
import React, { useState } from 'react';
import { LineRequest } from '../types';

interface DashboardProps {
  requests: LineRequest[];
  onReply: (request: LineRequest) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ requests, onReply }) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'replied'>('all');

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const stats = {
    total: requests.length,
    new: requests.filter(r => r.status === 'new').length,
    replied: requests.filter(r => r.status === 'replied').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Request Overview</h2>
          <p className="text-slate-500 text-sm">จัดการคำขอจาก LINE และ แบบฟอร์มออนไลน์</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border shadow-sm self-start">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
          <button onClick={() => setFilter('new')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'new' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>New ({stats.new})</button>
          <button onClick={() => setFilter('replied')} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'replied' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Replied</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Requests</p>
          <p className="text-3xl font-black mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-black mt-1 text-green-600">{stats.new}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-black mt-1 text-blue-600">{stats.replied}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source / Date</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User / Subject</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      {req.source === 'line' ? (
                        <span className="bg-green-100 text-green-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">LINE</span>
                      ) : (
                        <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">Form</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">{new Date(req.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{req.subject || 'No Subject'}</div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[150px] font-mono">{req.lineUserId.substring(0, 10)}...</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{req.message}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      req.status === 'new' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {req.status === 'new' ? 'New' : 'Replied'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onReply(req)} className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4"/></svg>
                      <p className="text-sm italic font-medium">ไม่พบรายการข้อมูลในขณะนี้</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
