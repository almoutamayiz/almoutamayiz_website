
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import AuthScreen from './components/AuthScreen';
import AdminDashboard from './components/AdminDashboard';
import SelectionScreen from './components/SelectionScreen';
import BottomNav from './components/BottomNav';
import HomeScreen from './components/HomeScreen';
import LessonsScreen from './components/LessonsScreen';
import TeachersScreen from './components/TeachersScreen';
import CommunityScreen from './components/CommunityScreen';
import GameHub from './components/GameHub';
import SettingsModal from './components/SettingsModal';
import NotificationsModal from './components/NotificationsModal';
import CalculatorScreen from './components/CalculatorScreen';
import ReferralScreen from './components/ReferralScreen';
import UserGuide from './components/UserGuide';
import Header from './components/Header'; 
import DownloadAppPopup from './components/DownloadAppPopup';

import { GameState, Question, User, AppTab, MatchingGameData, Notification } from './types'; 
import { setGameVolume, playNotificationSound, playTabChangeSound } from './utils/audio';
import { supabase } from './lib/supabase';
import { requestNotificationPermission, setupForegroundNotifications } from './lib/notifications';
import MatchingGameSelectionScreen from './components/MatchingGameSelectionScreen'; 
import MatchingGame from './components/MatchingGame'; 

