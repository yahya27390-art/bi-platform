import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BI_ROLES, getBIPermissions, getBIRoleMeta, normalizeRole } from '../lib/biPermissions';

const BIAuthContext = createContext(null);

// Authorized Management Accounts for Dora Cars BI Platform
export const AUTH_ACCOUNTS = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@doratcars.com',
    password: 'dora#admin2026',
    name: 'يحيي محمد باشا',
    role: BI_ROLES.ADMIN,
    avatar: 'ي',
    title: 'مدير المنصة التنفيذي',
  },
  {
    id: 'user-owner',
    username: 'owner',
    email: 'owner@doratcars.com',
    password: 'dora#owner2026',
    name: 'فهد ناصر الجوعي',
    role: BI_ROLES.OWNER,
    avatar: 'ف',
    title: 'مالك المنصة / الإدارة العليا',
  },
  {
    id: 'user-analyst',
    username: 'analyst',
    email: 'analyst@doratcars.com',
    password: 'dora#analyst2026',
    name: 'سارة خالد',
    role: BI_ROLES.ANALYST,
    avatar: 'س',
    title: 'محلل أعمال وبيانات',
  },
  {
    id: 'user-mediabuyer',
    username: 'buyer',
    email: 'buyer@doratcars.com',
    password: 'dora#buyer2026',
    name: 'عبدالرحمن الشهري',
    role: BI_ROLES.MEDIA_BUYER,
    avatar: 'ع',
    title: 'مسؤول الميديا باينج والحملات',
  },
  {
    id: 'user-viewer',
    username: 'viewer',
    email: 'viewer@doratcars.com',
    password: 'dora#viewer2026',
    name: 'ماجد العتيبي',
    role: BI_ROLES.VIEWER,
    avatar: 'م',
    title: 'مراقب عام (عرض فقط)',
  },
];

// Strict Session Inactivity Timeout: 5 minutes (300,000 milliseconds)
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;
export const LAST_ACTIVE_KEY = 'bi_last_active_time';
export const LOGOUT_REASON_KEY = 'bi_logout_reason';

// Universal Master Passwords accepted for convenience and management emergency access
const MASTER_PASSWORDS = ['dora2026', 'dora#2026', 'dora@2026'];

