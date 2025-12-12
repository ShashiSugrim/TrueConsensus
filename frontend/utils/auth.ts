const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

interface AuthResponse {
    access_token: string;
    user: {
        user_id: string;
        email: string;
        first_name: string;
        last_name: string;
    };
}

interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

interface LoginData {
    email: string;
    password: string;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
    }

    return await response.json();
}

export async function login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid email or password');
    }

    return await response.json();
}

export function saveAuthData(authResponse: AuthResponse) {
    localStorage.setItem('accessToken', authResponse.access_token);
    localStorage.setItem('userId', authResponse.user.user_id);
    localStorage.setItem('userEmail', authResponse.user.email);
    localStorage.setItem('userName', `${authResponse.user.first_name} ${authResponse.user.last_name}`);
}

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

export function getUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('userId');
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

export function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
}

export function getAuthHeaders(): Record<string, string> {
    const token = getAccessToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}