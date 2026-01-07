import React, { useState, useRef } from 'react';
import axios from 'axios';

function ApplyVoice() {
    // ===== State =====
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [sttText, setSttText] = useState("");
    const [finalText, setFinalText] = useState("");
    const [analysisResult, setAnalysisResult] = useState(null);

    // ===== Refs =====
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    // ===== Utils =====
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercentage = Math.min((recordingTime / 300) * 100, 100);

    // ===== Recording =====
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                handleSTT(blob); // ✅ STT만 수행
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setAnalysisResult(null);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (e) {
            alert("마이크 접근 권한이 필요합니다.");
        }
    };

    const stopRecording = () => {
        if (!mediaRecorderRef.current) return;

        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

        setIsRecording(false);
        clearInterval(timerRef.current);
    };

    // ===== STT =====
    const handleSTT = async (blob) => {
        setIsLoading(true);
        const formData = new FormData();
        formData.append(
            "file",
            new File([blob], "voice.wav", { type: "audio/wav" })
        );

        try {
            const res = await axios.post("/api/stt/upload_voice", formData);
            setSttText(res.data.stt_text);
            setFinalText(res.data.stt_text); // textarea 자동 채움
        } catch (e) {
            alert("음성 인식 실패");
        } finally {
            setIsLoading(false);
        }
    };

    // ===== RAG =====
    const handleRAGAnalyze = async () => {
        if (!finalText.trim()) {
            alert("분석할 텍스트가 없습니다.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await axios.post("/api/rag/classify", {
                text: finalText
            });
            setAnalysisResult(res.data);
        } catch (e) {
            alert("AI 분석 실패");
        } finally {
            setIsLoading(false);
        }
    };

    // ===== Render =====
    return (
        <div style={{ padding: "40px 0" }}>
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>

                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
                    통합 민원 신청 (음성)
                </h2>

                {/* 제목 */}
                <input
                    type="text"
                    placeholder="민원 제목 (AI 분석 후 생성)"
                    value={analysisResult ? analysisResult.title : ""}
                    readOnly
                    style={{ width: "100%", padding: "12px", marginBottom: "20px" }}
                />

                {/* 마이크 */}
                <div
                    onClick={isRecording ? stopRecording : startRecording}
                    style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        margin: "0 auto 20px",
                        border: "4px solid #6366F1",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer"
                    }}
                >
                    {isRecording ? "STOP" : "REC"}
                </div>

                <div style={{ textAlign: "center", marginBottom: 10 }}>
                    {isRecording
                        ? `녹음 중... ${formatTime(recordingTime)}`
                        : "마이크를 눌러 녹음하세요"}
                </div>

                {/* STT textarea */}
                <textarea
                    value={finalText}
                    onChange={(e) => setFinalText(e.target.value)}
                    placeholder="음성 인식 결과가 여기에 표시됩니다. 수정 가능합니다."
                    style={{
                        width: "100%",
                        minHeight: "140px",
                        padding: "12px",
                        marginBottom: "20px"
                    }}
                />

                {/* 분석 버튼 */}
                <button
                    onClick={handleRAGAnalyze}
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        padding: "14px",
                        backgroundColor: "#6366F1",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        marginBottom: "30px"
                    }}
                >
                    AI 분석하기
                </button>

                {/* 결과 */}
                {analysisResult && (
                    <div style={{ background: "#EEF2FF", padding: "20px", borderRadius: "8px" }}>
                        <p><b>민원 유형:</b> {analysisResult.category}</p>
                        <p><b>처리 기관:</b> {analysisResult.agency}</p>
                        <p><b>민원 내용:</b></p>
                        <p>{finalText}</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ApplyVoice;