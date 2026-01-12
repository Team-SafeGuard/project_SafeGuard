/// <reference types="vite/client" />

export { };

declare global {
    interface Window {
        kakao: any;
        daum: any;
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
