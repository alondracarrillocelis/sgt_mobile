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

        if (!res.ok) throw new Error("Error al iniciar sesión");
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};

export const logout = async (token: string) => {
    try {
        const res = await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!res.ok) throw new Error("Error al cerrar sesión");
        return true;
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
};
