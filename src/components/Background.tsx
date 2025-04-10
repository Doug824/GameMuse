import React, { ReactNode } from 'react';

interface BackgroundProps {
    children: ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
        {/* This div serves as the forest background with an overlay */}
        <div className="absolute inset-0 z-0">
            {/* If you have your own image, this should be customized based on the image */}
            <div className="absolute inset-0 bg-twilight bg-opacity-90 bg-blend-multiply"></div>
            
            {/* Misty fog effect at the bottom, subtle and semi-transparent */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-twilight to-transparent"></div>
            
            {/* Optional: animated particles or falling leaves effect could be added here */}
        </div>

        {/* Content goes here, positioned above the background */}
        <div className="relative z-10">
            {children}
        </div>
        </div>
    );
};

export default Background;