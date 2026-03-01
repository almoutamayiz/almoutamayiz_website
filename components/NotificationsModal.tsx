
import React, { useEffect } from 'react';
import { X, Bell, Clock, User, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose, notifications }) => {
  useEffect(() => {
      if (isOpen && notifications.length > 0) {
          notifications.forEach(async (notif) => {
              if (notif.is_consultation_reply && notif.reply_data) {
                  const replyData: any = notif.reply_data;
                  if (replyData.imagePath) {
                      supabase.storage
                          .from('consultations')
                          .remove([replyData.imagePath])
                          .then(({ error }) => {
                              if (!error) console.log("Cleaned up consultation image:", replyData.imagePath);
                          });
                  }
              }
          });
      }
  }, [isOpen, notifications]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:pt-20 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative transition-colors duration-300 flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-50 dark:bg-neutral-800 p-4 flex justify-between items-center border-b border-slate-200 dark:border-neutral-700 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600 dark:text-yellow-500" /> الإشعارات</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-gray-500"><Bell className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>لا توجد إشعارات جديدة</p></div>
          ) : (
            notifications.map((notif) => {
                let parsedContent: any = null;
                let isRichReply = false;
                let isBroadcast = false;
                
                try {
                    parsedContent = JSON.parse(notif.content);
                    if (parsedContent && parsedContent.type === 'consultation_reply') { 
                        isRichReply = true; 
                    } else if (parsedContent && parsedContent.type === 'general_broadcast') {
                        isBroadcast = true;
                    }
                } catch (e) {}

                return (
                  <div key={notif.id} className={`p-4 rounded-xl border transition-colors bg-slate-50 dark:bg-neutral-900/50 border-slate-100 dark:border-neutral-800 animate-slideIn`}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{notif.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-white dark:bg-neutral-900 px-2 py-1 rounded-full border border-slate-100 dark:border-neutral-800">
                              <Clock className="w-3 h-3" />
                              {new Date(notif.created_at).toLocaleDateString('en-GB')}
                            </span>
                        </div>
                    </div>

                    {isRichReply ? (
                        <div className="space-y-3 mt-2">
                             <div className="bg-slate-100 dark:bg-neutral-800 p-3 rounded-lg border-r-4 border-slate-400">
                                 <p className="text-[10px] text-slate-500 mb-1 font-bold">سؤالك:</p>
                                 <p className="text-xs text-slate-700 dark:text-gray-300 italic">"{parsedContent.question}"</p>
                             </div>
                             <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border-r-4 border-blue-500">
                                 <div className="flex items-center gap-2 mb-1">
                                    <div className="p-1 bg-blue-500 rounded-full text-white"><User size={10} /></div>
                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">{parsedContent.responder} ({parsedContent.subject})</p>
                                 </div>
                                 <p className="text-sm text-slate-800 dark:text-white font-medium whitespace-pre-line">{parsedContent.answer}</p>
                             </div>
                        </div>
                    ) : isBroadcast ? (
                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{parsedContent.content}</p>
                            {parsedContent.link && (
                                <a 
                                  href={parsedContent.link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 dark:bg-brand text-white dark:text-black rounded-xl font-black text-xs shadow-lg hover:opacity-90 transition-all active:scale-95"
                                >
                                    <ExternalLink size={14}/>
                                    <span>تصفح الرابط المرفق</span>
                                </a>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">{notif.content}</p>
                    )}
                  </div>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;
