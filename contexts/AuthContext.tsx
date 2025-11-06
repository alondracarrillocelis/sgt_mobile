// import React, { createContext, useState, useEffect } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as AuthAPI from "../api/auth.api";

// interface AuthContextType {
//   user: any;
//   token: string | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
// }

// export const AuthContext = createContext<AuthContextType>({
//   user: null,
//   token: null,
//   login: async () => {},
//   logout: async () => {},
// });

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [user, setUser] = useState<any>(null);
//   const [token, setToken] = useState<string | null>(null);

//   useEffect(() => {
//     const loadSession = async () => {
//       const storedToken = await AsyncStorage.getItem("token");
//       if (storedToken) {
//         setToken(storedToken);
//         const data = await AuthAPI.getProfile(storedToken);
//         setUser(data.user);
//       }
//     };
//     loadSession();
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await AuthAPI.login(email, password);
//     if (res.token) {
//       await AsyncStorage.setItem("token", res.token);
//       setToken(res.token);
//       setUser(res.user);
//     }
//   };

//   const logout = async () => {
//     await AsyncStorage.removeItem("token");
//     setUser(null);
//     setToken(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, token, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
