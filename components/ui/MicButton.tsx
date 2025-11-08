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
            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                ${isListening 
                    ? 'bg-red-500' 
                    : 'bg-teal-600 hover:bg-teal-500'}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {isListening && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-12 0v1.5m6 7.5v3.75m-3.75 0h7.5" />
            </svg>
        </button>
    );
};

export default MicButton;