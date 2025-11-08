import React from 'react';

interface MicButtonProps {
    isListening: boolean;
    isSpeaking: boolean;
    onClick: () => void;
}

const MicButton: React.FC<MicButtonProps> = ({ isListening, isSpeaking, onClick }) => {
    const isDisabled = isSpeaking;

    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 glass-card border-emerald-500/30 hover:scale-110 hover:border-emerald-500/50
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={{
                background: isListening 
                    ? 'linear-gradient(135deg, #ff3366, #ff6b9d)' 
                    : 'linear-gradient(135deg, #00ff88, #00d9ff)'
            }}
        >
            {isListening && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{
                    background: 'linear-gradient(135deg, #ff3366, #ff6b9d)'
                }}></span>
            )}
            <svg className="w-6 h-6 text-white relative z-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m6 7.5v3.75m-3.75 0h7.5" />
            </svg>
        </button>
    );
};

export default MicButton;