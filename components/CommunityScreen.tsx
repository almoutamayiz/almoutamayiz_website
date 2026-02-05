
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { User } from '../types';
import { 
    Send, X, Loader2, ArrowRight, Globe, LayoutGrid, 
    MessageCircle, Heart, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { playMessageSentSound, playClickSound, playLifelineSound } from '../utils/audio';
import { ALL_SUBJECTS_LIST } from '../constants';

type CommunityTab = 'posts' | 'communities';

const SUBJECT_VISUALS: Record<string, { gradient: string; icon: string }> = {
    'arabic': { gradient: 'from-emerald-600/20 to-black', icon: '📖' },
    'philosophy': { gradient: 'from-purple-600/20 to-black', icon: '🤔' },
    'history': { gradient: 'from-amber-600/20 to-black', icon: '📜' },
    'geography': { gradient: 'from-blue-600/20 to-black', icon: '🗺️' },
    'islamic': { gradient: 'from-teal-600/20 to-black', icon: '🕌' },
    'math': { gradient: 'from-cyan-600/20 to-black', icon: '📐' },
    'english': { gradient: 'from-red-600/20 to-black', icon: '🇬🇧' },
    'french': { gradient: 'from-indigo-600/20 to-black', icon: '🇫🇷' },
};

const CommunityScreen: React.FC<{ user: User }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<CommunityTab>('communities');
    const [selectedSubject, setSelectedSubject] = useState<{id: string, name: string} | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const longPressTimer = useRef<any>(null);

    useEffect(() => {
        if (selectedSubject) {
            fetchMessages();
            
            const channel = supabase
                .channel(`chat_room_${selectedSubject.id}`)
                .on(
                    'postgres_changes' as any, 
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'community_messages', 
                        filter: `subject_id=eq.${selectedSubject.id}` 
                    }, 
                    (payload: any) => {
                        if (payload.eventType === 'INSERT') {
                            setMessages(prev => {
                                if (prev.some(m => m.id === payload.new.id)) return prev;
                                return [...prev, payload.new];
                            });
                            setTimeout(scrollToBottom, 100);
                        } else if (payload.eventType === 'UPDATE') {
                            setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
                        }
                    }
                )
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        }
    }, [selectedSubject]);

    const fetchMessages = async () => {
        if (!selectedSubject) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('community_messages')
                .select('*')
                .eq('subject_id', selectedSubject.id)
                .order('created_at', { ascending: true })
                .limit(100);
            
            if (error) throw error;
            if (data) setMessages(data);
        } catch (e) {
            console.error("Fetch Messages Error:", e);
        } finally {
            setLoading(false);
            setTimeout(scrollToBottom, 200);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text || !selectedSubject || sending) return;
        
        setSending(true);
        try {
            const { data, error } = await supabase.from('community_messages').insert({
                user_id: user.id,
                subject_id: selectedSubject.id,
                content: text,
                user_name: user.name,
                user_avatar: user.avatar || null,
                reactions: { likes: [] }
            }).select().single();

            if (error) {
                console.error("Send Error:", error);
                window.addToast("فشل في إرسال الرسالة", "error");
            } else {
                setNewMessage('');
                playMessageSentSound();
                if (data) setMessages(prev => [...prev, data]);
                scrollToBottom();
            }
        } catch (err) {
            console.error("Request failed:", err);
        } finally {
            setSending(false);
        }
    };

    const handleReaction = async (msgId: number) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;

        let likes = msg.reactions?.likes || [];
        const hasLiked = likes.includes(user.id);

        if (hasLiked) {
            likes = likes.filter((id: string) => id !== user.id);
        } else {
            likes = [...likes, user.id];
            playLifelineSound();
        }

        const { error } = await supabase
            .from('community_messages')
            .update({ reactions: { likes } })
            .eq('id', msgId);

        if (!error) {
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions: { likes } } : m));
        }
    };

    const onTouchStart = (msgId: number) => {
        longPressTimer.current = setTimeout(() => {
            handleReaction(msgId);
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        }, 600);
    };

    const onTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (selectedSubject) {
        return createPortal(
            <div className="fixed top-0 left-0 right-0 bottom-16 sm:bottom-20 z-[60] bg-black flex flex-col animate-fadeIn overflow-hidden">
                <div className="h-16 bg-neutral-900/95 backdrop-blur-xl border-b border-white/10 px-4 flex items-center gap-4 shrink-0">
                    <button onClick={() => setSelectedSubject(null)} className="p-2 bg-white/5 rounded-xl text-gray-400 active:scale-90 transition-all">
                        <ArrowRight size={22} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-xl shadow-inner border border-brand/20">
                            {SUBJECT_VISUALS[selectedSubject.id]?.icon || '💬'}
                        </div>
                        <div>
                            <h3 className="font-black text-white text-xs sm:text-sm">مجتمع {selectedSubject.name}</h3>
                            <p className="text-[8px] text-brand font-black uppercase tracking-widest">غرفة نقاش حية</p>
                        </div>
                    </div>
                </div>

                <div 
                    ref={scrollContainerRef} 
                    className="flex-1 overflow-y-auto p-4 space-y-1 bg-black custom-scrollbar relative"
                >
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30">
                            <Loader2 className="animate-spin text-brand mb-2" size={32} />
                            <p className="text-[8px] font-black uppercase tracking-widest">جاري المزامنة</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.user_id === user.id;
                            const prevMsg = i > 0 ? messages[i - 1] : null;
                            const isFirstInSequence = !prevMsg || prevMsg.user_id !== msg.user_id;
                            const likesCount = msg.reactions?.likes?.length || 0;
                            const hasLiked = msg.reactions?.likes?.includes(user.id);
                            
                            const avatarUrl = msg.user_avatar;

                            return (
                                <div 
                                    key={msg.id || i} 
                                    className={`flex items-end gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isFirstInSequence ? 'mt-4' : 'mt-0.5'}`}
                                    onMouseDown={() => onTouchStart(msg.id)}
                                    onMouseUp={onTouchEnd}
                                    onTouchStart={() => onTouchStart(msg.id)}
                                    onTouchEnd={onTouchEnd}
                                >
                                    <div className="w-8 shrink-0">
                                        {isFirstInSequence && (
                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-neutral-800 shadow-lg flex items-center justify-center">
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-brand uppercase">
                                                        {msg.user_name?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        {isFirstInSequence && (
                                            <span className="text-[8px] font-black text-gray-500 mb-1 px-1 uppercase tracking-tighter">
                                                {msg.user_name}
                                            </span>
                                        )}
                                        <div className="relative group max-w-full">
                                            <div className={`px-4 py-2.5 rounded-2xl text-[13px] font-bold leading-relaxed shadow-lg break-words transition-all active:scale-[0.98] ${
                                                isMe 
                                                ? 'bg-brand text-black rounded-tr-none' 
                                                : 'bg-neutral-800 text-gray-200 rounded-tl-none border border-white/5'
                                            } ${!isFirstInSequence ? (isMe ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}>
                                                {msg.content}
                                            </div>
                                            
                                            {likesCount > 0 && (
                                                <div className={`absolute -bottom-2 ${isMe ? 'right-0' : 'left-0'} flex items-center gap-1 bg-neutral-900 border border-white/10 px-1.5 py-0.5 rounded-full shadow-xl animate-bounceIn z-10`}>
                                                    <Heart size={10} className={`fill-current ${hasLiked ? 'text-red-500' : 'text-gray-500'}`} />
                                                    <span className="text-[8px] font-black text-white">{likesCount}</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[7px] text-gray-600 mt-1 px-1 opacity-60">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={chatEndRef} className="h-10 shrink-0" />
                </div>

                <div className="bg-neutral-900/95 backdrop-blur-xl border-t border-white/10 p-3 shrink-0 pb-safe">
                    <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-black/40 rounded-2xl p-1 border border-white/5 shadow-inner">
                        <input 
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={`اكتب رسالة في مجتمع ${selectedSubject.name}...`}
                            className="flex-1 bg-transparent px-4 py-3 text-xs font-bold text-white outline-none"
                            disabled={sending}
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim() || sending} 
                            className={`p-3 rounded-xl transition-all ${newMessage.trim() ? 'bg-brand text-black scale-100 active:scale-90' : 'bg-neutral-800 text-gray-600 scale-95 opacity-50'}`}
                        >
                            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="rtl:-rotate-90" />}
                        </button>
                    </form>
                </div>
            </div>,
            document.body
        );
    }

    return (
        <div className="h-full bg-black flex flex-col font-cairo overflow-hidden">
            <div className="bg-neutral-900/60 border-b border-white/5 h-14 flex items-center justify-around px-4 shrink-0">
                {[
                    { id: 'communities', icon: Globe, label: 'المجتمعات' },
                    { id: 'posts', icon: LayoutGrid, label: 'المنشورات' }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => { setActiveTab(tab.id as any); playClickSound(); }} 
                        className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all ${activeTab === tab.id ? 'bg-brand text-black font-black shadow-lg scale-105' : 'text-gray-500 text-[10px]'}`}
                    >
                        <tab.icon size={14}/>
                        <span className="font-black uppercase tracking-tighter">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-gradient-to-b from-black to-neutral-900/20">
                {activeTab === 'posts' ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-fadeIn">
                        <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-6">
                            <Sparkles className="text-brand w-8 h-8 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2">ركن المنشورات</h2>
                        <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.4em]">قريباً في التحديثات القادمة</p>
                    </div>
                ) : (
                    <div className="p-4 animate-fadeIn max-w-2xl mx-auto space-y-6">
                        <div className="text-center py-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">انضم لمجتمع مادتك وناقش زملاءك</p>
                            <div className="w-8 h-1 bg-brand mx-auto mt-2 rounded-full"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            {ALL_SUBJECTS_LIST.map((sub) => {
                                const v = SUBJECT_VISUALS[sub.id] || { gradient: 'from-neutral-600/20 to-black', icon: '📚' };
                                return (
                                    <div 
                                        key={sub.id} 
                                        onClick={() => { setSelectedSubject(sub); playClickSound(); }} 
                                        className="bg-neutral-900/40 backdrop-blur-2xl border border-white/5 shadow-xl hover:border-brand/30 active:scale-[0.97] transition-all duration-300 cursor-pointer aspect-square rounded-[2rem] flex flex-col items-center justify-center gap-2 text-center overflow-hidden relative group"
                                    >
                                        <div className={`absolute inset-0 bg-gradient-to-b ${v.gradient} opacity-20 transition-opacity group-hover:opacity-40`}></div>
                                        <span className="text-3xl relative z-10 group-hover:scale-110 transition-transform">{v.icon}</span>
                                        <h3 className="font-black text-[11px] text-white relative z-10 px-2 line-clamp-1">{sub.name}</h3>
                                        <div className="absolute bottom-3 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                            <MessageCircle size={8} className="text-brand" />
                                            <span className="text-[7px] text-brand font-black uppercase tracking-tighter">دخول</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityScreen;
