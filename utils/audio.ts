
// Sound Manager using Web Audio API

let globalVolume = 0.5;

export const setGameVolume = (vol: number) => {
    // Normalize 0-100 to 0-1
    globalVolume = Math.max(0, Math.min(1, vol / 100));
};

const getAudioContext = () => {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
};

const createOscillator = (
    type: OscillatorType, 
    freq: number, 
    duration: number, 
    startTime: number, 
    ctx: AudioContext, 
    vol: number
) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    // Master volume application
    gain.gain.setValueAtTime(vol * globalVolume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const playCorrectSound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Major arpeggio (C - E - G - C)
    createOscillator('sine', 523.25, 0.2, now, ctx, 0.5); // C5
    createOscillator('sine', 659.25, 0.2, now + 0.1, ctx, 0.5); // E5
    createOscillator('sine', 783.99, 0.3, now + 0.2, ctx, 0.5); // G5
    createOscillator('triangle', 1046.50, 0.6, now + 0.3, ctx, 0.3); // C6 (sparkle)
};

export const playWrongSound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now); // Low tone
    osc.frequency.linearRampToValueAtTime(50, now + 0.5); // Slide down
    
    gain.gain.setValueAtTime(0.5 * globalVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.5);
};

export const playLifelineSound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Magic whoosh/sweep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
    
    gain.gain.setValueAtTime(0.3 * globalVolume, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
};

export const playClickSound = () => {
    if (globalVolume === 0) return;
     const ctx = getAudioContext();
     const now = ctx.currentTime;
     createOscillator('triangle', 800, 0.05, now, ctx, 0.2);
};

export const playVictorySound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Fanfare
    createOscillator('square', 523.25, 0.2, now, ctx, 0.3); 
    createOscillator('square', 523.25, 0.2, now + 0.2, ctx, 0.3); 
    createOscillator('square', 523.25, 0.2, now + 0.4, ctx, 0.3); 
    createOscillator('square', 659.25, 0.6, now + 0.6, ctx, 0.4); 
    createOscillator('square', 523.25, 0.2, now + 1.0, ctx, 0.3); 
    createOscillator('square', 783.99, 1.0, now + 1.2, ctx, 0.5); 
};

export const playMessageSentSound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // "Pop" sound
    createOscillator('sine', 800, 0.1, now, ctx, 0.3);
    createOscillator('sine', 1200, 0.05, now + 0.05, ctx, 0.2);
};

export const playNotificationSound = () => {
    if (globalVolume === 0) return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // Professional 3-tone chime (Important Notification)
    createOscillator('sine', 880, 0.15, now, ctx, 0.4); // A5
    createOscillator('sine', 1108.73, 0.15, now + 0.15, ctx, 0.4); // C#6
    createOscillator('sine', 1318.51, 0.4, now + 0.3, ctx, 0.4); // E6
};
