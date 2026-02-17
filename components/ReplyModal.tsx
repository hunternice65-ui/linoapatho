
import React, { useState } from 'react';
import { LineRequest } from '../types';

interface ReplyModalProps {
  request: LineRequest;
  onClose: () => void;
  onSubmit: (reply: string) => void;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ request, onClose, onSubmit }) => {
  const [replyText, setReplyText] = useState(request.reply || '');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setIsSending(true);
    // Simulate API call
    setTimeout(() => {
      onSubmit(replyText);
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900">
            {request.status === 'new' ? 'Reply to Request' : 'Reply Details'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">Original Message</p>
            <p className="text-slate-700">{request.message}</p>
            <p className="text-[10px] text-slate-400 mt-2 font-mono">{request.lineUserId}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
              <textarea 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                disabled={request.status === 'replied'}
                className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500 p-3"
                placeholder="Type your response to the user..."
                required
              ></textarea>
            </div>

            {request.status === 'replied' && (
              <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm">
                <p className="font-bold">Sent by: {request.assignedTo}</p>
                <p className="mt-1">Date: {new Date(request.repliedAt!).toLocaleString()}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Close
              </button>
              {request.status === 'new' && (
                <button 
                  type="submit"
                  disabled={isSending}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                >
                  {isSending ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : 'Send Reply via LINE'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
