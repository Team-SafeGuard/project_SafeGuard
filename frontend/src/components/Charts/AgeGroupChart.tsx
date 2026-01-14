/**
 * 연령별 민원접수 현황을 보여주는 바 차트 컴포넌트입니다.
 */
import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface AgeGroupChartProps {
    /** 관리자 대시보드로부터 전달받은 실제 연령대별 통계 데이터 */
    data?: Array<{ ageGroup?: string; agegroup?: string; count: number }>;
}

/**
 * 연령대별 민원 접수 분포 차트
 * (한글 기능 설명: 민원인 정보를 기반으로 연령대별 통계를 바 차트로 시각화)
 */
const AgeGroupChart: React.FC<AgeGroupChartProps> = ({ data }) => {
    // 실제 데이터 매핑 (기본값 제공, PostgreSQL 소문자 필드명 대응)
    const chartCategories = data && data.length > 0 ? data.map(d => d.agegroup || d.ageGroup) : ['10대', '20대', '30대', '40대', '50대', '60대+'];
    const chartSeries = data && data.length > 0 ? data.map(d => Number(d.count)) : [15, 45, 120, 80, 50, 30];

    const options: any = {
        chart: {
            type: 'bar' as const,
            toolbar: { show: false },
            fontFamily: 'Satoshi, sans-serif',
        },
        plotOptions: {
            bar: {
                borderRadius: 8,
                columnWidth: '55%',
                distributed: true,
            }
        },
        colors: ['#A0C4FF', '#B2F2BB', '#FFEC99', '#FFD8A8', '#FFB1B1', '#E2E8F0'],
        dataLabels: {
            enabled: true,
            formatter: (val: number) => val.toLocaleString(),
            style: { fontSize: '12px' }
        },
        xaxis: {
            categories: chartCategories,
        },
        tooltip: {
            theme: 'light',
            y: {
                formatter: (val: number) => `${val.toLocaleString()} 건`
            }
        }
    };

    const series = [{
        name: '민원 건수',
        data: chartSeries
    }];

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexShrink: 0 }}>
                <div style={{ width: '4px', height: '20px', backgroundColor: '#3B82F6', borderRadius: '2px', flexShrink: 0 }}></div>
                <h5 style={{ fontSize: '20px', fontWeight: '950', color: '#1e293b' }}>연령별 민원접수 현황</h5>
            </div>

            <div style={{ flex: 1, minHeight: '300px' }}>
                <ReactApexChart options={options} series={series} type="bar" height="100%" />
            </div>
        </div>
    );
};

export default AgeGroupChart;
