
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// 💡 Estructura del contexto de autenticación
interface AuthContextType {
  session: any | null; // Puedes definir tu propio tipo de sesión
  user: any | null;    // Usuario autenticado
  loading: boolean;    // Indicador de carga global
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
}

// 🔹 Contexto de autenticación global
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 🧩 Simulación inicial de autenticación (Node.js / LocalStorage / API personalizada)
  useEffect(() => {
    const loadSession = async () => {
      setLoading(true);

      // Ejemplo: recuperar sesión desde almacenamiento local o API Node
      const storedUser = null; // localStorage.getItem('user') || await fetch('/api/session')
      setUser(storedUser);
      setSession(storedUser ? { token: 'fake-token' } : null);

      setLoading(false);
    };

    loadSession();
  }, []);

  // 🧠 Inicio de sesión (para API Node.js)
  const signIn = async (email: string, password: string) => {
    try {
      // const res = await fetch('https://tu-api-node.com/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await res.json();

      // Simulación de éxito
      const data = { user: { email }, token: 'fake-jwt-token' };
      setUser(data.user);
      setSession({ token: data.token });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // 🧾 Registro (para API Node.js)
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // const res = await fetch('https://tu-api-node.com/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, fullName }),
      // });
      // const data = await res.json();

      // Simulación de éxito
      const data = { user: { email, fullName }, token: 'fake-jwt-token' };
      setUser(data.user);
      setSession({ token: data.token });
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // 🚪 Cierre de sesión
  const signOut = async () => {
    // await fetch('https://tu-api-node.com/logout', { method: 'POST' });
    setUser(null);
    setSession(null);
  };

  // 📦 Proveedor del contexto
  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🧩 Hook personalizado para acceder al contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider />');
  }
  return context;
}
