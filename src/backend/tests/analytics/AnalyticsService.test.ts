/**
 * @fileoverview Unit tests for the AnalyticsService, ensuring the correctness of metric aggregation, 
 * time-series processing, and validation logic.
 * 
 * Requirements Addressed:
 * - Analytics Platform (Technical Specification/System Overview/Analytics Platform):
 *   Ensures the AnalyticsService functions correctly for performance tracking and audience insights.
 * 
 * Human Tasks:
 * - Ensure test database is properly configured with required schemas
 * - Configure test environment variables for database connections
 * - Review and update test cases when new analytics features are added
 */

// jest v29.0.0
import { analyzeMetrics } from '../../analytics/services/AnalyticsService';
import { MetricsAggregator } from '../../analytics/services/MetricsAggregator';
import { processTimeSeriesData } from '../../analytics/services/TimeSeriesService';
import { EngagementMetric } from '../../analytics/models/EngagementMetric';
import { RevenueMetric } from '../../analytics/models/RevenueMetric';
import { SubscriberMetric } from '../../analytics/models/SubscriberMetric';
import { generateMockData, validateMockData } from '../utils/testHelpers';

// Mock the external services
jest.mock('../../analytics/services/MetricsAggregator');
jest.mock('../../analytics/services/TimeSeriesService');
jest.mock('../../common/utils/logger');

describe('AnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeMetrics', () => {
    it('should successfully analyze metrics with all types of data', async () => {
      // Mock data setup
      const mockEngagementMetric = new EngagementMetric(1000, 150, 50);
      const mockRevenueMetric = new RevenueMetric('rev-1', 1500.00, 'USD', new Date());
      const mockSubscriberMetric = new SubscriberMetric(
        'sub-1',
        5000,
        100,
        0.05,
        new Date()
      );

      // Mock the aggregated metrics response
      const mockAggregatedMetrics = {
        engagement: {
          views: 1000,
          clicks: 150,
          shares: 50,
          totalEngagement: 200
        },
        revenue: {
          total: 1500.00,
          currency: 'USD',
          transactions: 1
        },
        subscribers: {
          total: 5000,
          new: 100,
          churnRate: 0.05
        }
      };

      // Mock the time series data response
      const mockTimeSeriesData = {
        metricId: 'test-metric',
        metricType: 'combined',
        dataPoints: [
          { timestamp: new Date(), value: 100 }
        ],
        aggregations: {
          min: 100,
          max: 100,
          avg: 100,
          sum: 100
        }
      };

      // Setup mocks
      (MetricsAggregator.aggregateMetrics as jest.Mock).mockResolvedValue(mockAggregatedMetrics);
      (processTimeSeriesData as jest.Mock).mockResolvedValue(mockTimeSeriesData);

      // Execute test
      const metrics = [mockEngagementMetric, mockRevenueMetric, mockSubscriberMetric];
      const result = await analyzeMetrics(metrics);

      // Verify results
      expect(result).toBeDefined();
      expect(result.engagement).toEqual({
        ...mockAggregatedMetrics.engagement,
        engagementRate: 20 // (200 / 1000) * 100
      });
      expect(result.revenue).toEqual({
        ...mockAggregatedMetrics.revenue,
        averageTransactionValue: 1500.00 // 1500 / 1
      });
      expect(result.subscribers).toEqual({
        ...mockAggregatedMetrics.subscribers,
        retentionRate: 95 // 100 - (0.05 * 100)
      });
      expect(result.timeSeriesData).toEqual(mockTimeSeriesData);
    });

    it('should handle empty metrics array', async () => {
      // Setup mocks for empty data
      (MetricsAggregator.aggregateMetrics as jest.Mock).mockResolvedValue({
        engagement: { views: 0, clicks: 0, shares: 0, totalEngagement: 0 },
        revenue: { total: 0, currency: 'USD', transactions: 0 },
        subscribers: { total: 0, new: 0, churnRate: 0 }
      });
      (processTimeSeriesData as jest.Mock).mockResolvedValue({
        dataPoints: [],
        aggregations: { min: 0, max: 0, avg: 0, sum: 0 }
      });

      // Execute test
      const result = await analyzeMetrics([]);

      // Verify results
      expect(result).toBeDefined();
      expect(result.engagement.engagementRate).toBe(0);
      expect(result.revenue.averageTransactionValue).toBe(0);
      expect(result.subscribers.retentionRate).toBe(100);
    });

    it('should handle invalid metrics data', async () => {
      // Mock an invalid engagement metric
      const invalidEngagementMetric = new EngagementMetric(-1, 0, 0);
      
      // Execute test and expect error
      await expect(analyzeMetrics([invalidEngagementMetric]))
        .rejects
        .toThrow('Invalid engagement metric data');
    });

    it('should handle time series processing failure gracefully', async () => {
      // Mock successful metric aggregation but failed time series processing
      const mockEngagementMetric = new EngagementMetric(100, 10, 5);
      (MetricsAggregator.aggregateMetrics as jest.Mock).mockResolvedValue({
        engagement: { views: 100, clicks: 10, shares: 5, totalEngagement: 15 },
        revenue: { total: 0, currency: 'USD', transactions: 0 },
        subscribers: { total: 0, new: 0, churnRate: 0 }
      });
      (processTimeSeriesData as jest.Mock).mockRejectedValue(new Error('Time series processing failed'));

      // Execute test
      const result = await analyzeMetrics([mockEngagementMetric]);

      // Verify results - should still have metrics but no time series data
      expect(result).toBeDefined();
      expect(result.engagement).toBeDefined();
      expect(result.timeSeriesData).toBeUndefined();
    });

    it('should validate all metrics before returning results', async () => {
      // Mock metrics with validation methods
      const mockRevenueMetric = new RevenueMetric('rev-1', 1000, 'USD', new Date());
      const mockSubscriberMetric = new SubscriberMetric(
        'sub-1',
        1000,
        50,
        0.03,
        new Date()
      );

      // Mock validation methods
      jest.spyOn(RevenueMetric, 'validate').mockReturnValue(true);
      jest.spyOn(mockSubscriberMetric, 'validate').mockReturnValue(true);

      // Setup aggregation mock
      (MetricsAggregator.aggregateMetrics as jest.Mock).mockResolvedValue({
        engagement: { views: 0, clicks: 0, shares: 0, totalEngagement: 0 },
        revenue: { total: 1000, currency: 'USD', transactions: 1 },
        subscribers: { total: 1000, new: 50, churnRate: 0.03 }
      });

      // Execute test
      await analyzeMetrics([mockRevenueMetric, mockSubscriberMetric]);

      // Verify all validations were called
      expect(RevenueMetric.validate).toHaveBeenCalledWith(mockRevenueMetric);
      expect(mockSubscriberMetric.validate).toHaveBeenCalled();
    });
  });
});