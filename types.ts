
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  volume?: number;
  streak?: number;
  custom_id?: string;
  totalEarnings?: number;
  xp?: number;
  last_read_at?: string;
  referral_code?: string;
  referred_by?: string;
  referral_count?: number;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  prize: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  chapter: string;
  lesson: string;
  isAi?: boolean;
}

export interface MoneyTier {
  level: number;
  amount: string;
  value: number;
  isSafeHaven: boolean;
}

export interface Lifelines {
  fiftyFifty: boolean;
  askAudience: boolean;
  callFriend: boolean;
}

export enum GameState {
  AUTH = 'AUTH',
  APP = 'APP', 
  PLAYING = 'PLAYING',
  VICTORY = 'VICTORY',
  GAME_OVER = 'GAME_OVER',
  ADMIN = 'ADMIN',
  SELECTION = 'SELECTION',
  CALCULATOR = 'CALCULATOR',
  MATCHING_GAME_SELECTION = 'MATCHING_GAME_SELECTION',
  MATCHING_GAME = 'MATCHING_GAME',
  REFERRALS = 'REFERRALS',
  GUIDE = 'GUIDE'
}

export interface Post {
  id: number;
  user_id: string;
  content: string;
  type: 'general' | 'question' | 'poll';
  media_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    name: string;
    avatar?: string;
    role: string;
  };
  is_liked_by_me?: boolean;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar?: string;
  };
}

export interface DirectMessage {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatSession {
  user_id: string;
  name: string;
  avatar?: string;
  last_message?: string;
  unread_count: number;
}

export type AppTab = 'home' | 'lessons' | 'game' | 'community' | 'teachers';

export interface MatchItem {
  id: string;
  left: string;
  right: string;
  sourceId: string;
}

export interface MatchingGameData {
  modeId: string;
  items: MatchItem[];
  title: string;
  description?: string;
  icon: string;
  gradient: string;
  primaryColor?: string;
  shadowColor?: string;
  backgroundImage?: string;
}

export interface CurriculumStatus {
  id: number;
  subject: string;
  last_lesson: string;
}

export interface Notification {
  id: number;
  user_id?: string;
  title: string;
  content: string;
  created_at: string;
  is_consultation_reply?: boolean;
  reply_data?: any;
}

export interface AdminMessage {
  id: number;
  user_id: string;
  user_name: string;
  content: string;
  is_replied: boolean;
  response?: string;
  created_at: string;
}

export interface LessonContent {
  id: number;
  title: string;
  title_color?: string;
  section_id: string;
  content: string;
  subject: string;
  created_at?: string;
}

export interface LessonBlock {
  id: string;
  type: string;
  text: string;
  color?: string;
  extra_1?: string;
}

export interface MathPart {
  title: string;
  video_url: string;
  description?: string;
}

export interface MathLessonStructuredContent {
  type: "math_series";
  parts: MathPart[];
}

export interface PhilosophyPhilosopher {
  name: string;
  nationality: string;
  idea: string;
  quote: string;
  example: string;
}

export interface PhilosophyPosition {
  title: string;
  theories: {
    philosophers: PhilosophyPhilosopher[];
  }[];
  critique: string;
}

export interface PhilosophyStructuredContent {
  type: "philosophy_structured";
  problem: string;
  positions: PhilosophyPosition[];
  synthesisType: string;
  synthesis: string;
  conclusion: string;
  video_url?: string;
}

export interface PhilosophyTextAnalysisContent {
  type: "philosophy_text_analysis";
  tamheed: {
    problemName: string;
    topic: string;
    definition: string;
    authorName: string;
  };
  authorInfo: {
    origin: string; 
    bookSource: string;
  };
  context: {
    philosophicalType: string; 
    motives: string;
  };
  question: string;
  authorPosition: {
    explanation: string;
    quoteFromText: string;
  };
  arguments: {
    content: string;
    explanation: string;
    type: string; 
  }[];
  evaluation: {
    successPoints: string;
    weakPoints: string;
    opposingPhilosophers: string[];
  };
  personalOpinion: {
    generalIdea: string;
    myView: string;
  };
  conclusion: string;
  video_url?: string;
}

export interface Exam {
  id: number;
  subject: string;
  year: number;
  pdf_url: string;
  type?: string;
}

export interface PointHistoryItem {
  id: number;
  amount: number;
  reason: string;
  type: 'bonus' | 'game' | 'lesson';
  date: string;
}

declare global {
  interface Window {
    addToast: (message: string, type: 'success' | 'error' | 'info') => { success: boolean };
  }
}
