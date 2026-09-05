import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { BI_ROLES, getBIPermissions, getBIRoleMeta, normalizeRole } from '../lib/biPermissions';

const BIAuthContext = createContext(null);

export const DEMO_USERS = [
  {
    id: 'user-owner',
    name: 'فهد ناصر الجوعي',
    email: 'owner@doratcars.com',
    role: BI_ROLES.OWNER,
    avatar: 'ف',
  },
  {
    id: 'user-admin',
    name: 'يحيي محمد باشا',
    email: 'admin@doratcars.com',
    role: BI_ROLES.ADMIN,
    avatar: 'ي',
  },
  {
    id: 'user-analyst',
    name: 'سارة خالد',
    email: 'analyst@doratcars.com',
    role: BI_ROLES.ANALYST,
    avatar: 'س',
  },
  {
    id: 'user-mediabuyer',
    name: 'عبدالرحمن الشهري',
    email: 'buyer@doratcars.com',
    role: BI_ROLES.MEDIA_BUYER,
    avatar: 'ع',
  },
  {
    id: 'user-viewer',
    name: 'ماجد العتيبي',
    email: 'viewer@doratcars.com',
    role: BI_ROLES.VIEWER,
    avatar: 'م',
  },
];

export function BIAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bi_active_user');
      return saved ? JSON.parse(saved) : DEMO_USERS[0];
    } catch {
      return DEMO_USERS[0];
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync Supabase Auth listener if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch role from user metadata or profile table
        const role = session.user.user_metadata?.bi_role || session.user.app_metadata?.bi_role || BI_ROLES.VIEWER;
        const biUser = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: normalizeRole(role),
          avatar: (session.user.user_metadata?.full_name || session.user.email || 'U')[0].toUpperCase(),
          isSupabaseAuth: true,
        };
        setUser(biUser);
        localStorage.setItem('bi_active_user', JSON.stringify(biUser));
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bi_active_user', JSON.stringify(user));
    }
  }, [user]);

  // Direct login as demo user/role
  const loginAs = (userIdOrRole) => {
    const found = DEMO_USERS.find(u => u.id === userIdOrRole || u.role === userIdOrRole) || {
      id: `user-${userIdOrRole}`,
      name: `مستخدم تجريبي (${userIdOrRole})`,
      email: `${userIdOrRole.toLowerCase()}@doratcars.com`,
      role: normalizeRole(userIdOrRole),
      avatar: userIdOrRole[0],
    };
    setUser(found);
  };

  // Login via Supabase credentials
  const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('قاعدة بيانات Supabase غير مهيأة في متغيرات البيئة. يمكنك استخدام الدخول التجريبي.');
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const permissions = getBIPermissions(user?.role);
  const roleMeta = getBIRoleMeta(user?.role);

  return (
    <BIAuthContext.Provider value={{
      user,
      permissions,
      roleMeta,
      roleLabel: roleMeta.label,
      loginAs,
      loginWithSupabase,
      logout,
      demoUsers: DEMO_USERS,
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
