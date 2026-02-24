import React from 'react';

const AiAnalyzeTooltip = () => {
    return (
        <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '8px',
            padding: '8px 16px',
            backgroundColor: '#10b981', // emerald-500
            color: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 10,
            animation: 'fadeInDown 0.3s ease-out'
        }}>
            <style>{`
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translate(-50%, -10px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
            {/* Arrow */}
            <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '6px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent #10b981 transparent'
            }} />
            ✨ AI 분석 버튼을 눌러주세요.
        </div>
    );
};

export default AiAnalyzeTooltip;
