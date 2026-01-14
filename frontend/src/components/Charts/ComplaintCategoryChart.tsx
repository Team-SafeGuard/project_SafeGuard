/**
 * 분류별 민원 통계 및 순위를 보여주는 도넛 차트 및 리스트 컴포넌트입니다.
 */
import React from 'react';
import ReactApexChart from 'react-apexcharts';

// 민원 유형별 통계 데이터 (Mock)
const MOCK_TYPE_DATA = [
    { name: '교통', value: 10108, change: -4.7, rank: 1 },
    { name: '행정·안전', value: 1516, change: -10.0, rank: 2 },
    { name: '도로', value: 1417, change: 16.4, rank: 3 },
    { name: '주택·건축', value: 858, change: -17.9, rank: 4 },
    { name: '산업·통상', value: 707, change: 7.0, rank: 5 },
    { name: '환경', value: 494, change: -27.0, rank: 6 },
    { name: '경찰·검찰·법원', value: 406, change: 0.5, rank: 7 },
    { name: '교육', value: 381, change: 2.7, rank: 8 },
    { name: '관광', value: 290, change: 14.6, rank: 9 },
    { name: '보건', value: 286, change: -32.4, rank: 10 },
];

interface ChartTwoProps {
    /** 현재 선택된 카테고리 필터값 (예: '전체', '교통' 등) */
    selectedCategory: string;
    /** 차트 클릭 시 카테고리 선택을 변경하는 콜백 함수 */
    onSelect: (category: string) => void;
    /** 백엔드로부터 받은 실제 통계 데이터 */
    data?: any[];
}

/**
 * 분류별 민원 통계 차트 컴포넌트
 * (한글 기능 설명: DB로부터 받은 데이터를 기반으로 도넛 차트 및 순위 리스트 표시)
 */
const ComplaintCategoryChart: React.FC<ChartTwoProps> = ({ selectedCategory, onSelect, data }) => {
    // 실제 데이터가 있으면 그것을 사용하고, 없으면 MOCK 데이터를 사용
    const currentData = data && data.length > 0
        ? data.map((item, index) => ({
            name: item.name,
            value: Number(item.value),
            change: item.change || 0,
            rank: index + 1
        }))
        : MOCK_TYPE_DATA;

    // 차트용 TOP 5 추출
    const chartSeries = currentData.slice(0, 5).map(item => item.value);
    const chartLabels = currentData.slice(0, 5).map(item => item.name);

    const options: any = {
        chart: {
            type: 'donut' as const,
            events: {
                dataPointSelection: (event: any, chartContext: any, config: any) => {
                    const category = config.w.config.labels[config.dataPointIndex];
                    onSelect(category);
                }
            }
        },
        colors: ['#A0C4FF', '#B2F2BB', '#FFEC99', '#FFD8A8', '#FFB1B1'],
        labels: chartLabels,
        legend: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '50%',
                    labels: {
                        show: true,
                        name: { show: true, fontSize: '16px', fontWeight: 700, color: '#1E293B', offsetY: -10 },
                        value: { show: true, fontSize: '24px', fontWeight: 900, color: '#0F172A', offsetY: 10 },
                        total: {
                            show: true,
                            label: '전체 건수',
                            formatter: () => {
                                return currentData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString();
                            }
                        }
                    }
                }
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val: any, opts: any) => opts.w.globals.labels[opts.seriesIndex],
            style: { fontSize: '14px', fontWeight: 900 }
        }
    };

    return (
        <div className="w-full" style={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08)',
            padding: '32px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                <div style={{ width: '4px', height: '20px', backgroundColor: '#FF8787', borderRadius: '2px', flexShrink: 0 }}></div>
                <h5 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>분류별 민원 통계</h5>
            </div>

            <div className="mb-6 w-full flex justify-center items-center">
                <ReactApexChart
                    options={options}
                    series={chartSeries}
                    type="donut"
                    width={400}
                />
            </div>

            <div className="mt-4 pt-6 border-t border-slate-100 flex-1 overflow-y-auto">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentData.map((item, i) => (
                        <div
                            key={i}
                            onClick={() => onSelect(item.name)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                backgroundColor: selectedCategory === item.name ? '#EBF8FF' : 'transparent',
                                border: selectedCategory === item.name ? '1px solid #A0C4FF' : '1px solid transparent',
                            }}
                            className="hover:bg-slate-50"
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '700',
                                marginRight: '16px',
                                backgroundColor: item.rank <= 5 ? '#A0C4FF' : '#E2E8F0',
                                color: 'white',
                                flexShrink: 0
                            }}>
                                {item.rank}
                            </div>

                            <div style={{ flex: 1, fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>
                                {item.name}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#334155' }}>{item.value.toLocaleString()}</span>
                                <div style={{
                                    minWidth: '60px',
                                    textAlign: 'right',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: item.change > 0 ? '#EF4444' : '#3B82F6',
                                }}>
                                    {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCategoryChart;
