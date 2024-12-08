// React v18.x
import React, { useState, useEffect } from 'react';
// chart.js v4.x
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Import internal dependencies with relative paths
import { SubscriberMetric } from '../../types/analytics';
import { analyzeSubscriberTrends } from '../../utils/analytics';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Human Tasks:
 * 1. Verify Chart.js configuration aligns with design system colors
 * 2. Test chart responsiveness across different screen sizes
 * 3. Validate chart accessibility with screen readers
 * 4. Review data refresh intervals with product team
 */

interface SubscriberChartProps {
  /** Initial subscriber metrics data */
  initialData?: SubscriberMetric[];
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Chart title */
  title?: string;
}

/**
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * A React component that visualizes subscriber metrics including total subscribers,
 * new subscribers, and churn rate using Chart.js
 */
export const SubscriberChart: React.FC<SubscriberChartProps> = ({
  initialData = [],
  refreshInterval = 300000, // 5 minutes default
  title = 'Subscriber Growth'
}) => {
  // State management for loading and data
  const [isLoading, setIsLoading] = useState<boolean>(!initialData.length);
  const [metrics, setMetrics] = useState<SubscriberMetric[]>(initialData);
  const [error, setError] = useState<string | null>(null);

  // Fetch and process subscriber data
  useEffect(() => {
    const fetchSubscriberData = async () => {
      try {
        setIsLoading(true);
        const trends = await analyzeSubscriberTrends(metrics);
        
        // Transform trend data for chart display
        const newMetrics: SubscriberMetric[] = trends.trends.subscribers.map((point, index) => ({
          totalSubscribers: point.count,
          newSubscribers: index > 0 ? point.count - trends.trends.subscribers[index - 1].count : 0,
          churnRate: trends.trends.churn[index].rate / 100
        }));

        setMetrics(newMetrics);
        setError(null);
      } catch (err) {
        setError('Failed to load subscriber data');
        console.error('Error fetching subscriber data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    if (!initialData.length) {
      fetchSubscriberData();
    }

    // Set up refresh interval
    const intervalId = setInterval(fetchSubscriberData, refreshInterval);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [initialData, refreshInterval]);

  // Chart configuration
  const chartData = {
    labels: metrics.map((_, index) => `Period ${index + 1}`),
    datasets: [
      {
        label: 'Total Subscribers',
        data: metrics.map(m => m.totalSubscribers),
        borderColor: '#1a73e8',
        backgroundColor: 'rgba(26, 115, 232, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'New Subscribers',
        data: metrics.map(m => m.newSubscribers),
        borderColor: '#34a853',
        backgroundColor: 'rgba(52, 168, 83, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Churn Rate (%)',
        data: metrics.map(m => m.churnRate * 100),
        borderColor: '#ea4335',
        backgroundColor: 'rgba(234, 67, 53, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'percentage'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          family: "'Inter', sans-serif",
          size: 16,
          weight: '600'
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: '600'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      },
      percentage: {
        position: 'right' as const,
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          callback: (value: number) => `${value}%`,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <div className="h-[400px] flex items-center justify-center">
          <Spinner isLoading={true} message="Loading subscriber data..." />
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <div className="h-[400px] flex items-center justify-center text-red-600">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  // Render chart
  return (
    <Card>
      <div className="h-[400px] p-4">
        <Line
          data={chartData}
          options={chartOptions}
          aria-label="Subscriber metrics chart showing total subscribers, new subscribers, and churn rate"
        />
      </div>
    </Card>
  );
};