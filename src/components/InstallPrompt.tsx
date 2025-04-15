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
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if this is iOS
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isAppleDevice);

    // Check if the user has dismissed the prompt before
    const hasUserDismissedPrompt = localStorage.getItem('installPromptDismissed');
    if (hasUserDismissedPrompt === 'true') {
      setIsDismissed(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPromptEvent(e);
      
      // Check if we should show the custom prompt
      const promptShownRecently = localStorage.getItem('installPromptShownAt');
      if (promptShownRecently) {
        const lastShown = parseInt(promptShownRecently, 10);
        const now = Date.now();
        // Only show again after 3 days
        if (now - lastShown < 3 * 24 * 60 * 60 * 1000) {
          return;
        }
      }
      
      // Wait a bit before showing the prompt to not interrupt the user
      setTimeout(() => {
        if (!isInstalled && !isDismissed) {
          setShowPrompt(true);
          localStorage.setItem('installPromptShownAt', Date.now().toString());
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [isInstalled, isDismissed]);

  const handleInstallClick = () => {
    if (!installPromptEvent) return;
    
    // Show the install prompt
    installPromptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    installPromptEvent.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
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
    setIsDismissed(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gray-900 border border-fae rounded-lg p-4 shadow-lg z-50 card-fantasy">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">Install GameMuse</h3>
          {isIOS ? (
            <p className="text-gray-300 text-sm">
              Install this app on your iPhone: tap <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-fae inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg></span> and then "Add to Home Screen".
            </p>
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
  );
};

export default InstallPrompt;