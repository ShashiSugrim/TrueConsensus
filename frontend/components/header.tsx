"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, logout } from '../utils/auth';

function Header() {
    const router = useRouter();
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        setAuthenticated(isAuthenticated());
    }, []);

    const handleLogout = () => {
        logout();
        setAuthenticated(false);
        router.push('/login');
    };

    return (
        <header className="fixed flex top-0 left-0 w-full z-10 p-6 text-white justify-between items-center">
            <a className="text-3xl" href='/main'><b>True Consensus</b></a>
            <div className="flex sm:gap-6">
                {authenticated ? (
                    <button onClick={handleLogout} className="hover:underline">Logout</button>
                ) : (
                    <>
                        <a href='/login'>Login</a>
                        <a href='/signup'>Sign Up</a>
                    </>
                )}
            </div>
        </header>
    )
}

export default Header;