import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Shapes } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceHistoryGraph = ({ data }) => {
    const chartData = {
        labels: data.map((entry) => {
            const date = new Date(entry.date);
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        }),
        datasets: [
            {
                label: 'Total Price Over Time',
                data: data.map((entry) => entry.total),
                borderColor: 'rgba(94.0, 166.0, 80.0, 1)',
                backgroundColor: 'rgba(94, 166, 80, 0.2)',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // enables customization for graph size
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#581c87',
                },
                onClick: null, // disables default legend click functionality
            },
            title: {
                display: true,
                text: 'Collection Value Over Time',
                color: '#581c87',
                font: {
                    size: 25,
                    family: 'Arial',
                    weight: 'bold',
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw;
                        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                },
            },            
        },
        scales: {
            x: {
                ticks: {
                    color: '#581c87', // x axis text color
                },
            },
            y: {
                ticks: {
                    color: '#581c87', // y axis text color
                    callback: function (value) {
                        return `$${value}`; // add a dollar sign for the y-axis labels
                    },
                },
            },
        },
    };

    return (
        <div style={{ width: '800px', height: '500px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PriceHistoryGraph;