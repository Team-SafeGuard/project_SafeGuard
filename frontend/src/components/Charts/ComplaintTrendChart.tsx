import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

'차트 파일2'
'유형 도넛차트에서 유형 클릭시 나오는 오른쪽 꺾은선 그래프 차트'

interface ChartOneProps {
    selectedCategory: string;
}

const ComplaintTrendChart: React.FC<ChartOneProps> = ({ selectedCategory }) => {
    // Generate different data based on category name for demonstration
    const getCategoryData = (name: string) => {
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return Array.from({ length: 10 }, (_, i) => Math.floor(Math.abs(Math.sin(seed + i)) * 100));
    };

    const series = [
        {
            name: `${selectedCategory} 접수`,
            type: 'column',
            data: getCategoryData(selectedCategory)
        },
        {
            name: '증감률',
            type: 'line',
            data: getCategoryData(selectedCategory).map((v, i, arr) => {
                if (i === 0) return 0;
                return Math.round(((v - arr[i - 1]) / arr[i - 1]) * 100);
            })
        }
    ];

    const [options] = useState({
        legend: { show: false },
        colors: ['#3B82F6', '#EF4444'],
        chart: {
            fontFamily: 'Satoshi, sans-serif',
            height: '100%',
            type: 'line' as const,
            toolbar: { show: false },
        },
        stroke: {
            width: [0, 4],
            curve: 'smooth' as const
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '50%',
            }
        },
        fill: {
            opacity: [0.85, 1],
        },
        markers: {
            size: [0, 5],
            colors: '#fff',
            strokeColors: '#EF4444',
            strokeWidth: 3,
            hover: { size: 7 }
        },
        xaxis: {
            type: 'category' as const,
            categories: ['12/25', '12/26', '12/27', '12/28', '12/29', '12/30', '12/31', '01/01', '01/02', '01/03'],
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: [
            {
                title: { text: '접수 건수', style: { color: '#3B82F6', fontWeight: 900 } },
                labels: { style: { colors: '#3B82F6', fontWeight: 700 } }
            },
            {
                opposite: true,
                title: { text: '증감률 (%)', style: { color: '#EF4444', fontWeight: 900 } },
                labels: { style: { colors: '#EF4444', fontWeight: 700 } }
            }
        ],
        grid: {
            borderColor: '#f1f5f9',
            strokeDashArray: 4,
        }
    });

    return (
        <div className="w-full" style={{
            backgroundColor: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '24px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
                <h5 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>
                    [{selectedCategory}] 상세 현황
                </h5>
            </div>

            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                <div id="chartOne" className="-ml-5" style={{ flex: 1, minHeight: 0 }}>
                    <ReactApexChart options={options} series={series} type="line" height="100%" />
                </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', borderTop: '2px solid #f1f5f9', paddingTop: '24px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px', color: '#3B82F6' }}>■</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>접수 건수</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px', color: '#EF4444' }}>●</span>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#1e293b' }}>증감률 (%)</span>
                </div>
            </div>
        </div>
    );
};

export default ComplaintTrendChart;