export function BIAuthProvider({ children }) {
  // STRICT GATEKEEPER: Default to null if not authenticated or expired!
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bi_active_user');
      if (saved) {
        const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
        const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;
        const now = Date.now();

        // If inactive for more than 5 minutes on startup, strictly terminate session
        if (lastActive && now - lastActive >= INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem('bi_active_user');
          localStorage.removeItem(LAST_ACTIVE_KEY);
          sessionStorage.removeItem('dora_owner_vault_unlocked');
          sessionStorage.setItem(LOGOUT_REASON_KEY, 'inactivity_5min');
          return null;
        }

        const parsed = JSON.parse(saved);
        // Ensure valid user object
        if (parsed && parsed.id && parsed.role) {
          return parsed;
        }
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // ── STRICT 5-MINUTE INACTIVITY AUTO-LOGOUT ENGINE ─────────────────────────
  useEffect(() => {
    if (!user) return;

    // Stamp current time as active on mount / login
    const recordActivity = () => {
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
    };

    // Throttled event handler to avoid performance overhead (max once per 2 seconds)
    let lastThrottledTime = 0;
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 2000) {
        lastThrottledTime = now;
        localStorage.setItem(LAST_ACTIVE_KEY, now.toString());
      }
    };

    // Ensure initial timestamp exists
    if (!localStorage.getItem(LAST_ACTIVE_KEY)) {
      recordActivity();
    }

    // Attach listeners for all user movements and inputs
    const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    ACTIVITY_EVENTS.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    // Check interval every 2 seconds
    const intervalId = setInterval(() => {
      const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);
      const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : Date.now();
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        console.warn('🔒 تم استيفاء مهلة عدم النشاط (5 دقائق). إنهاء الجلسة فوراً لأسباب أمنية.');
        sessionStorage.setItem(LOGOUT_REASON_KEY, 'inactivity_5min');
        sessionStorage.removeItem('dora_owner_vault_unlocked');
        localStorage.removeItem('bi_active_user');
        localStorage.removeItem(LAST_ACTIVE_KEY);
        setUser(null);

        // Redirect to login
        if (!window.location.hash.includes('/login') && !window.location.pathname.includes('/login')) {
          window.location.hash = '#/login';
        }
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      ACTIVITY_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [user]);

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const role = session.user.user_metadata?.bi_role || session.user.app_metadata?.bi_role || BI_ROLES.VIEWER;
        const biUser = {
          id: session.user.id,
          email: session.user.email,
          username: session.user.email?.split('@')[0],
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: normalizeRole(role),
          avatar: (session.user.user_metadata?.full_name || session.user.email || 'U')[0].toUpperCase(),
          isSupabaseAuth: true,
          authenticatedAt: new Date().toISOString(),
        };
        setUser(biUser);
        localStorage.setItem('bi_active_user', JSON.stringify(biUser));
        localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
        sessionStorage.removeItem(LOGOUT_REASON_KEY);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bi_active_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bi_active_user');
    }
  }, [user]);

  // Primary Login Function (Username / Email + Password)
  const loginWithCredentials = async (identifier, password) => {
    setIsLoading(true);
    try {
      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      if (!cleanId || !cleanPass) {
        throw new Error('يرجى إدخال اسم المستخدم وكلمة المرور');
      }

      // Check registered system accounts
      const matched = AUTH_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === cleanId || acc.email.toLowerCase() === cleanId
      );

      if (matched) {
        const isPassValid =
          matched.password === cleanPass ||
          MASTER_PASSWORDS.includes(cleanPass);

        if (isPassValid) {
          const authUser = {
            id: matched.id,
            email: matched.email,
            username: matched.username,
            name: matched.name,
            role: matched.role,
            avatar: matched.avatar,
            title: matched.title,
            authenticatedAt: new Date().toISOString(),
          };
          setUser(authUser);
          localStorage.setItem('bi_active_user', JSON.stringify(authUser));
          localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
          sessionStorage.removeItem(LOGOUT_REASON_KEY);
          return authUser;
        }
      }

      // If Supabase is configured and input is an email, attempt Supabase sign-in
      if (isSupabaseConfigured && supabase && cleanId.includes('@')) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanId,
            password: cleanPass,
          });
          if (!error && data?.user) {
            const role = data.user.user_metadata?.bi_role || BI_ROLES.VIEWER;
            const biUser = {
              id: data.user.id,
              email: data.user.email,
              username: data.user.email?.split('@')[0],
              name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
              role: normalizeRole(role),
              avatar: (data.user.email || 'U')[0].toUpperCase(),
              isSupabaseAuth: true,
              authenticatedAt: new Date().toISOString(),
            };
            setUser(biUser);
            localStorage.setItem('bi_active_user', JSON.stringify(biUser));
            localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
            sessionStorage.removeItem(LOGOUT_REASON_KEY);
            return biUser;
          }
        } catch (supaErr) {
          console.warn('Supabase signin attempt:', supaErr);
        }
      }

      throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات والمحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role switching (ONLY allowed if already authenticated)
  const loginAs = (userIdOrRole) => {
    if (!user) {
      console.warn('Authentication required before role switching');
      return;
    }
    const found = AUTH_ACCOUNTS.find(u => u.id === userIdOrRole || u.role === userIdOrRole);
    if (found) {
      const updated = {
        ...found,
        authenticatedAt: user.authenticatedAt,
      };
      setUser(updated);
      localStorage.setItem('bi_active_user', JSON.stringify(updated));
      localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    }
  };

  // Secure Logout
  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signout error:', e);
      }
    }
    setUser(null);
    localStorage.removeItem('bi_active_user');
    localStorage.removeItem(LAST_ACTIVE_KEY);
    sessionStorage.removeItem('dora_owner_vault_unlocked');
    sessionStorage.removeItem(LOGOUT_REASON_KEY);
  };

  const permissions = getBIPermissions(user?.role);
  const roleMeta = getBIRoleMeta(user?.role);

  return (
    <BIAuthContext.Provider value={{
      user,
      permissions,
      roleMeta,
      roleLabel: roleMeta?.label || 'مستخدم',
      loginWithCredentials,
      loginAs,
      logout,
      demoUsers: AUTH_ACCOUNTS,
      isAuthenticated: !!user,
      isLoading,
      isSupabaseConfigured,
    }}>
      {children}
    </BIAuthContext.Provider>
  );
}

export function useBIAuth() {
  const ctx = useContext(BIAuthContext);
  if (!ctx) throw new Error('useBIAuth must be used within BIAuthProvider');
  return ctx;
}
