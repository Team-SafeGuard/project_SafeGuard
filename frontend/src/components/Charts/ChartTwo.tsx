import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const MOCK_TYPE_DATA = [
    { name: '교통', value: 4406 },
    { name: '행정안전', value: 690 },
    { name: '도로', value: 331 },
    { name: '경찰·검찰', value: 238 },
];

const ChartTwo = () => {
    const [state, setState] = useState({
        series: [4406, 690, 331, 238],
        options: {
            chart: { type: 'donut' as const },
            colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF'],
            labels: ['교통', '행정안전', '도로', '경찰·검찰'],
            legend: { show: true, position: 'bottom' as const },
            plotOptions: {
                pie: { donut: { size: '65%', labels: { show: false } } },
            },
            dataLabels: { enabled: false },
            responsive: [{ breakpoint: 2600, options: { chart: { width: 380 } } }, { breakpoint: 640, options: { chart: { width: 200 } } }],
        }
    });

    return (
        <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800 p-4">
            <div className="mb-3 justify-between gap-4 sm:flex">
                <div>
                    <h5 className="text-xl font-bold text-gray-900 dark:text-white">
                        민원 유형별 분포
                    </h5>
                </div>
            </div>
            <div className="mb-2">
                <div id="chartThree" className="mx-auto flex justify-center">
                    <ReactApexChart options={state.options} series={state.series} type="donut" />
                </div>
            </div>
            <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
                {MOCK_TYPE_DATA.map((item, i) => (
                    <div key={i} className="w-full px-8 sm:w-1/2">
                        <div className="flex w-full items-center">
                            <span className={`mr-2 block h-3 w-full max-w-3 rounded-full`} style={{ backgroundColor: state.options.colors[i] }}></span>
                            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                                <span> {item.name} </span>
                                <span> {Math.round((item.value / 5665) * 100)}% </span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChartTwo;
