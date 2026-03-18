import { Doughnut, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

export const DonutChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return <p className="text-gray-400 text-sm">No data</p>;
  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      data: Object.values(data),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 1
    }]
  };
  return <Doughnut data={chartData} />;
};

export const LineChart = ({ data }) => {
  if (!data || !data.length) return <p className="text-gray-400 text-sm">No data</p>;
  const chartData = {
    labels: data.map(item => item.period || item.date),
    datasets: [{
      label: 'Repairs',
      data: data.map(item => item.count),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.1
    }]
  };
  return <Line data={chartData} />;
};

export const BarChart = ({ data }) => {
  if (!data || !data.length) return <p className="text-gray-400 text-sm">No data</p>;
  const chartData = {
    labels: data.map(item => item.label || item.part_name || item.name),
    datasets: [{
      label: 'Value',
      data: data.map(item => item.value || item.total_revenue || item.count),
      backgroundColor: '#3B82F6'
    }]
  };
  return <Bar data={chartData} />;
};

export const Heatmap = ({ data }) => {
  if (!data || !Object.keys(data).length) return <p className="text-gray-400 text-sm">No data</p>;
  return (
    <div className="text-sm text-gray-300 space-y-1">
      {Object.entries(data).slice(0, 8).map(([brand, info]) => (
        <div key={brand} className="flex justify-between">
          <span>{brand}</span>
          <span className="text-blue-400">{info.total_part_usage || 0} uses</span>
        </div>
      ))}
    </div>
  );
};
