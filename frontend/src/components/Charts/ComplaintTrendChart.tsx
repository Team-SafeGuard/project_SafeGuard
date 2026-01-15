/**
 * [환경] 상세 분석 및 트렌드 (개선版)
 * - 상단 KPI 카드 3개: 이번 달 접수/완료/현재 Backlog(+전월 대비)
 * - 차트 2개 분리:
 *   A) 접수/완료 추이 (라인 2개)
 *   B) Backlog(잔량) 추이 (라인 1개)
 */
import React, { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartOneProps {
    selectedCategory: string;
}

type TrendRow = { date: string; received: number; completed: number; backlog: number };

type BacklogStats = {
    current: number;
    diff: number;           // 전월 대비 증감(건)
    changePercent: number | null; // 전월 대비 증감(%). prev=0이면 null(N/A)
    changeType: 'increase' | 'decrease';
};

const KpiCard: React.FC<{ title: string; value: string; sub?: React.ReactNode }> = ({ title, value, sub }) => (
    <div
        style={{
            minWidth: 190,
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '12px 14px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 6px 14px rgba(15, 23, 42, 0.04)',
        }}
    >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#64748B' }}>{title}</div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 950, color: '#0F172A' }}>{value}</div>
        {sub && <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#64748B' }}>{sub}</div>}
    </div>
);

const ComplaintTrendChart: React.FC<ChartOneProps> = ({ selectedCategory }) => {
    const [trendData, setTrendData] = useState<TrendRow[]>([]);
    const [backlogStats, setBacklogStats] = useState<BacklogStats>({
        current: 0,
        diff: 0,
        changePercent: null,
        changeType: 'increase',
    });

    useEffect(() => {
        const url = `/api/complaints/stats/dashboard?category=${encodeURIComponent(selectedCategory)}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (!data?.monthlyTrend || !data?.summary) return;

                const trends = data.monthlyTrend as Array<{ month: string; received: number; completed: number }>;

                // NOTE: 현재 pending(미처리)을 앵커로 잡아 과거 backlog를 역산하는 방식
                const currentProcessing = (data.summary.received ?? 0) + (data.summary.processing ?? 0) + (data.summary.completed ?? 0);
                // Note: 기존 로직에서는 received + processing을 pending으로 보았으나, 
                // 실제 백로그 계산을 위해서는 현재 상태를 기준으로 역산이 필요함.
                // 기존 코드 로직 (data.summary.received + data.summary.processing) 유지
                const anchorPending = (data.summary.received ?? 0) + (data.summary.processing ?? 0);

                const processed: TrendRow[] = [];
                let tempBacklog = anchorPending;

                // 뒤에서 앞으로 역산
                for (let i = trends.length - 1; i >= 0; i--) {
                    const item = trends[i];
                    processed.unshift({
                        date: item.month,
                        received: item.received ?? 0,
                        completed: item.completed ?? 0,
                        backlog: tempBacklog,
                    });

                    tempBacklog = tempBacklog - (item.received ?? 0) + (item.completed ?? 0);
                    if (tempBacklog < 0) tempBacklog = 0;
                }

                setTrendData(processed);

                // Backlog 전월 대비
                if (processed.length >= 2) {
                    const last = processed[processed.length - 1].backlog;
                    const prev = processed[processed.length - 2].backlog;
                    const diff = last - prev;
                    const percent = prev === 0 ? null : (diff / prev) * 100;

                    setBacklogStats({
                        current: last,
                        diff,
                        changePercent: percent === null ? null : Math.abs(parseFloat(percent.toFixed(1))),
                        changeType: diff >= 0 ? 'increase' : 'decrease',
                    });
                } else if (processed.length === 1) {
                    setBacklogStats({ current: processed[0].backlog, diff: 0, changePercent: null, changeType: 'increase' });
                } else {
                    setBacklogStats({ current: 0, diff: 0, changePercent: null, changeType: 'increase' });
                }
            })
            .catch((err) => console.error('Failed to fetch dashboard trends:', err));
    }, [selectedCategory]);

    const dates = useMemo(() => trendData.map((d) => d.date), [trendData]);
    const receivedData = useMemo(() => trendData.map((d) => d.received), [trendData]);
    const completedData = useMemo(() => trendData.map((d) => d.completed), [trendData]);
    const backlogData = useMemo(() => trendData.map((d) => d.backlog), [trendData]);

    // KPI (이번 달 접수/완료)
    const kpi = useMemo(() => {
        const last = trendData.at(-1);
        return {
            receivedLast: last?.received ?? 0,
            completedLast: last?.completed ?? 0,
        };
    }, [trendData]);

    // 공통: 축/그리드/툴팁 스타일
    const baseOptions = useMemo(
        () => ({
            chart: {
                fontFamily: 'Pretendard, sans-serif',
                toolbar: { show: false },
                animations: { enabled: true },
                zoom: { enabled: false }
            },
            dataLabels: { enabled: false },
            grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
            xaxis: {
                categories: dates,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: { style: { colors: '#64748B', fontWeight: 600 } },
            },
            yaxis: {
                min: 0,
                labels: { style: { colors: '#64748B', fontWeight: 600 } },
            },
            tooltip: { theme: 'light', shared: true, intersect: false },
            markers: { size: 4, strokeWidth: 2, strokeColors: '#fff', hover: { size: 7 } },
            stroke: { curve: 'smooth' as const, width: 3 },
            legend: { show: false },
        }),
        [dates]
    );

    // 차트 A: 접수/완료
    const seriesA = useMemo(
        () => [
            { name: '접수', type: 'line' as const, data: receivedData },
            { name: '완료', type: 'line' as const, data: completedData },
        ],
        [receivedData, completedData]
    );

    const optionsA = useMemo(
        () => ({
            ...baseOptions,
            colors: ['#3B82F6', '#10B981'],
            tooltip: {
                ...baseOptions.tooltip,
                y: {
                    formatter: (val: number) => `${val} 건`,
                },
            },
        }),
        [baseOptions]
    );

    // 차트 B: Backlog
    const seriesB = useMemo(() => [{ name: 'Backlog(잔량)', type: 'line' as const, data: backlogData }], [backlogData]);

    const optionsB = useMemo(
        () => ({
            ...baseOptions,
            colors: ['#F59E0B'],
            stroke: { ...baseOptions.stroke, width: 4 },
            tooltip: {
                ...baseOptions.tooltip,
                y: { formatter: (val: number) => `${val} 건` },
            },
        }),
        [baseOptions]
    );

    const backlogSubText = useMemo(() => {
        if (backlogStats.changePercent === null) return '전월 대비 N/A';
        const arrow = backlogStats.changeType === 'increase' ? '▲' : '▼';
        const sign = backlogStats.changeType === 'increase' ? '+' : '-';
        const color = backlogStats.changeType === 'increase' ? '#EF4444' : '#10B981';
        return (
            <span style={{ color, fontWeight: 800 }}>
                전월 대비 {arrow} {sign}{Math.abs(backlogStats.diff)}건 ({backlogStats.changePercent}%)
            </span>
        );
    }, [backlogStats]);

    return (
        <div
            className="w-full"
            style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 16,
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            {/* Header + KPI Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: 4, height: 24, backgroundColor: '#3B82F6', borderRadius: 2, marginRight: 12 }} />
                        <h5 style={{ fontSize: 20, fontWeight: 950, color: '#0F172A', margin: 0 }}>
                            [{selectedCategory}] 상세 분석 및 트렌드
                        </h5>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                        월별 접수/완료 흐름하고 잔량(Backlog) 변화를 분리하여 제공합니다.
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <KpiCard title="이번 달 접수" value={`${kpi.receivedLast} 건`} />
                    <KpiCard title="이번 달 완료" value={`${kpi.completedLast} 건`} />
                    <KpiCard title="현재 Backlog(잔량)" value={`${backlogStats.current} 건`} sub={backlogSubText} />
                </div>
            </div>

            {/* Charts (2 panels) */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: 20,
                }}
            >
                {/* Panel A */}
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>접수 / 완료 추이</div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#475569', fontWeight: 800, fontSize: 13 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#3B82F6', display: 'inline-block' }} />
                                접수
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#475569', fontWeight: 800, fontSize: 13 }}>
                                <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#10B981', display: 'inline-block' }} />
                                완료
                            </span>
                        </div>
                    </div>
                    <ReactApexChart options={optionsA as any} series={seriesA as any} type="line" height={280} />
                </div>

                {/* Panel B */}
                <div style={{ border: '1px solid #F1F5F9', borderRadius: 14, padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>Backlog(잔량) 추이</div>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#475569', fontWeight: 800, fontSize: 13 }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: '#F59E0B', display: 'inline-block' }} />
                            Backlog
                        </span>
                    </div>
                    <ReactApexChart options={optionsB as any} series={seriesB as any} type="line" height={280} />
                </div>
            </div>
        </div>
    );
};

export default ComplaintTrendChart;