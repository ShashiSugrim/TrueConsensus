"use client";
import { useState } from 'react';
import Header from '../../components/header';
import { useRouter } from 'next/navigation';
import { login, saveAuthData } from '../../utils/auth';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const authResponse = await login({ email, password });
            saveAuthData(authResponse);
            
            console.log('User ID:', authResponse.user.user_id);
            console.log('Login successful');
    
            router.push('/main');
        } catch (error) {
            setError((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-white">
            <Header />
            <main className="pt-50 px-4">
                <div className="flex justify-center">
                    <form onSubmit={handleLogin} className='flex flex-col gap-4 p-8 pb-10 border rounded-lg shadow-lg bg-white/10 w-full max-w-md'>
                        <h1 className="text-2xl font-bold mb-4 text-white">Login</h1>
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-white">Email</label>
                            <input 
                                type='email' 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="p-2 rounded border bg-white/20 text-white placeholder-white/70" 
                                required 
                            />
                        </div>
                        <div className="flex flex-col gap-2 pb-6">
                            <label className="text-sm text-white">Password</label>
                            <input 
                                type='password' 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="p-2 rounded border bg-white/20 text-white placeholder-white/70" 
                                required 
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className='rounded border p-2 cursor-pointer text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Logging in...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}