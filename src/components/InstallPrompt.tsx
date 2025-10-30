import React, { useState, useEffect } from 'react';

// Define the BeforeInstallPromptEvent interface which is not in standard TypeScript definitions
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

const InstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showPersistentButton, setShowPersistentButton] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if this is iOS
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      setShowPersistentButton(true);

      // Check if we should show the custom prompt automatically
      const promptDismissedAt = localStorage.getItem('installPromptDismissedAt');
      if (promptDismissedAt) {
        const lastDismissed = parseInt(promptDismissedAt, 10);
        const now = Date.now();
        // Only show again after 7 days if user dismissed it
        if (now - lastDismissed < 7 * 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // Wait a bit before showing the prompt to not interrupt the user
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // For iOS, always show the persistent button
    if (isAppleDevice) {
      setShowPersistentButton(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [isInstalled]);

  const handleInstallClick = () => {
    if (isIOS) {
      // For iOS, just show the prompt since we can't programmatically trigger it
      setShowPrompt(true);
      return;
    }

    if (!installPromptEvent) return;

    // Show the install prompt
    installPromptEvent.prompt();

    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setShowPersistentButton(false);
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the saved prompt since it can't be used again
      setInstallPromptEvent(null);
      setShowPrompt(false);
    });
  };

  const handleDismissClick = () => {
    setShowPrompt(false);
    // Store dismissal time instead of permanent flag
    localStorage.setItem('installPromptDismissedAt', Date.now().toString());
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Auto-showing prompt banner */}
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-gray-900 border border-fae rounded-lg p-4 shadow-lg z-50 card-fantasy">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Install GameMuse</h3>
              {isIOS ? (
                <div className="text-gray-300 text-sm space-y-2">
                  <p className="font-semibold text-fae">To install GameMuse:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Tap the <span className="inline-flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded">Share <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-fae inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg></span> button at the bottom of your screen</li>
                    <li>Scroll down and tap <span className="bg-gray-800 px-1.5 py-0.5 rounded text-fae">"Add to Home Screen"</span></li>
                    <li>Tap <span className="bg-gray-800 px-1.5 py-0.5 rounded text-fae">"Add"</span> in the top right</li>
                  </ol>
                </div>
              ) : (
                <p className="text-gray-300 text-sm">
                  Install this app on your device for quick and easy access when you're on the go.
                </p>
              )}
            </div>
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="ml-4 px-4 py-2 bg-fae text-white rounded-md hover:bg-fae-dark transition text-sm whitespace-nowrap"
              >
                Install App
              </button>
            )}
            <button
              onClick={handleDismissClick}
              className="ml-2 p-2 text-gray-400 hover:text-white"
              aria-label="Dismiss"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Persistent install button - always available */}
      {showPersistentButton && !showPrompt && (
        <button
          onClick={handleInstallClick}
          className="fixed bottom-4 right-4 bg-fae text-white p-3 rounded-full shadow-lg hover:bg-fae-dark transition z-40 flex items-center gap-2 group"
          aria-label="Install App"
          title="Install GameMuse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
            Install App
          </span>
        </button>
      )}
    </>
  );
};

export default InstallPrompt;