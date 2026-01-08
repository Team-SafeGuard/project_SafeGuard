import React, { useEffect, useState } from 'react';
import { complaintsAPI } from '../utils/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await complaintsAPI.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: '전체', value: stats.total, color: '#6366f1', icon: '📊' },
        { label: '접수', value: stats.total - (stats.processing + stats.completed), color: '#3b82f6', icon: '📥' },
        { label: '처리중', value: stats.processing, color: '#f59e0b', icon: '⏳' },
        { label: '완료', value: stats.completed, color: '#10b981', icon: '✅' }
    ];

    return (
        <div style={{ padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '32px' }}>대시보드</h1>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {statCards.map((card, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'white',
                            padding: '32px',
                            borderRadius: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: '600', marginBottom: '12px' }}>{card.label}</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: card.color }}>{card.value}</div>
                        </div>
                    ))}
                </div>

                {/* Main Content Areas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* TOP 5 Chart Placeholder */}
                    <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px' }}>민원분류별 현황 TOP 5</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                            <svg width="240" height="240" viewBox="0 0 240 240">
                                <circle cx="120" cy="120" r="100" fill="none" stroke="#f1f5f9" strokeWidth="40" />
                                <circle cx="120" cy="120" r="100" fill="none" stroke="#6366f1" strokeWidth="40" strokeDasharray="400 628" strokeDashoffset="0" />
                                <text x="120" y="110" textAnchor="middle" fontSize="14" fill="#64748b">민원분류별 현황</text>
                                <text x="120" y="145" textAnchor="middle" fontSize="32" fontWeight="800" fill="#1e293b">TOP 5</text>
                            </svg>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#ef4444', fontWeight: '700' }}>1 교통</span>
                                <span style={{ fontWeight: '600' }}>4,486 건 <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>▼ -12.4%</span></span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                                <span style={{ color: '#f59e0b', fontWeight: '700' }}>2 행정안전</span>
                                <span style={{ fontWeight: '600' }}>650 건 <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>▼ -2.4%</span></span>
                            </li>
                            <li style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                                <span style={{ color: '#64748b' }}>... 나머지 항목</span>
                            </li>
                        </ul>
                    </div>

                    {/* Chart Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '24px' }}>민원 현황 트렌드</h3>
                            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                                    <div key={i} style={{ flex: 1, backgroundColor: i === 6 ? '#6366f1' : '#e2e8f0', height: `${h}%`, borderRadius: '4px' }}></div>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '16px' }}>키워드 클라우드</h3>
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: '800', color: '#ef4444', margin: '0 10px' }}>불법 주정차</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#3b82f6', margin: '0 10px' }}>교통사고</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#10b981', margin: '0 10px' }}>쓰레기 투기</span>
                                <span style={{ fontSize: '1rem', color: '#64748b', margin: '0 10px' }}>도로 파손</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
