import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintsAPI, sttAPI, getToken, analyzeText } from '../utils/api';
import Modal from '../components/common/Modal';
import AiAnalyzeTooltip from '../components/common/AiAnalyzeTooltip';

function ApplyVoice() {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const accumulatedTextRef = useRef(''); // STT 누적 텍스트 저장을 위한 Ref 추가
    const titleInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        isPublic: true,
        location: null
    });

    const [loading, setLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // 모달 상태
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        callback?: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        callback: undefined
    });

    const showAlert = (title: string, message: string, callback?: () => void) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            callback
        });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
        if (modalConfig.callback) {
            modalConfig.callback();
        }
    };
    const [ragResult, setRagResult] = useState(null);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [previewText, setPreviewText] = useState(''); // 실시간 미리보기용 텍스트
    const previewTextRef = useRef(''); // onstop 시점 최신 값 참조용
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const recognitionRef = useRef(null);

    /** 녹음 타이머 */
    useEffect(() => {
        let timer;
        if (isRecording) {
            timer = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRecording]);

    /** 브라우저 실시간 음성 인식 (미리보기용) */
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'ko-KR';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let interimAndFinal = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;

                // [Filter] 한글(음절, 자모), 숫자, 공백, 기본 문장부호(.,?!)만 허용
                // 영어(a-z), 한자, 기타 특수문자 포함 시 해당 청크 전체 무시 (환각 방지)
                if (/[^가-힣ㄱ-ㅎㅏ-ㅣ0-9\s.,?!]/.test(transcript)) {
                    continue;
                }

                // [Filter] 2. 너무 짧은 텍스트 무시 
                if (transcript.trim().length < 2) {
                    continue;
                }

                if (event.results[i].isFinal) {
                    accumulatedTextRef.current += transcript + ' ';
                } else {
                    interimAndFinal += transcript;
                }
            }

            // 최종 텍스트 + 임시 텍스트 조합
            const fullText = accumulatedTextRef.current + interimAndFinal;

            setPreviewText(fullText);
            setFormData(prev => ({ ...prev, content: fullText }));
            previewTextRef.current = fullText;
        };

        // 녹음 재시작 시 기존 누적 텍스트 유지를 위해 초기화 하지 않음 
        // (단, '다시 쓰기' 같은 기능이 있다면 accumulatedTextRef.current = '' 필요)

        recognitionRef.current = recognition;
    }, []);

    /** 🎤 녹음 시작 / 종료 */
    const handleToggleRecord = async () => {
        if (isRecording) {
            // STOP
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
            return;
        }

        // ▶ START
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Safari 등 범용성을 위해 mimeType 체크 (가능하면 webm, 아니면 기본)
            const options = MediaRecorder.isTypeSupported('audio/webm')
                ? { mimeType: 'audio/webm' }
                : {};

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: options.mimeType || 'audio/wav' });

                // [UX fix] 텍스트가 비어있거나(무음/필터링됨), 공백뿐이라면 서버 요청 스킵
                if (!previewTextRef.current || !previewTextRef.current.trim()) {
                    console.log("STT Skipped: Empty text");
                    setIsTranscribing(false);
                    return;
                }

                setIsTranscribing(true); // 변환 중 표시

                try {
                    // [Fix] PR #52: 브라우저 인식 텍스트(previewText)를 서버로 전달하여
                    // 백엔드의 Priority Check(Whisper 스킵)가 동작하도록 변경.
                    const result = await sttAPI.transcribe(audioBlob, previewTextRef.current);

                    let finalContent = '';

                    // UnifiedComplaintManager response mapping
                    if (result?.original_text) {
                        finalContent = result.original_text;
                    } else if (result?.stt_text) {
                        finalContent = result.stt_text;
                    }

                    // 서버 STT 결과가 비어있다면(무음 필터링됨), 사용자에게 알림 없이 조용히 처리 (또는 빈 값 유지)
                    // 기존 previewTextRef.current 값은 신뢰하지 않음.

                    setFormData(prev => ({
                        ...prev,
                        content: finalContent
                    }));



                } catch (err) {
                    showAlert('오류', '음성 인식에 실패했습니다: ' + err.message);
                } finally {
                    setIsTranscribing(false);
                    stream.getTracks().forEach(t => t.stop());
                }
            };

            setFormData(prev => ({ ...prev, content: '' }));

            // [Fix] 녹음 시작 전, 현재 텍스트를 누적 Ref에 동기화하여 이어쓰기 보장
            // 기존 텍스트가 있다면 뒤에 공백 추가하여 자연스럽게 이어지도록 함
            const currentContent = formData.content || '';
            accumulatedTextRef.current = currentContent + (currentContent && !currentContent.endsWith(' ') ? ' ' : '');

            mediaRecorder.start();
            if (recognitionRef.current) {
                // [Fix] 중요: 세션이 새로 시작되므로 브라우저 내부 상태 초기화됨
                // 따라서 accumulatedTextRef를 위에서 동기화해주는 것이 핵심
                recognitionRef.current.start();
            }

            setRecordingTime(0);
            setPreviewText('');
            previewTextRef.current = '';
            setIsRecording(true);

        } catch (err) {
            console.error(err);
            showAlert('오류', '마이크 접근 권한이 필요합니다.');
        }
    };

    /** 시간 표시 */
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    /** 카카오 지도 초기화 */
    useEffect(() => {
        const loadKakaoMap = () => {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(() => {
                    const container = mapRef.current;
                    const options = {
                        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
                        level: 3
                    };
                    const newMap = new window.kakao.maps.Map(container, options);
                    mapInstance.current = newMap;

                    const marker = new window.kakao.maps.Marker({
                        position: newMap.getCenter(),
                        map: newMap
                    });
                    markerInstance.current = marker;

                    // 현재 위치 자동 감지
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                            const lat = position.coords.latitude;
                            const lng = position.coords.longitude;
                            const locPosition = new window.kakao.maps.LatLng(lat, lng);

                            newMap.setCenter(locPosition);
                            marker.setPosition(locPosition);

                            const geocoder = new window.kakao.maps.services.Geocoder();
                            geocoder.coord2Address(lng, lat, (result, status) => {
                                if (status === window.kakao.maps.services.Status.OK) {
                                    const addr = result[0].address.address_name;
                                    setFormData(prev => ({
                                        ...prev,
                                        location: { lat, lng, address: addr }
                                    }));
                                }
                            });
                        });
                    }

                    window.kakao.maps.event.addListener(newMap, 'click', (mouseEvent) => {
                        const latlng = mouseEvent.latLng;
                        marker.setPosition(latlng);

                        const geocoder = new window.kakao.maps.services.Geocoder();
                        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                const addr = result[0].address.address_name;
                                setFormData(prev => ({
                                    ...prev,
                                    location: { lat: latlng.getLat(), lng: latlng.getLng(), address: addr }
                                }));
                            }
                        });
                    });
                });
            }
        };

        const kakaoKey = import.meta.env.VITE_KAKAO_MAP_KEY;
        if (kakaoKey) {
            const script = document.createElement('script');
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services`;
            script.async = true;
            script.onload = loadKakaoMap;
            document.head.appendChild(script);

            // Daum Postcode Script
            const postcodeScript = document.createElement('script');
            postcodeScript.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            postcodeScript.async = true;
            document.head.appendChild(postcodeScript);

            return () => {
                document.head.removeChild(script);
                if (document.head.contains(postcodeScript)) {
                    document.head.removeChild(postcodeScript);
                }
            };
        }
    }, []);

    /** 단계 업데이트 */
    // 단계 업데이트
    useEffect(() => {
        if (formData.title && currentStep < 2) setCurrentStep(2);
        if (formData.title && formData.content && currentStep < 3) setCurrentStep(3);
        if (formData.title && formData.content && ragResult && currentStep < 4) setCurrentStep(4);
        if (formData.title && formData.content && ragResult && formData.location && currentStep < 5) setCurrentStep(5);
    }, [formData, ragResult]);


    // Update map when location changes programmatically
    useEffect(() => {
        if (formData.location && mapInstance.current && markerInstance.current && window.kakao) {
            const loc = new window.kakao.maps.LatLng(formData.location.lat, formData.location.lng);
            mapInstance.current.setCenter(loc);
            markerInstance.current.setPosition(loc);
        }
    }, [formData.location]);

    const handleStepClick = (stepNum: number) => {
        switch (stepNum) {
            case 1:
                titleInputRef.current?.focus();
                break;
            case 2:
                // Focus or scroll to recording section if needed
                break;
            case 3:
                handleAnalyze();
                break;
            case 4:
                handleSearchAddress();
                break;
            default:
                break;
        }
    };

    const handleSearchAddress = () => {
        if (!window.daum || !window.daum.Postcode) {
            showAlert('알림', '주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        new window.daum.Postcode({
            oncomplete: function (data) {
                const addr = data.roadAddress || data.jibunAddress;
                // 주소로 좌표 검색
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(addr, function (result, status) {
                    if (status === window.kakao.maps.services.Status.OK) {
                        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                        setFormData(prev => ({
                            ...prev,
                            location: {
                                lat: parseFloat(result[0].y),
                                lng: parseFloat(result[0].x),
                                address: addr
                            }
                        }));
                    }
                });
            }
        }).open();
    };

    // AI 가이드 상태
    const [showAiGuide, setShowAiGuide] = useState(false);

    // AI 가이드 자동 표시
    useEffect(() => {
        if (!ragResult && formData.content && formData.content.trim().length > 0) {
            setShowAiGuide(true);
        } else {
            setShowAiGuide(false);
        }
    }, [formData.content, ragResult]);

    /** RAG 분석 */
    const handleAnalyze = async () => {
        if (!formData.content) return;

        setShowAiGuide(false); // 가이드 숨김

        setIsAnalyzing(true);
        try {
            const result = await analyzeText(formData.content);
            setRagResult(result);
        } catch (err: any) {
            showAlert('오류', 'AI 분석 실패: ' + err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // 1. 이미지 파일 검증
            if (!selectedFile.type.startsWith('image/')) {
                showAlert("알림", "이미지 파일만 업로드 가능합니다.");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            // 2. 용량 체크 (5MB)
            const MAX_SIZE = 5 * 1024 * 1024;
            if (selectedFile.size > MAX_SIZE) {
                showAlert("알림", "이미지 용량은 5MB 이하만 업로드 가능합니다.");
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            setFile(selectedFile);

            // 이미지일 경우 미리보기 생성
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /** 민원 제출 */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!getToken()) {
            showAlert('알림', '로그인이 필요합니다.', () => navigate('/login'));
            return;
        }

        if (!formData.title || !formData.content) {
            showAlert('알림', '제목과 음성 인식을 완료해주세요.');
            return;
        }

        if (!ragResult) {
            showAlert('알림', 'AI 분석을 진행해주세요.');
            return;
        }

        setLoading(true);

        try {
            const complaintData = {
                category: ragResult?.category || '음성',
                agencyName: ragResult?.agency_name || null,
                agencyCode: ragResult?.agency_code || null,
                title: formData.title,
                content: formData.content,
                isPublic: formData.isPublic,
                location: formData.location
            };

            const submitData = new FormData();
            submitData.append('complaint', JSON.stringify(complaintData));
            if (file) {
                submitData.append('file', file);
            }

            const res = await complaintsAPI.create(submitData);

            showAlert('접수 완료', `음성 민원이 접수되었습니다. (접수번호: ${res.complaintNo})`, () => navigate('/list', { state: { fromSubmission: true } }));
        } catch (err: any) {
            showAlert('오류', err.message);
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: '제목 입력', done: !!formData.title },
        { num: 2, label: '음성 녹음', done: !!formData.content },
        { num: 3, label: 'AI 분석', done: !!ragResult },
        { num: 4, label: '위치 선택', done: !!formData.location },
        { num: 5, label: '접수 완료', done: false }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
                        🎙️ 음성 민원 신청
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>목소리로 쉽고 빠르게 민원을 신청하세요</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: '24px' }}>
                    {/* 왼쪽 - 진행 단계 */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#374151', marginBottom: '24px' }}>
                            📋 작성 단계
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {steps.map((step) => (
                                <div
                                    key={step.num}
                                    onClick={() => handleStepClick(step.num)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        backgroundColor: currentStep > step.num || step.done ? '#7c3aed' : currentStep === step.num ? '#eef2ff' : '#f1f5f9',
                                        color: currentStep > step.num || step.done ? 'white' : currentStep === step.num ? '#7c3aed' : '#94a3b8',
                                        border: currentStep === step.num ? '2px solid #7c3aed' : 'none',
                                        transition: 'all 0.3s'
                                    }}>
                                        {currentStep > step.num || step.done ? '✓' : step.num}
                                    </div>
                                    <span style={{
                                        fontSize: '0.95rem',
                                        fontWeight: currentStep === step.num ? '600' : '400',
                                        color: currentStep === step.num ? '#1e293b' : '#64748b'
                                    }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 가운데 - 메인 폼 */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                            padding: '24px 30px',
                            color: 'white'
                        }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>음성 민원 신청서</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '6px' }}>음성으로 민원을 작성할 수 있습니다</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '30px' }}>

                            {/* 제목 입력 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    민원 제목 <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    ref={titleInputRef}
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="민원 제목을 입력하세요"
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* 음성 녹음 섹션 */}
                            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '16px', textAlign: 'left' }}>
                                    음성 녹음 <span style={{ color: '#ef4444' }}>*</span>
                                </label>

                                <div style={{
                                    padding: '40px',
                                    backgroundColor: isRecording ? '#faf5ff' : '#f8fafc',
                                    borderRadius: '16px',
                                    border: isRecording ? '2px solid #7c3aed' : '2px dashed #cbd5e1',
                                    transition: 'all 0.3s'
                                }}>
                                    <div
                                        onClick={handleToggleRecord}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            backgroundColor: isRecording ? '#ef4444' : '#7c3aed',
                                            margin: '0 auto 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: isRecording ? '0 0 0 10px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(124, 58, 237, 0.3)',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{isRecording ? '⏹' : '🎤'}</span>
                                    </div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '700', color: isRecording ? '#ef4444' : '#1e293b', marginBottom: '12px' }}>
                                        {isRecording ? formatTime(recordingTime) : (isTranscribing ? '음성 변환 중...' : '녹음 시작')}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', minHeight: '1.2em' }}>
                                        {isRecording ? (
                                            <span>음성인식중....</span>
                                        ) : (
                                            isTranscribing ? '잠시만 기다려주세요...' : '버튼을 눌러 음성 인식을 하세요'
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 인식된 텍스트 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    음성인식 내용 (수정 가능)
                                </label>
                                <textarea
                                    value={formData.content}

                                    // [Fix] 사용자가 직접 수정한 내용도 STT 누적 변수에 동기화
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, content: val }));
                                        if (!isRecording) { // 녹음 중이 아닐 때만 동기화 (충돌 방지)
                                            accumulatedTextRef.current = val;
                                        }
                                    }}
                                    disabled={isRecording} // [Fix] 녹음 중 수정 방지 (Ghost UX 방지)

                                    placeholder="음성 인식 결과가 여기에 표시됩니다. 직접 입력도 가능합니다."
                                    style={{
                                        width: '100%',
                                        height: '140px',
                                        padding: '14px 18px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        resize: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                        backgroundColor: isRecording ? '#f1f5f9' : 'white', // 시각적 피드백
                                        color: isRecording ? '#64748b' : 'inherit'
                                    }}
                                />


                            </div>

                            {/* 파일 첨부 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    <span>파일 첨부</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '400', color: '#94a3b8', marginLeft: '12px' }}>
                                        (5MB 이하의 이미지 파일만 업로드 가능합니다)
                                    </span>
                                </label>
                                <div style={{
                                    padding: '10px 14px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>📷</span>
                                    <input
                                        type="text"
                                        value={file ? file.name : ''}
                                        readOnly
                                        placeholder="현장 사진을 첨부해주세요"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            width: '100%',
                                            fontSize: '1rem',
                                            color: '#1e293b',
                                            fontWeight: '500',
                                            outline: 'none',
                                            cursor: 'default',
                                            flex: 1
                                        }}
                                    />
                                    {file && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                fontSize: '1.1rem',
                                                padding: '0 4px',
                                                marginRight: '4px'
                                            }}
                                            title="파일 삭제"
                                        >
                                            ✕
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                        id="file-upload"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            margin: 0
                                        }}
                                    >
                                        📂 파일 선택
                                    </label>
                                </div>
                                {previewUrl && (
                                    <div style={{ marginTop: '12px' }}>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '220px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* 위치 선택 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                                    발생 위치
                                    <span style={{ fontWeight: '400', color: '#94a3b8', marginLeft: '8px' }}>지도를 클릭하여 선택</span>
                                </label>
                                <div style={{
                                    padding: '10px 14px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontSize: '1.1rem' }}>📍</span>
                                    <input
                                        type="text"
                                        value={formData.location?.address || ''}
                                        readOnly
                                        placeholder="주소 검색 버튼을 눌러주세요"
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            width: '100%',
                                            fontSize: '1rem',
                                            color: '#1e293b',
                                            fontWeight: '500',
                                            outline: 'none',
                                            cursor: 'default'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSearchAddress}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap'
                                        }}
                                    >
                                        🔍 주소 검색
                                    </button>
                                </div>
                                <div
                                    ref={mapRef}
                                    style={{
                                        width: '100%',
                                        height: '250px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: '1px solid #e2e8f0'
                                    }}
                                />
                            </div>

                            {/* 공개 여부 */}
                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                                    공개 여부
                                </label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {[{ value: true, label: '🌐 공개', desc: '다른 시민들도 볼 수 있음' }, { value: false, label: '🔒 비공개', desc: '나와 담당자만 확인 가능' }].map(opt => (
                                        <label key={String(opt.value)} style={{
                                            flex: 1,
                                            padding: '16px',
                                            borderRadius: '12px',
                                            border: formData.isPublic === opt.value ? '2px solid #7c3aed' : '2px solid #e2e8f0',
                                            backgroundColor: formData.isPublic === opt.value ? '#faf5ff' : 'white',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                            <input
                                                type="radio"
                                                checked={formData.isPublic === opt.value}
                                                onChange={() => setFormData(prev => ({ ...prev, isPublic: opt.value }))}
                                                style={{ display: 'none' }}
                                            />
                                            <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{opt.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{opt.desc}</div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    background: loading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '14px',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.4)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? '접수 중...' : '🚀 민원 접수하기'}
                            </button>
                        </form>
                    </div>

                    {/* 오른쪽 - AI 분석 결과 */}
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        // overflow: 'hidden', // 툴팁 잘림 방지
                        height: 'fit-content',
                        position: 'sticky',
                        top: '100px'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            padding: '20px',
                            color: 'white',
                            textAlign: 'center',
                            borderTopLeftRadius: '20px',
                            borderTopRightRadius: '20px'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤖</div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>AI 분석 결과</h3>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                padding: '18px',
                                backgroundColor: '#f5f3ff',
                                borderRadius: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: '600', marginBottom: '8px' }}>
                                    📊 민원 유형
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
                                    {ragResult ? ragResult.category : '분석 대기'}
                                </div>
                            </div>
                            <div style={{
                                padding: '18px',
                                backgroundColor: '#fdf4ff',
                                borderRadius: '12px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: '600', marginBottom: '8px' }}>
                                    🏛️ 처리 기관
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', textAlign: 'center' }}>
                                    {ragResult ? ragResult.agency_name : '-'}
                                </div>
                            </div>

                            <div style={{ position: 'relative' }}>
                                {showAiGuide && <AiAnalyzeTooltip />}
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !formData.content}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: (isAnalyzing || !formData.content) ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: (isAnalyzing || !formData.content) ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    {isAnalyzing ? '분석 중...' : '🤖 AI 분석하기'}
                                </button>
                            </div>


                        </div>
                    </div>
                </div>
            </div >

            {/* 공통 모달 적용 */}
            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
            >
                {modalConfig.message}
            </Modal>
        </div>
    );
}

export default ApplyVoice;