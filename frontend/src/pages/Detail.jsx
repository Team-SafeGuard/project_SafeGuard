import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI, authAPI } from '../utils/api';

function Detail() {
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [user, setUser] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const navigate = useNavigate();

    const fetchDetail = async () => {
        try {
            const data = await complaintsAPI.getDetail(id);
            setReport(data);
            if (data.answer) setAnswerText(data.answer);
        } catch (err) {
            console.error('Failed to fetch report detail:', err);
        }
    };

    const fetchUser = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authAPI.getMe();
                setUser(userData);
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
        }
    };

    useEffect(() => {
        fetchDetail();
        fetchUser();
    }, [id]);

    const handleStatusChange = async (newStatus) => {
        if (!user || user.role !== 'AGENCY') return;
        try {
            await complaintsAPI.updateStatus(id, newStatus);
            setReport(prev => ({ ...prev, status: newStatus }));
            alert('상태가 변경되었습니다.');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAnswerSubmit = async () => {
        if (!user || user.role !== 'AGENCY') return;
        try {
            await complaintsAPI.updateAnswer(id, answerText);
            setReport(prev => ({ ...prev, answer: answerText }));
            alert('답변이 등록되었습니다.');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLike = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요한 서비스입니다.');
            navigate('/login');
            return;
        }

        try {
            await complaintsAPI.toggleLike(id);
            const updated = await complaintsAPI.getDetail(id);
            setReport(updated);
        } catch (err) {
            console.error('Failed to update like:', err);
            alert('좋아요 처리 실패');
        }
    };

    if (!report) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}>로딩중...</div>;

    const statusMap = {
        'RECEIVED': '접수 완료',
        'IN_PROGRESS': '처리중',
        'COMPLETED': '처리완료',
        'REJECTED': '반려',
        'CANCELLED': '취소'
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const steps = [
        { key: 'RECEIVED', label: '접수 완료', icon: '📥' },
        { key: 'IN_PROGRESS', label: '처리중', icon: '🛠️' },
        { key: 'COMPLETED', label: '처리완료', icon: '✅' }
    ];

    const statusOrder = ['RECEIVED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = Math.max(statusOrder.indexOf(report.status), 0);
    const progressPercent = (currentIndex / (statusOrder.length - 1)) * 100;

    const getStepStyle = (index) => {
        const isActive = index <= currentIndex;
        return {
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#e2e8f0',
            color: isActive ? 'white' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: isActive ? '0 10px 24px rgba(99, 102, 241, 0.3)' : 'none'
        };
    };

    return (
        <div className="detail-page" style={{ padding: '60px 0' }}>
            <div className="container" style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#777' }}>민원목록 &gt; 민원 상세 보기</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-dark)', marginBottom: '30px' }}>{report.title}</h2>
                    <button
                        onClick={handleLike}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: report.liked ? '#fff1f2' : 'white',
                            color: report.liked ? '#e11d48' : '#64748b',
                            border: report.liked ? '1px solid #fda4af' : '1px solid #e2e8f0',
                            borderRadius: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            boxShadow: report.liked ? 'none' : '0 2px 5px rgba(0,0,0,0.05)',
                            minWidth: '100px',
                            justifyContent: 'center'
                        }}
                    >
                        {report.liked ? '❤️' : '🤍'} {report.likeCount || 0}
                    </button>
                </div>

                {/* Info Table */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid #EEE', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid #EEE' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>신고번호</div><div style={{ padding: '12px' }}>{report.complaintNo}</div></div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #EEE' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>신고유형</div><div style={{ padding: '12px' }}>{report.category}</div></div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #EEE' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>지역</div><div style={{ padding: '12px' }}>{report.address}</div></div>
                    <div style={{ display: 'flex', borderBottom: '1px solid #EEE' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>작성자</div><div style={{ padding: '12px' }}>{report.authorName}</div></div>
                    <div style={{ display: 'flex' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>신고일</div><div style={{ padding: '12px' }}>{formatDate(report.createdDate)}</div></div>
                    <div style={{ display: 'flex' }}><div style={{ width: '120px', backgroundColor: '#F8FAFC', padding: '12px', fontWeight: 'bold' }}>처리상태</div><div style={{ padding: '12px', color: '#3F51B5', fontWeight: 'bold' }}>{statusMap[report.status] || report.status}</div></div>
                </div>

                {/* Content Section */}
                <h3 style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>민원 내용</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', marginBottom: '50px' }}>
                    <div style={{ width: '100%', aspectRatio: '4/3', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {report.imagePath ? (
                            <img src={report.imagePath} alt="ReportAttachment" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '8px' }} onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                            }} />
                        ) : '이미지 없음'}
                    </div>
                    <div style={{ lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{report.content}</div>
                </div>

                {/* Manager Answer Section */}
                <h3 style={{ marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>담당자 답변</h3>
                <div style={{ marginBottom: '50px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                    {user && user.role === 'AGENCY' ? (
                        <div>
                            <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="답변 내용을 입력하세요..."
                                style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}
                            />
                            <div style={{ textAlign: 'right' }}>
                                <button
                                    onClick={handleAnswerSubmit}
                                    style={{ padding: '8px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    답변 등록
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ whiteSpace: 'pre-wrap', color: report.answer ? '#333' : '#94a3b8' }}>
                            {report.answer || '아직 답변이 등록되지 않았습니다.'}
                        </div>
                    )}
                </div>

                {/* Workflow Section */}
                <h3 style={{ marginBottom: '16px' }}>민원 처리 현황</h3>
                <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '20px',
                    padding: '28px 24px',
                    marginBottom: '50px'
                }}>
                    <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto 24px' }}>
                        <div style={{
                            position: 'absolute',
                            top: '28px',
                            left: '28px',
                            right: '28px',
                            height: '8px',
                            borderRadius: '999px',
                            backgroundColor: '#e2e8f0'
                        }} />
                        <div style={{
                            position: 'absolute',
                            top: '28px',
                            left: '28px',
                            height: '8px',
                            borderRadius: '999px',
                            width: `calc(${progressPercent}% - 0px)`,
                            background: 'linear-gradient(90deg, #6366f1 0%, #22c55e 100%)',
                            transition: 'width 0.3s ease'
                        }} />
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            {steps.map((step, index) => (
                                <div key={step.key} style={{ textAlign: 'center' }}>
                                    <div style={getStepStyle(index)}>{step.icon}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '520px', margin: '0 auto' }}>
                        {steps.map((step, index) => (
                            <div key={step.key}
                                onClick={() => user && user.role === 'AGENCY' && handleStatusChange(step.key)}
                                style={{
                                    textAlign: 'center',
                                    flex: 1,
                                    color: index <= currentIndex ? '#1f2937' : '#94a3b8',
                                    fontWeight: index <= currentIndex ? '700' : '600',
                                    cursor: user && user.role === 'AGENCY' ? 'pointer' : 'default'
                                }}>
                                {step.label}
                                {user && user.role === 'AGENCY' && index !== currentIndex && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '4px' }}>(변경)</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ padding: '12px 40px', backgroundColor: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        목 록
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Detail;