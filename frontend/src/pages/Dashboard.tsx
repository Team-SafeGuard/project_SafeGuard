import React, { useState, useEffect } from 'react';
import {
    Filter, Download, Calendar, ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import { complaintsAPI } from '../utils/api';
import ChartOne from '../components/Charts/ChartOne';
import ChartTwo from '../components/Charts/ChartTwo';

// --- Mock Data ---
const MOCK_KEYWORDS = [
    { id: 1, text: '불법주차 신고', rank: 1, count: 1450, change: 120, changeType: 'up' },
    { id: 2, text: '친환경차 충전구역', rank: 2, count: 980, change: 45, changeType: 'up' },
    { id: 3, text: '충전구역 불법주차', rank: 3, count: 850, change: -12, changeType: 'down' },
    { id: 4, text: '사업 정상화', rank: 4, count: 720, change: 0, changeType: 'same' },
    { id: 5, text: '위례신사선 장기', rank: 5, count: 650, change: 15, changeType: 'up' },
    { id: 6, text: '주무 부처', rank: 6, count: 540, change: -5, changeType: 'down' },
    { id: 7, text: '핵심 교통망', rank: 7, count: 430, change: 8, changeType: 'up' },
    { id: 8, text: '사업촉진 관계기관', rank: 8, count: 320, change: 0, changeType: 'same' },
    { id: 9, text: '광역교통개선대책', rank: 9, count: 210, change: -20, changeType: 'down' },
    { id: 10, text: '변경사항 통보', rank: 10, count: 150, change: 5, changeType: 'up' },
];

const WORD_CLOUD_TAGS = [
    { text: '불법주차 신고', size: 60, color: '#ef4444' },
    { text: '불법 주정차', size: 55, color: '#ef4444' },
    { text: '주정차 신고', size: 45, color: '#f97316' },
    { text: '장애인 전용구역', size: 30, color: '#84cc16' },
    { text: '인도 불법', size: 28, color: '#06b6d4' },
    { text: '친환경차 충전구역', size: 35, color: '#10b981' },
    { text: '전용구역 불법주차', size: 40, color: '#3b82f6' },
    { text: '공사 소음', size: 25, color: '#8b5cf6' },
    { text: '도로 파손', size: 32, color: '#6366f1' },
    { text: '쓰레기 무단투기', size: 24, color: '#ec4899' },
];

const Dashboard = () => {
    const [stats, setStats] = useState({ total: 90, processing: 30, completed: 20 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await complaintsAPI.getStats();
                if (data && data.total) setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats, using fallback:', error);
            }
        };
        fetchStats();
    }, []);

    const received = stats.total - (stats.processing + stats.completed);

    return (
        <div className="dash-page">
            <style>{`
            .dash-page { min-height: 100vh; background: #f3f4f6; overflow: auto; }
            .dash-container { width: 100%; max-width: 1280px; margin: 0 auto; padding: 32px; }
            .dash-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
            .dash-title { font-size: 24px; font-weight: 800; color:#1f2937; }
            .dash-actions { display:flex; gap: 8px; }
            .dash-btn { padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 8px; background:#fff; font-size: 13px; cursor:pointer; }
            .dash-btn:hover { background:#f9fafb; }
            .dash-kpi-grid { display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 32px; }
            .dash-kpi-card { border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); height: 112px; display:flex; flex-direction:column; align-items:center; justify-content:center; border: 1px solid #e5e7eb; border-top-width: 4px; }
            .dash-kpi-title { color:#6b7280; font-weight: 800; margin-bottom: 8px; }
            .dash-kpi-value { font-size: 32px; font-weight: 900; }

            .dash-main { display:grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 24px; margin-bottom: 32px; }
            .dash-left { grid-column: span 4 / span 4; display:flex; flex-direction:column; gap: 24px; }
            .dash-right { grid-column: span 8 / span 8; }

            .dash-card { background:#fff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .dash-card-pad-4 { padding: 16px; }
            .dash-card-pad-6 { padding: 24px; }
            .dash-card-title { font-weight: 800; color:#374151; }

            .dash-bottom { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }

              .dash-right { grid-column: span 12 / span 12; }
              .dash-bottom { grid-template-columns: 1fr; }
            }
            /* Custom Scrollbar */
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
          `}</style>
            <div className="dash-container">
                {/* 상단 타이틀 및 필터 */}
                <div className="dash-header">
                    <h1 className="dash-title">관리자 대시보드</h1>
                    <div className="dash-actions">
                        <button className="dash-btn">일간/주간/월간</button>
                        <button className="dash-btn" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Download size={14} /> CSV 저장
                        </button>
                    </div>
                </div>

                {/* 1. KPI Cards Section (Original) */}
                <div className="dash-kpi-grid">
                    <KPICard title="전 체" value={stats.total} borderColor="#9ca3af" bg="#f9fafb" />
                    <KPICard title="접 수" value={received} borderColor="#3b82f6" bg="rgba(59,130,246,0.08)" text="#1e3a8a" />
                    <KPICard title="처리중" value={stats.processing} borderColor="#ef4444" bg="rgba(239,68,68,0.08)" text="#7f1d1d" />
                    <KPICard title="처리완료" value={stats.completed} borderColor="#22c55e" bg="rgba(34,197,94,0.08)" text="#14532d" />
                </div>

                {/* 2. Main Content Grid */}
                <div className="dash-main">
                    {/* Left: Donut Chart -> Replaced with ChartTwo */}
                    <div className="dash-left">
                        <ChartTwo />
                    </div>

                    {/* Right: Trend Chart -> Replaced with ChartOne */}
                    <div className="dash-right">
                        <ChartOne />
                    </div>
                </div>

                {/* 3. Bottom Grid: Keywords & Word Cloud */}
                <div className="dash-bottom">
                    {/* Keyword List */}
                    <div className="dash-card dash-card-pad-6" style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
                        <div className="flex justify-between items-center mb-4 border-b pb-2 flex-shrink-0">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <span>🔥 급증 키워드</span>
                                <span className="text-xs text-gray-400 font-normal">2026.01.12 12:00</span>
                            </h3>
                            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded border border-blue-100 font-medium">실시간 분석</span>
                        </div>
                        <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                            <ul className="space-y-3">
                                {MOCK_KEYWORDS.map((item, index) => (
                                    <li key={item.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                        {/* Rank */}
                                        <div className={`
                                            flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm
                                            ${item.rank <= 3 ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500'}
                                        `}>
                                            {item.rank}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium text-gray-700 truncate text-sm">{item.text}</span>
                                                <span className="text-xs text-gray-400">{item.count}건</span>
                                            </div>
                                            {/* Progress Bar background */}
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                {/* Progress Bar fill */}
                                                <div
                                                    className={`h-full rounded-full ${item.rank <= 3 ? 'bg-blue-400' : 'bg-slate-300'}`}
                                                    style={{ width: `${(item.count / 1450) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Change Indicator */}
                                        <div className="flex-shrink-0 w-12 text-right">
                                            <div className={`text-xs font-semibold flex items-center justify-end gap-0.5
                                                ${item.changeType === 'up' ? 'text-red-500' : item.changeType === 'down' ? 'text-blue-500' : 'text-gray-400'}
                                            `}>
                                                {item.changeType === 'up' && '▲'}
                                                {item.changeType === 'down' && '▼'}
                                                {item.changeType === 'same' && '-'}
                                                <span>{item.change !== 0 ? Math.abs(item.change) : ''}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Word Cloud */}
                    <div className="dash-card dash-card-pad-6" style={{ height: 400 }}>
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-gray-800">키워드 클라우드 <span className="text-xs text-gray-400 font-normal ml-2">2026.01.12 12:00</span></h3>
                        </div>
                        <div className="h-[300px] flex flex-wrap content-center justify-center gap-3 overflow-hidden relative">
                            {WORD_CLOUD_TAGS.map((tag, i) => (
                                <span
                                    key={i}
                                    className="inline-block transition-transform hover:scale-110 cursor-default font-bold"
                                    style={{
                                        fontSize: `${Math.max(0.8, tag.size / 16)}rem`,
                                        color: tag.color,
                                        opacity: 0.9
                                    }}
                                >
                                    {tag.text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, borderColor = '#9ca3af', bg = '#ffffff', text = '#111827' }) => (
    <div
        className="dash-kpi-card"
        style={{ borderTopColor: borderColor, background: bg }}
    >
        <div className="dash-kpi-title">{title}</div>
        <div className="dash-kpi-value" style={{ color: text }}>{value}</div>
    </div>
);

export default Dashboard;
