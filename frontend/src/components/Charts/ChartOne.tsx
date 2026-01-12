import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const ChartOne = () => {
    const [state, setState] = useState({
        series: [
            { name: '민원 접수', data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8] },
            { name: '처리 완료', data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51] },
        ],
        options: {
            legend: { show: false, position: 'top' as const, horizontalAlign: 'left' as const },
            colors: ['#3C50E0', '#80CAEE'],
            chart: {
                fontFamily: 'Satoshi, sans-serif',
                height: 335,
                type: 'area' as const,
                dropShadow: { enabled: true, color: '#623CEA14', top: 10, blur: 4, left: 0, opacity: 0.1 },
                toolbar: { show: false },
            },
            responsive: [{ breakpoint: 1024, options: { chart: { height: 300 } } }],
            stroke: { width: [2, 2], curve: 'straight' as const },
            grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
            dataLabels: { enabled: false },
            markers: { size: 4, colors: '#fff', strokeColors: ['#3056D3', '#80CAEE'], strokeWidth: 3, hover: { size: 7 } },
            xaxis: {
                type: 'category' as const,
                categories: ['12/25', '12/26', '12/27', '12/28', '12/29', '12/30', '12/31', '01/01', '01/02', '01/03'],
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: { title: { style: { fontSize: '0px' } } },
        },
    });

    return (
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap mb-4">
                <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-blue-600">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-blue-600"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-blue-600">민원 접수</p>
                            <p className="text-sm font-medium">12.25 - 01.03</p>
                        </div>
                    </div>
                    <div className="flex min-w-47.5">
                        <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-sky-300">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-sky-300"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-sky-300">처리 완료</p>
                            <p className="text-sm font-medium">12.25 - 01.03</p>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div id="chartOne" className="-ml-5">
                    <ReactApexChart options={state.options} series={state.series} type="area" height={350} />
                </div>
            </div>
        </div>
    );
};

export default ChartOne;
