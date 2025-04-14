import React, { useState } from 'react';
import { signInWithGoogle, logOut } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const { currentUser, isLoading } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const handleSignIn = async () => {
        try {
        setIsLoggingIn(true);
        setLoginError(null);
        await signInWithGoogle();
        } catch (error) {
        console.error('Login error:', error);
        setLoginError('Failed to sign in. Please try again.');
        } finally {
        setIsLoggingIn(false);
        }
};

    const handleSignOut = async () => {
        try {
        setIsLoggingIn(true);
        await logOut();
        } catch (error) {
        console.error('Logout error:', error);
        } finally {
        setIsLoggingIn(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-fae animate-pulse"></div>
                <span className="text-gray-300 text-sm">Loading...</span>
            </div>
            );
        }
        
        return (
            <div className="relative">
            {currentUser ? (
                <div className="flex items-center">
                <div className="relative group">
                    {currentUser.photoURL && (
                    <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || 'User'} 
                        className="w-8 h-8 rounded-full cursor-pointer border border-fae border-opacity-50"
                    />
                    )}
                    
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-md shadow-lg py-1 z-10 hidden group-hover:block border border-fae border-opacity-20">
                    <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm text-white truncate">{currentUser.displayName}</p>
                        <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        disabled={isLoggingIn}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        Sign Out
                    </button>
                    </div>
                </div>
                </div>
            ) : (
                <button
                onClick={handleSignIn}
                disabled={isLoggingIn}
                className="px-4 py-2 bg-fae-dark text-white rounded-md hover:bg-fae transition flex items-center"
                >
                {isLoggingIn ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                    </>
                ) : (
                    <>
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" />
                    </svg>
                    Sign In
                    </>
                )}
                </button>
            )}
            
            {loginError && (
                <div className="absolute top-full mt-2 right-0 bg-red-900 text-white text-sm p-2 rounded shadow-lg">
                {loginError}
                </div>
            )}
        </div>
    );
};

export default Login;