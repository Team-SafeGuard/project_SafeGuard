import React, { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';

interface ChartOneProps {
    selectedCategory: string;
}

const ComplaintTrendChart: React.FC<ChartOneProps> = ({ selectedCategory }) => {
    // 지표 표시 상태 관리
    const [visibility, setVisibility] = useState({
        received: true,
        completed: true,
        growth: true
    });

    // 데이터 생성 로직
    const getCategoryData = (name: string) => {
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return Array.from({ length: 10 }, (_, i) => Math.floor(Math.abs(Math.sin(seed + i)) * 100));
    };

    const receivedData = useMemo(() => getCategoryData(selectedCategory), [selectedCategory]);
    const completedData = useMemo(() => getCategoryData(selectedCategory + 'done').map(v => Math.floor(v * 0.7)), [selectedCategory]);

    // 증감률 계산 (전일 대비 % - 시연용으로 변동성 있게 계산)
    const growthData = useMemo(() => {
        return receivedData.map((val, i) => {
            if (i === 0) return 0;
            const prev = receivedData[i - 1];
            if (prev === 0) return 0;
            return parseFloat(((val - prev) / prev * 100).toFixed(1));
        });
    }, [receivedData]);

    const series = [
        ...(visibility.received ? [{ name: `${selectedCategory} 접수`, data: receivedData, type: 'area' }] : []),
        ...(visibility.completed ? [{ name: `${selectedCategory} 완료`, data: completedData, type: 'area' }] : []),
        ...(visibility.growth ? [{ name: `증감률 (%)`, data: growthData, type: 'line' }] : []),
    ];

    // 선택된 지표에 따라 색상과 스타일 동적 생성
    const activeColors = [
        ...(visibility.received ? ['#3B82F6'] : []),
        ...(visibility.completed ? ['#10B981'] : []),
        ...(visibility.growth ? ['#FF3B30'] : []), // 더 밝고 선명한 빨간색
    ];

    const activeStrokeWidths = [
        ...(visibility.received ? [3] : []),
        ...(visibility.completed ? [3] : []),
        ...(visibility.growth ? [3] : []), // 다른 지표와 동일하게 3으로 조정
    ];

    const activeDashArrays = [
        ...(visibility.received ? [0] : []),
        ...(visibility.completed ? [0] : []),
        ...(visibility.growth ? [0] : []),
    ];

    const activeOpacitiesFrom = [
        ...(visibility.received ? [0.45] : []),
        ...(visibility.completed ? [0.45] : []),
        ...(visibility.growth ? [1.0] : []), // 증감률은 100% 불투명하게
    ];

    const activeOpacitiesTo = [
        ...(visibility.received ? [0.1] : []),
        ...(visibility.completed ? [0.1] : []),
        ...(visibility.growth ? [1.0] : []), // 증감률은 100% 불투명하게
    ];

    const options = {
        legend: { show: false },
        colors: activeColors,
        chart: {
            fontFamily: 'Pretendard, sans-serif',
            height: 350,
            type: 'line' as const,
            dropShadow: {
                enabled: true,
                color: '#000',
                top: 5,
                blur: 8,
                left: 0,
                opacity: 0.15,
                enabledOnSeries: visibility.growth ? [activeColors.length - 1] : [] // 증감률 선에만 그림자 효과를 주어 '앞에 있는 느낌' 강화
            },
            toolbar: { show: false },
        },
        stroke: {
            width: activeStrokeWidths,
            curve: 'smooth' as const,
            dashArray: activeDashArrays
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'light',
                type: 'vertical',
                shadeIntensity: 0.5,
                inverseColors: false,
                opacityFrom: activeOpacitiesFrom, // 동적 불투명도 적용
                opacityTo: activeOpacitiesTo,
                stops: [0, 100]
            }
        },
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        dataLabels: { enabled: false },
        markers: {
            size: 5,
            colors: '#fff',
            strokeColors: activeColors,
            strokeWidth: 3,
            hover: { size: 9 }
        },
        xaxis: {
            type: 'category' as const,
            categories: ['12/25', '12/26', '12/27', '12/28', '12/29', '12/30', '12/31', '01/01', '01/02', '01/03'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#64748B', fontWeight: 700 } }
        },
        yaxis: [
            {
                show: visibility.received || visibility.completed,
                title: { text: '접수/완료 건수', style: { color: '#64748B', fontWeight: 800 } },
                labels: { style: { colors: '#64748B', fontWeight: 700 } }
            },
            {
                opposite: true,
                show: visibility.growth,
                title: { text: '증감률 (%)', style: { color: '#FF3B30', fontWeight: 800 } },
                labels: { style: { colors: '#FF3B30', fontWeight: 700 } }
            }
        ],
        tooltip: {
            theme: 'light',
            shared: true,
            intersect: false,
            y: {
                formatter: (val: number, { seriesIndex }: any) => {
                    // 현재 활성화된 시리즈 중 증감률의 인덱스 확인
                    const isGrowthIndex = visibility.growth && seriesIndex === activeColors.length - 1;
                    if (isGrowthIndex) {
                        return `${val}%`;
                    }
                    return `${val} 건`;
                }
            }
        }
    };

    const toggleSeries = (key: keyof typeof visibility) => {
        setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="w-full" style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '4px', height: '24px', backgroundColor: '#3B82F6', borderRadius: '2px', marginRight: '12px' }}></div>
                <h5 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>
                    [{selectedCategory}] 상세 분석 및 트렌드
                </h5>
            </div>

            <div style={{ flex: 1, minHeight: '350px' }}>
                <ReactApexChart options={options as any} series={series} type="line" height={350} />
            </div>

            {/* Custom Interactive Legend / Filters */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                <button
                    onClick={() => toggleSeries('received')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'none',
                        opacity: visibility.received ? 1 : 0.4, transition: 'all 0.2s'
                    }}
                >
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {visibility.received && <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>접수 건수</span>
                </button>

                <button
                    onClick={() => toggleSeries('completed')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'none',
                        opacity: visibility.completed ? 1 : 0.4, transition: 'all 0.2s'
                    }}
                >
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {visibility.completed && <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>완료 건수</span>
                </button>

                <button
                    onClick={() => toggleSeries('growth')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', background: 'none',
                        opacity: visibility.growth ? 1 : 0.4, transition: 'all 0.2s'
                    }}
                >
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#FF3B30', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {visibility.growth && <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '1px' }}></div>}
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#1e293b' }}>증감률 (%)</span>
                </button>
            </div>
        </div>
    );
};

export default ComplaintTrendChart;
