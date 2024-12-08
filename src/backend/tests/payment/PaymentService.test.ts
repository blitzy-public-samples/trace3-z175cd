// jest v29.0.0
import { PaymentService } from '../../src/payment/services/PaymentService';
import { Payment } from '../../src/payment/models/Payment';
import { Subscription } from '../../src/payment/models/Subscription';
import { SubscriptionTier } from '../../src/payment/models/SubscriptionTier';
import { generateMockData } from '../utils/testHelpers';

/**
 * Unit tests for PaymentService class
 * 
 * Requirements Addressed:
 * - Payment Processing (Technical Specification/Scope/Core Features/Monetization):
 *   Tests payment processing, refunds, and subscription creation functionality
 */

// Mock the external dependencies
jest.mock('../../src/payment/models/Payment');
jest.mock('../../src/payment/models/Subscription');
jest.mock('../../src/payment/models/SubscriptionTier');
jest.mock('../../src/payment/services/StripeService');

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set required environment variables for testing
    process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
    
    // Initialize PaymentService instance
    paymentService = new PaymentService();
  });

  describe('processPayment', () => {
    it('should successfully process a valid payment', async () => {
      // Generate mock payment data
      const mockPaymentData = {
        amount: 100,
        currency: 'usd',
        customerId: 'cust_123',
        paymentMethodId: 'pm_123',
        description: 'Test payment'
      };

      // Mock Payment class processPayment method
      (Payment.prototype.processPayment as jest.Mock).mockResolvedValue(true);

      // Execute the test
      const result = await paymentService.processPayment(mockPaymentData);

      // Verify the result
      expect(result).toBe(true);
      expect(Payment.prototype.processPayment).toHaveBeenCalledWith({
        paymentMethodId: mockPaymentData.paymentMethodId,
        customerId: mockPaymentData.customerId,
        description: mockPaymentData.description
      });
    });

    it('should handle payment processing failure', async () => {
      // Generate mock payment data
      const mockPaymentData = {
        amount: 100,
        currency: 'usd',
        customerId: 'cust_123'
      };

      // Mock Payment class processPayment method to fail
      (Payment.prototype.processPayment as jest.Mock).mockResolvedValue(false);

      // Execute the test
      const result = await paymentService.processPayment(mockPaymentData);

      // Verify the result
      expect(result).toBe(false);
    });

    it('should handle invalid payment data', async () => {
      // Test with missing required fields
      const mockPaymentData = {
        customerId: 'cust_123'
      };

      // Execute the test
      const result = await paymentService.processPayment(mockPaymentData as any);

      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe('refundPayment', () => {
    it('should successfully process a valid refund', async () => {
      // Generate mock payment ID
      const mockPaymentId = 'pi_123';

      // Mock Payment class refundPayment method
      (Payment.prototype.refundPayment as jest.Mock).mockResolvedValue(true);

      // Execute the test
      const result = await paymentService.refundPayment(mockPaymentId);

      // Verify the result
      expect(result).toBe(true);
      expect(Payment.prototype.refundPayment).toHaveBeenCalledWith({
        reason: 'customer_requested',
        metadata: expect.any(Object)
      });
    });

    it('should handle refund processing failure', async () => {
      // Generate mock payment ID
      const mockPaymentId = 'pi_123';

      // Mock Payment class refundPayment method to fail
      (Payment.prototype.refundPayment as jest.Mock).mockResolvedValue(false);

      // Execute the test
      const result = await paymentService.refundPayment(mockPaymentId);

      // Verify the result
      expect(result).toBe(false);
    });

    it('should handle invalid payment ID for refund', async () => {
      // Test with empty payment ID
      const result = await paymentService.refundPayment('');

      // Verify the result
      expect(result).toBe(false);
    });
  });

  describe('createSubscription', () => {
    it('should successfully create a subscription', async () => {
      // Generate mock subscription data
      const mockSubscriptionData = {
        userId: 'user_123',
        tierId: 'price_123',
        customerId: 'cust_123',
        paymentMethodId: 'pm_123'
      };

      // Mock Subscription constructor
      (Subscription as jest.Mock).mockImplementation(() => ({
        id: 'sub_123',
        status: 'active'
      }));

      // Mock SubscriptionTier price property
      (SubscriptionTier as jest.Mock).mockImplementation(() => ({
        price: 1000
      }));

      // Execute the test
      const result = await paymentService.createSubscription(mockSubscriptionData);

      // Verify the result
      expect(result).toBe(true);
      expect(Subscription).toHaveBeenCalledWith(
        expect.any(String),
        mockSubscriptionData.userId,
        mockSubscriptionData.tierId,
        expect.any(Date),
        expect.any(Date),
        'active'
      );
    });

    it('should handle subscription creation failure', async () => {
      // Generate mock subscription data
      const mockSubscriptionData = {
        userId: 'user_123',
        tierId: 'price_123',
        customerId: 'cust_123'
      };

      // Mock Subscription constructor to simulate failure
      (Subscription as jest.Mock).mockImplementation(() => ({
        id: 'sub_123',
        status: 'failed'
      }));

      // Execute the test
      const result = await paymentService.createSubscription(mockSubscriptionData);

      // Verify the result
      expect(result).toBe(false);
    });

    it('should handle invalid subscription data', async () => {
      // Test with missing required fields
      const mockSubscriptionData = {
        userId: 'user_123'
      };

      // Execute the test
      const result = await paymentService.createSubscription(mockSubscriptionData as any);

      // Verify the result
      expect(result).toBe(false);
    });
  });
});