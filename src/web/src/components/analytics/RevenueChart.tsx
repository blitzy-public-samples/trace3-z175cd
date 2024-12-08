// React v18.x
import React, { useState, useEffect } from 'react';
// react-chartjs-2 v4.x
import { Chart } from 'react-chartjs-2';
// Import internal dependencies with relative paths
import { RevenueMetric } from '../../types/analytics';
import { formatRevenueData } from '../../utils/analytics';
import { Card } from '../common/Card';
import { Spinner } from '../common/Spinner';

/**
 * Human Tasks:
 * 1. Verify Chart.js configuration aligns with design system colors
 * 2. Test chart responsiveness across different screen sizes
 * 3. Validate chart accessibility with screen readers
 * 4. Review data refresh intervals with product team
 */

interface RevenueChartProps {
  /** Array of revenue metrics to visualize */
  data: RevenueMetric[];
}

/**
 * @requirement Revenue Tracking
 * Location: Technical Specification/Scope/Core Features/Analytics
 * A React component that visualizes revenue metrics using Chart.js,
 * providing insights into total, monthly, and tier-based revenue.
 */
export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  // State for loading and formatted data
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [chartData, setChartData] = useState<any>(null);

  // Format revenue data for chart visualization
  useEffect(() => {
    try {
      if (!data || data.length === 0) {
        setIsLoading(false);
        return;
      }

      // Format the latest revenue data point
      const formattedData = formatRevenueData(data[data.length - 1]);

      // Prepare data for Chart.js
      const chartConfig = {
        labels: Object.keys(formattedData.tierBreakdown).map(tier => tier),
        datasets: [
          {
            label: 'Revenue by Tier',
            data: formattedData.percentages.map(item => item.percentage),
            backgroundColor: [
              'rgba(26, 115, 232, 0.8)', // Primary blue
              'rgba(52, 168, 83, 0.8)',  // Success green
              'rgba(251, 188, 4, 0.8)',  // Warning yellow
              'rgba(234, 67, 53, 0.8)'   // Error red
            ],
            borderColor: [
              'rgba(26, 115, 232, 1)',
              'rgba(52, 168, 83, 1)',
              'rgba(251, 188, 4, 1)',
              'rgba(234, 67, 53, 1)'
            ],
            borderWidth: 1
          }
        ]
      };

      // Chart.js options following design system
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: 14
              },
              color: '#333333'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#333333',
            titleFont: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: '600'
            },
            bodyColor: '#666666',
            bodyFont: {
              family: "'Inter', sans-serif",
              size: 12
            },
            borderColor: '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context: any) => {
                const value = context.raw;
                return `${value}% of total revenue`;
              }
            }
          }
        }
      };

      setChartData({ data: chartConfig, options: chartOptions });
      setIsLoading(false);
    } catch (error) {
      console.error('Error formatting revenue data:', error);
      setIsLoading(false);
    }
  }, [data]);

  // Show loading spinner while data is being processed
  if (isLoading) {
    return (
      <Card>
        <div className="h-64 flex items-center justify-center">
          <Spinner isLoading={true} message="Loading revenue data..." />
        </div>
      </Card>
    );
  }

  // Show message if no data is available
  if (!chartData || !data || data.length === 0) {
    return (
      <Card>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No revenue data available
        </div>
      </Card>
    );
  }

  // Render the revenue chart
  return (
    <Card>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Revenue Distribution
        </h2>
        <div className="h-64">
          <Chart
            type="doughnut"
            data={chartData.data}
            options={chartData.options}
            aria-label="Revenue distribution chart by subscription tier"
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatRevenueData(data[data.length - 1]).totalFormatted}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatRevenueData(data[data.length - 1]).monthlyFormatted}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};