/**
 * 선택된 카테고리의 민원 접수, 완료 건수 및 증감률, 백로그 트렌드를 보여주는 복합 차트 컴포넌트입니다.
 */
import React, { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartOneProps {
    /** 현재 선택된 카테고리 필터값 (예: '전체', '교통' 등) */
    selectedCategory: string;
    /** 백엔드로부터 받은 실제 월별 트렌드 데이터 리스트 */
    data?: any[];
}

/**
 * 민원 처리 트렌드 통합 차트
 * (한글 기능 설명: 최근 6개월간의 접수, 완료, 백로그 추이를 라인 및 영역 차트로 시각화)
 */
const ComplaintTrendChart: React.FC<ChartOneProps> = ({ selectedCategory, data }) => {
    // 지표 표시 상태 관리 (사용자 클릭으로 토글 가능)
    const [visibility, setVisibility] = useState({
        received: true,
        completed: true,
        growth: true,
        backlog: true
    });

    // 실제 데이터 매핑 (data가 없을 경우 기존 MOCK 로직 유지)
    const categories = useMemo(() => {
        if (data && data.length > 0) return data.map(d => d.month);
        return ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월'];
    }, [data]);

    const seriesData = useMemo(() => {
        if (data && data.length > 0) {
            const received = data.map(d => d.received || 0);
            const completed = data.map(d => d.completed || 0);

            // 백로그 계산 (누적 개념으로 임시 처리)
            let currentBacklog = 150; // 초기값
            const backlog = received.map((r, i) => {
                currentBacklog = currentBacklog + (r - completed[i]);
                return currentBacklog;
            });

            // 증감률 계산
            const growth = received.map((v, i) => {
                if (i === 0) return 0;
                const prev = received[i - 1];
                return prev === 0 ? 0 : Number(((v - prev) / prev * 100).toFixed(1));
            });

            return { received, completed, growth, backlog };
        }

        // 폴백: MOCK 데이터 생성 로직
        const getCategoryData = (name: string) => {
            const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return Array.from({ length: 10 }, (_, i) => Math.floor(Math.abs(Math.sin(seed + i)) * 100));
        };
        const received = getCategoryData(selectedCategory);
        const completed = getCategoryData(selectedCategory + 'done').map(v => Math.floor(v * 0.7));
        const backlog = received.map((r, i) => r + Math.floor(Math.random() * 50));
        const growth = received.map((v, i) => {
            if (i === 0) return 0;
            const prev = received[i - 1];
            return Number(((v - prev) / prev * 100).toFixed(1));
        });
        return { received, completed, growth, backlog };
    }, [data, selectedCategory]);

    const chartSeries = [
        ...(visibility.received ? [{ name: '접수 건수', type: 'area', data: seriesData.received }] : []),
        ...(visibility.completed ? [{ name: '완료 건수', type: 'area', data: seriesData.completed }] : []),
        ...(visibility.growth ? [{ name: '증감률 (%)', type: 'line', data: seriesData.growth }] : []),
        ...(visibility.backlog ? [{ name: '미처리 잔량 (Backlog)', type: 'line', data: seriesData.backlog }] : []),
    ];

    const options: any = {
        legend: { show: false },
        colors: ['#3B82F6', '#10B981', '#FF3B30', '#F59E0B'],
        chart: {
            fontFamily: 'Pretendard, sans-serif',
            height: 350,
            type: 'line',
            toolbar: { show: false },
        },
        stroke: {
            width: [3, 3, 3, 4],
            curve: 'smooth',
            dashArray: [0, 0, 0, 4]
        },
        fill: {
            type: ['gradient', 'gradient', 'solid', 'solid'],
            gradient: {
                shadeIntensity: 0.5,
                opacityFrom: [0.45, 0.45, 1.0, 1.0],
                opacityTo: [0.1, 0.1, 1.0, 1.0],
                stops: [0, 100]
            }
        },
        xaxis: {
            categories: categories,
        },
        yaxis: [
            {
                title: { text: '건수', style: { color: '#64748B', fontWeight: 800 } },
            },
            {
                opposite: true,
                title: { text: '증감률 (%)', style: { color: '#FF3B30', fontWeight: 800 } },
            }
        ],
        tooltip: {
            theme: 'light',
            shared: true,
        }
    };

    const toggleSeries = (key: keyof typeof visibility) => {
        setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-full" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '4px', height: '24px', backgroundColor: '#3B82F6', borderRadius: '2px', marginRight: '12px' }}></div>
                <h5 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>
                    [{selectedCategory}] 상세 분석 및 트렌드
                </h5>
            </div>

            <div style={{ minHeight: '350px' }}>
                <ReactApexChart options={options} series={chartSeries} type="line" height={350} />
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {(['received', 'completed', 'growth', 'backlog'] as Array<keyof typeof visibility>).map((key) => (
                    <button
                        key={key}
                        onClick={() => toggleSeries(key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'none',
                            opacity: visibility[key] ? 1 : 0.4, transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: options.colors[['received', 'completed', 'growth', 'backlog'].indexOf(key)] }}></div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                            {key === 'received' ? '접수' : key === 'completed' ? '완료' : key === 'growth' ? '증감률' : '미처리 잔량'}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ComplaintTrendChart;
