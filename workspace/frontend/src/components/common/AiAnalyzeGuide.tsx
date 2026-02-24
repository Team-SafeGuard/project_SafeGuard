import React from 'react';

const AiAnalyzeGuide = () => {
    return (
        <div style={{
            marginBottom: '10px',
            padding: '12px 16px',
            backgroundColor: '#f0fdf4', // light green bg
            border: '1px solid #86efac', // green border
            borderRadius: '12px',
            color: '#166534', // green text
            fontSize: '0.95rem',
            fontWeight: '600',
            textAlign: 'center',
            animation: 'pulse 2s infinite',
            boxShadow: '0 0 10px rgba(74, 222, 128, 0.2)'
        }}>
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
                }
            `}</style>
            ✨ 입력이 완료되었습니다. AI 분석 버튼을 눌러주세요.
        </div>
    );
};

export default AiAnalyzeGuide;
