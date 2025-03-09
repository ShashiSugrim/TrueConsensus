"use client";
import { useState, useEffect } from 'react';

function Header() {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check if user is logged in by looking for tokens in localStorage
        const token = localStorage.getItem('firebaseIdToken');
        const storedFirstName = localStorage.getItem('firstName');
        
        if (token) {
            setIsLoggedIn(true);
            setFirstName(storedFirstName || 'User');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
 
        setIsLoggedIn(false);
        setFirstName(null);
        
        window.location.href = '/main';
    };

    return (
        <header className="fixed flex top-0 left-0 w-full z-10 p-6 text-white justify-between items-center">
            <a className="text-3xl" href='/main'><b>True Consensus</b></a>
            <div className="flex sm:gap-6 items-center">
                {isLoggedIn ? (
                    <>
                        <span className="mr-4">{firstName}</span>
                        <button 
                            onClick={handleLogout}
                            className="bg-transparent hover:bg-white hover:text-black px-3 py-1 rounded transition-colors"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <a href='/login'>Login</a>
                        <a href='/signup'>Sign Up</a>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;