const ADMIN_EMAILS = ['yayachdz@gmail.com', 'amineghouil@yahoo.com'];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.AUTH);
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [finalPrize, setFinalPrize] = useState("0");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);
  const [unrepliedMessagesCount, setUnrepliedMessagesCount] = useState(0);
  const [selectedMatchingGameData, setSelectedMatchingGameData] = useState<MatchingGameData | null>(null);

  // جلب عدد الرسائل غير المجاب عليها للإدارة
  const fetchUnrepliedCount = useCallback(async () => {
    try {
        const { count, error } = await supabase
            .from('admin_messages')
            .select('*', { count: 'exact', head: true })
            .eq('is_replied', false);
        if (!error) setUnrepliedMessagesCount(count || 0);
    } catch (e) { console.error(e); }
  }, []);

  // 1. جلب الإشعارات السابقة عند تسجيل الدخول
  const fetchNotifications = useCallback(async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .or(`user_id.is.null,user_id.eq.${userId}`)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (data) setNotifications(data);
    } catch (e) { console.error("Error fetching notifications", e); }
  }, []);

  const fetchCurriculum = useCallback(async () => {
    try {
        const { data } = await supabase.from('curriculum_status').select('*').order('id');
        if (data) setCurriculum(data);
    } catch (e) { console.error(e); }
  }, []);

  const fetchProfile = useCallback(async (userId: string, email: string, retries = 5) => {
    try {
      let { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!profile && retries > 0) {
        await new Promise(res => setTimeout(res, 1200));
        return fetchProfile(userId, email, retries - 1);
      }
      if (profile) {
        const cleanEmail = email.toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(cleanEmail);
        setCurrentUser({
          id: profile.id,
          name: profile.name || 'طالب متميز',
          email: cleanEmail,
          role: isAdmin ? 'admin' : (profile.role || 'user'),
          avatar: profile.avatar,
          volume: profile.volume || 80,
          streak: profile.streak || 1,
          totalEarnings: isAdmin ? 9999999 : (profile.total_earnings || 0),
          xp: isAdmin ? 9999999 : (profile.xp || 0),
          last_read_at: profile.last_read_at,
          referral_code: profile.referral_code, 
          referred_by: profile.referred_by,
          referral_count: profile.referral_count || 0
        });
        setGameVolume(profile.volume || 80);
        setGameState(GameState.APP);
        setLoading(false);
        
        // Request notification permission
        requestNotificationPermission(profile.id);
        
        // جلب الإشعارات والرسائل فور تحميل الحساب
        fetchNotifications(userId);
        fetchCurriculum();
        if (isAdmin || profile.role?.startsWith('teacher_')) {
            fetchUnrepliedCount();
        }
      } else {
        setLoading(false);
        setGameState(GameState.AUTH);
      }
    } catch (e) {
      setLoading(false);
      setGameState(GameState.AUTH);
    }
  }, [fetchNotifications, fetchUnrepliedCount]);

  // 2. تفعيل الاستماع الحي للإشعارات (Realtime)
  useEffect(() => {
    setupForegroundNotifications();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('realtime_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          const newNotif = payload.new as Notification;
          if (!newNotif.user_id || newNotif.user_id === currentUser.id) {
            setNotifications(prev => [newNotif, ...prev]);
            setHasUnreadNotifs(true);
            playNotificationSound();
            if (window.addToast) window.addToast(newNotif.title, 'info');
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_messages' },
        () => {
            if (currentUser.role === 'admin' || currentUser.role.startsWith('teacher_')) {
                fetchUnrepliedCount();
            }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser, fetchUnrepliedCount]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) fetchProfile(session.user.id, session.user.email!);
      else { 
        setCurrentUser(null); 
        setGameState(GameState.AUTH); 
        setLoading(false); 
        setNotifications([]);
        setUnrepliedMessagesCount(0);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const activeContent = useMemo(() => {
    if (gameState !== GameState.APP) return null;
    switch (currentTab) {
        case 'home': return <HomeScreen user={currentUser!} curriculum={curriculum} onUpdateUser={setCurrentUser} />;
        case 'lessons': return <LessonsScreen user={currentUser!} onUpdateUserScore={() => {}} />;
        case 'teachers': return <TeachersScreen user={currentUser!} />;
        case 'community': return <CommunityScreen user={currentUser!} />;
        case 'game': return <GameHub user={currentUser!} onStart={() => setGameState(GameState.SELECTION)} onStartMatchingGame={() => setGameState(GameState.MATCHING_GAME_SELECTION)} />;
        default: return null;
    }
  }, [currentTab, currentUser, gameState, curriculum]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white font-cairo">
        <div className="relative w-12 h-12 animate-dots-rotate">
            {[...Array(5)].map((_, i) => <div key={i} className="absolute w-2.5 h-2.5 bg-brand rounded-full animate-dot-pulse" style={{ top: '50%', left: '50%', transform: `rotate(${i * 72}deg) translate(20px)`, animationDelay: `${i * 0.2}s` }}></div>)}
        </div>
    </div>
  );

  if (gameState === GameState.AUTH) return <AuthScreen onLogin={async (e, p) => { await supabase.auth.signInWithPassword({ email: e.toLowerCase().trim(), password: p }); }} onRegister={async (n, e, p, ref) => { await supabase.auth.signUp({ email: e.toLowerCase().trim(), password: p, options: { data: { full_name: n, referral_code_input: ref?.trim() || null } } }); }} />;
  if (gameState === GameState.ADMIN) return <AdminDashboard currentUser={currentUser!} onPlay={() => setGameState(GameState.APP)} onLogout={() => supabase.auth.signOut()} onUpdateCounts={fetchUnrepliedCount} />;
  if (gameState === GameState.SELECTION) return <SelectionScreen questions={[]} onStartGame={(f) => { setFilteredQuestions(f); setGameState(GameState.PLAYING); }} onBack={() => setGameState(GameState.APP)} />;
  if (gameState === GameState.MATCHING_GAME_SELECTION) return <MatchingGameSelectionScreen onStartGame={(c) => { setSelectedMatchingGameData(c); setGameState(GameState.MATCHING_GAME); }} onBack={() => setGameState(GameState.APP)} />;
  if (gameState === GameState.PLAYING) return <GameScreen questions={filteredQuestions} onGameOver={(p) => { setFinalPrize(p); setGameState(GameState.GAME_OVER); }} onVictory={(p) => { setFinalPrize(p); setGameState(GameState.VICTORY); }} onExit={() => setGameState(GameState.APP)} />;
  if (gameState === GameState.MATCHING_GAME) return <MatchingGame user={currentUser!} gameConfig={selectedMatchingGameData} onExit={() => setGameState(GameState.APP)} onUpdateScore={() => {}} />;
  if (gameState === GameState.VICTORY || gameState === GameState.GAME_OVER) return <ResultScreen amountWon={finalPrize} isVictory={gameState === GameState.VICTORY} onRestart={() => setGameState(GameState.SELECTION)} />;
  if (gameState === GameState.CALCULATOR) return <CalculatorScreen onBack={() => setGameState(GameState.APP)} />;
  if (gameState === GameState.REFERRALS) return <ReferralScreen user={currentUser!} onBack={() => setGameState(GameState.APP)} />;
  if (gameState === GameState.GUIDE) return <UserGuide onBack={() => setGameState(GameState.APP)} />;

  return (
    <div className="flex flex-col h-screen bg-black text-white relative font-cairo overflow-hidden">
      <Header 
        user={currentUser!} 
        appLogo="" 
        hasUnreadNotifs={hasUnreadNotifs} 
        unrepliedMessagesCount={unrepliedMessagesCount}
        onOpenNotifications={() => { setIsNotifOpen(true); setHasUnreadNotifs(false); }} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onLogout={() => supabase.auth.signOut()} 
        onNavigate={(s) => setGameState(s)} 
      />
      {/* Scroll container optimized for iOS */}
      <main className="flex-1 overflow-y-auto pt-16 pb-20 custom-scrollbar scroll-container overscroll-y-contain">
          <div key={currentTab} className="section-entry">
            {activeContent}
          </div>
      </main>
      <BottomNav currentTab={currentTab} onTabChange={(tab) => { setCurrentTab(tab); playTabChangeSound(); }} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={currentUser!} onUpdateUser={setCurrentUser} onResetProgress={() => {}} onLogout={() => supabase.auth.signOut()} />
      <NotificationsModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} notifications={notifications} />
      <DownloadAppPopup currentTab={currentTab} user={currentUser} />
    </div>
  );
};

export default App;
