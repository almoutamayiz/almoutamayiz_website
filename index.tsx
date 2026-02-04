
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// إعداد بيئة التطبيق لمنع السلوكيات الخاصة بمواقع الويب برمجياً (Nuclear Option)
if (typeof window !== 'undefined') {
    
    // 1. منع بدء تحديد النصوص نهائياً (Selection Start)
    document.addEventListener('selectstart', (e) => {
        const target = e.target as HTMLElement;
        // السماح فقط داخل حقول الإدخال
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }
        e.preventDefault();
    });

    // 2. منع القائمة المنبثقة (Right Click / Long Press)
    document.addEventListener('contextmenu', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            return;
        }
        e.preventDefault();
    }, { capture: true });

    // 3. منع سحب الصور والعناصر (Drag & Drop)
    document.addEventListener('dragstart', (e) => {
        e.preventDefault();
    }, { capture: true });

    // 4. منع اختصارات لوحة المفاتيح (Ctrl+A, Ctrl+C, etc) خارج الحقول
    document.addEventListener('keydown', (e) => {
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        
        if (!isInput && (e.ctrlKey || e.metaKey)) {
            // منع النسخ، القص، اللصق، التحديد الكل، الطباعة، البحث
            if (['c', 'x', 'v', 'a', 'p', 'f', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        }
    });
}

// Toast Notification System (Global Feedback)
(window as any).addToast = (message: string, type: 'success' | 'error' | 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; gap: 10px; align-items: center; pointer-events: none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `padding: 12px 24px; border-radius: 12px; color: #fff; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); opacity: 0; transform: translateY(-20px); transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55); pointer-events: auto; user-select: none; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(5px);`;
    
    if (type === 'success') toast.style.backgroundColor = '#f59e0b'; 
    else if (type === 'error') toast.style.backgroundColor = '#ef4444';
    else toast.style.backgroundColor = '#3b82f6';

    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);

    return { success: true };
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
