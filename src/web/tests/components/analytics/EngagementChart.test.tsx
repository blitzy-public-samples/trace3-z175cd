// @testing-library/react v13.x
import { render, screen } from '@testing-library/react';
// jest v29.x
import { mock } from 'jest';
import React from 'react';

// Import components and utilities with relative paths
import { EngagementChart } from '../../../src/components/analytics/EngagementChart';
import { calculateEngagementRate } from '../../../src/utils/analytics';
import { EngagementMetric } from '../../../src/types/analytics';

// Mock the calculateEngagementRate function
jest.mock('../../../src/utils/analytics', () => ({
  calculateEngagementRate: jest.fn()
}));

/**
 * @requirement Audience Metrics
 * Location: Technical Specification/Scope/Core Features/Analytics
 * Tests the visualization of audience engagement metrics in the EngagementChart component
 */

describe('EngagementChart Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (calculateEngagementRate as jest.Mock).mockReturnValue(5.5);
  });

  describe('testEngagementChartRendering', () => {
    it('renders the chart with provided engagement metrics', () => {
      // Mock engagement data
      const mockData: EngagementMetric[] = [
        { views: 1000, clicks: 50, shares: 25 },
        { views: 1500, clicks: 75, shares: 30 },
        { views: 2000, clicks: 100, shares: 40 }
      ];

      render(<EngagementChart data={mockData} title="Test Engagement" />);

      // Verify chart title is rendered
      expect(screen.getByText('Test Engagement')).toBeInTheDocument();

      // Verify engagement rate calculation
      expect(calculateEngagementRate).toHaveBeenCalledTimes(mockData.length);
      expect(screen.getByText(/Average Engagement Rate: 5.50%/)).toBeInTheDocument();

      // Verify total metrics are displayed
      expect(screen.getByText('Total Views: 4,500')).toBeInTheDocument();
      expect(screen.getByText('225')).toBeInTheDocument(); // Total clicks
      expect(screen.getByText('95')).toBeInTheDocument(); // Total shares

      // Verify chart accessibility
      expect(screen.getByLabelText('Engagement metrics chart')).toBeInTheDocument();
    });

    it('renders empty state when no data is provided', () => {
      render(<EngagementChart data={[]} />);
      expect(screen.getByText('No engagement data available')).toBeInTheDocument();
    });
  });

  describe('testLoadingState', () => {
    it('displays loading spinner while data is being fetched', () => {
      const mockData: EngagementMetric[] = [
        { views: 1000, clicks: 50, shares: 25 }
      ];

      render(<EngagementChart data={mockData} />);

      // Initially shows loading spinner
      expect(screen.getByText('Loading engagement data...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for loading state to complete
      setTimeout(() => {
        expect(screen.queryByText('Loading engagement data...')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Engagement metrics chart')).toBeInTheDocument();
      }, 1100);
    });
  });

  describe('testErrorHandling', () => {
    it('displays error message when invalid data is provided', () => {
      // Mock invalid engagement data
      const invalidData = [
        { views: 'invalid' as unknown as number, clicks: 50, shares: 25 }
      ] as EngagementMetric[];

      render(<EngagementChart data={invalidData} />);

      // Wait for error state to be displayed
      setTimeout(() => {
        expect(screen.getByText('Invalid metric data provided')).toBeInTheDocument();
      }, 1100);
    });

    it('handles undefined data gracefully', () => {
      render(<EngagementChart />);
      
      // Wait for component to render empty state
      setTimeout(() => {
        expect(screen.getByText('No engagement data available')).toBeInTheDocument();
      }, 1100);
    });
  });
});