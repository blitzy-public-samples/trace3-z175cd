'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

// Internal imports with relative paths
import { Publication } from '../../../types/publication';
import { Subscription } from '../../../types/subscription';
import { validateSubscription } from '../../../utils/validation';
import { fetchSubscriptions } from '../../../lib/api';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Toast } from '../../../components/common/Toast';

// Human Tasks:
// 1. Configure Stripe payment integration
// 2. Set up subscription webhook handlers
// 3. Review subscription tier pricing strategy
// 4. Configure email notification templates for subscription events

/**
 * Subscription page component for a specific publication
 * Addresses requirement: Monetization
 * Location: Technical Specification/Core Features/Monetization
 */
const SubscriptionPage: React.FC = () => {
  // Get publication slug from URL params
  const params = useParams();
  const publicationSlug = params?.publication as string;

  // State management
  const [publication, setPublication] = useState<Publication | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Subscription tiers configuration
  const subscriptionTiers = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: 5,
      description: 'Full access to all content, billed monthly',
      features: ['All premium content', 'Email newsletter', 'Community access']
    },
    {
      id: 'annual',
      name: 'Annual',
      price: 50,
      description: 'Full access to all content, billed annually (save 17%)',
      features: ['All premium content', 'Email newsletter', 'Community access', 'Exclusive events']
    }
  ];

  /**
   * Fetches publication and subscription data
   * Addresses requirement: Monetization - Data retrieval
   */
  const fetchPublicationData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchSubscriptions();
      
      // Validate subscription data
      const validSubscriptions = response.filter(sub => validateSubscription(sub));
      setSubscriptions(validSubscriptions);

      // Find the current publication
      const currentPublication = validSubscriptions.find(sub => 
        sub.publication.id === publicationSlug
      )?.publication;

      if (currentPublication) {
        setPublication(currentPublication);
      } else {
        setError('Publication not found');
      }
    } catch (err) {
      setError('Failed to load subscription data');
      console.error('Subscription data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [publicationSlug]);

  useEffect(() => {
    fetchPublicationData();
  }, [fetchPublicationData]);

  /**
   * Handles subscription tier selection
   * Addresses requirement: Monetization - Tier selection
   */
  const handleTierSelect = useCallback((tierId: string) => {
    setSelectedTier(tierId);
  }, []);

  /**
   * Handles subscription form submission
   * Addresses requirement: Monetization - Payment processing
   */
  const handleSubscribe = useCallback(async () => {
    if (!selectedTier || !publication) {
      setError('Please select a subscription tier');
      return;
    }

    try {
      // TODO: Implement Stripe payment flow
      // This will be configured by the human task #1
      
      // Mock subscription creation for now
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        tier: selectedTier,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        publication: publication
      };

      if (validateSubscription(newSubscription)) {
        setSubscriptions(prev => [...prev, newSubscription]);
        // Show success toast
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to process subscription');
      console.error('Subscription processing error:', err);
      return false;
    }
  }, [selectedTier, publication]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Toast
          message={error}
          type="error"
          duration={5000}
        />
        <Button
          label="Try Again"
          onClick={fetchPublicationData}
          variant="primary"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Publication Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Subscribe to {publication?.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Get unlimited access to premium content and exclusive benefits
        </p>
      </div>

      {/* Subscription Tiers */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {subscriptionTiers.map((tier) => (
          <div
            key={tier.id}
            className={`p-6 rounded-lg border-2 transition-all ${
              selectedTier === tier.id
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
            <p className="text-3xl font-bold mb-4">
              ${tier.price}
              <span className="text-base font-normal text-gray-600 dark:text-gray-300">
                /{tier.id === 'monthly' ? 'mo' : 'yr'}
              </span>
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {tier.description}
            </p>
            <ul className="mb-6">
              {tier.features.map((feature, index) => (
                <li key={index} className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              label={selectedTier === tier.id ? 'Selected' : 'Select'}
              onClick={() => handleTierSelect(tier.id)}
              variant={selectedTier === tier.id ? 'secondary' : 'primary'}
              disabled={selectedTier === tier.id}
            />
          </div>
        ))}
      </div>

      {/* Subscription Form */}
      {selectedTier && (
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
          <div className="space-y-4">
            <Input
              label="Card Number"
              type="text"
              placeholder="1234 5678 9012 3456"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                type="text"
                placeholder="MM/YY"
                required
              />
              <Input
                label="CVC"
                type="text"
                placeholder="123"
                required
              />
            </div>
            <Button
              label="Subscribe Now"
              onClick={handleSubscribe}
              variant="primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;