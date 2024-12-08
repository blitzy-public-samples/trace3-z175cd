// React v18.x
import React, { useState, useEffect } from 'react';
// react-chartjs-2 v4.x
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

// Import internal dependencies with relative paths
import { EngagementMetric } from '../../types/analytics';
import { calculateEngagementRate } from '../../utils/analytics';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface EngagementChartProps {
  /** Array of engagement metrics to display */
  data?: EngagementMetric[];
  /** Title for the chart */
  title?: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * A React component that visualizes engagement metrics such as views, clicks, and shares
 * in a chart format, providing insights into audience engagement.
 */
export const EngagementChart: React.FC<EngagementChartProps> = ({
  data = [],
  title = 'Audience Engagement',
  className = ''
}) => {
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Chart configuration
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: (value) => value.toLocaleString()
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  // Process data for chart display
  const chartData = {
    labels: data.map((_, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: 'Views',
        data: data.map(metric => metric.views),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Clicks',
        data: data.map(metric => metric.clicks),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
      },
      {
        label: 'Shares',
        data: data.map(metric => metric.shares),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  // Calculate average engagement rate
  const averageEngagementRate = data.length > 0
    ? data.reduce((acc, metric) => acc + calculateEngagementRate(metric), 0) / data.length
    : 0;

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Error handling for invalid data
  useEffect(() => {
    if (data.some(metric => 
      typeof metric.views !== 'number' || 
      typeof metric.clicks !== 'number' || 
      typeof metric.shares !== 'number'
    )) {
      setError('Invalid metric data provided');
    } else {
      setError(null);
    }
  }, [data]);

  return (
    <Card
      title={title}
      className={`w-full ${className}`}
      content=""
    >
      <div className="p-4">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Spinner isLoading={true} message="Loading engagement data..." />
          </div>
        ) : error ? (
          <div className="h-[400px] flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            No engagement data available
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Average Engagement Rate: {averageEngagementRate.toFixed(2)}%
              </div>
              <div className="text-sm text-gray-600">
                Total Views: {data.reduce((acc, metric) => acc + metric.views, 0).toLocaleString()}
              </div>
            </div>
            <div className="h-[400px]">
              <Line
                data={chartData}
                options={chartOptions}
                aria-label="Engagement metrics chart"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div className="p-2 bg-blue-50 rounded-lg">
                <div className="font-semibold text-blue-600">Total Clicks</div>
                <div className="text-gray-600">
                  {data.reduce((acc, metric) => acc + metric.clicks, 0).toLocaleString()}
                </div>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <div className="font-semibold text-green-600">Total Shares</div>
                <div className="text-gray-600">
                  {data.reduce((acc, metric) => acc + metric.shares, 0).toLocaleString()}
                </div>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <div className="font-semibold text-purple-600">Peak Views</div>
                <div className="text-gray-600">
                  {Math.max(...data.map(metric => metric.views)).toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};