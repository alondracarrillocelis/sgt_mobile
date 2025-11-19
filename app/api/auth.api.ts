import { API_URL } from "./config";

export const login = async (email: string, password: string) => {
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password_: password }),
            credentials: "include",
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: "Error al iniciar sesión" }));
            throw new Error(errorData.message || "Error al iniciar sesión");
        }
        
        const data = await res.json();
        return data;
    } catch (error: any) {
        console.error("Login error:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const res = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // Necesario para que el backend pueda limpiar la cookie
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: "Error al cerrar sesión" }));
            throw new Error(errorData.message || "Error al cerrar sesión");
        }
        
        // El backend retorna: { message: "Logout successful" }
        const data = await res.json();
        return data;
    } catch (error: any) {
        console.error("Logout error:", error);
        throw error;
    }
};
