import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register required components for Chart.js.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PriceHistoryGraph = ({ data }) => {
    // Prepares the data for the chart
    const chartData = {
        labels: data.map((entry) => {
            const date = new Date(entry.date); // Converts date string to Date object
            // Formats the date as MM/DD/YYYY
            return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        }),
        datasets: [
            {
                label: 'Total Price Over Time',
                data: data.map((entry) => entry.total), // Extracts total values for the graph
                borderColor: 'rgba(94.0, 166.0, 80.0, 1)',
                backgroundColor: 'rgba(94, 166, 80, 0.2)',
            },
        ],
    };

    // Defines configuration options for the chart
    const options = {
        responsive: true, // chart is responsive
        maintainAspectRatio: false, // enables customization for graph size
        plugins: {
            legend: {
                position: 'top', // Positions the legend at the top.
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
                         // Formats value as a currency string
                        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                },
            },            
        },
        scales: {
            x: {
                ticks: {
                    color: '#581c87', // X axis text color
                },
            },
            y: {
                ticks: {
                    color: '#581c87', // Y axis text color
                    callback: function (value) {
                        return `$${value}`; // Adds a dollar sign in front of the y-axis labels
                    },
                },
            },
        },
    };

    return (
        // Renders the line chart inside a styled container
        <div style={{ width: '800px', height: '500px' }}>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PriceHistoryGraph;