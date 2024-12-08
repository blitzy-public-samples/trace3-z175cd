// react v18.x
import React, { useState, useEffect } from 'react';
// Import internal components and utilities
import Header from './Header';
import { validateAuthUser } from '../../utils/validation';
import { formatToDisplayDate } from '../../utils/date';
// Import global styles
import '../../styles/globals.css';

/**
 * Human Tasks:
 * 1. Configure analytics tracking for footer interactions
 * 2. Review accessibility compliance with WCAG guidelines
 * 3. Verify social media links and policies are up to date
 * 4. Test footer responsiveness across different screen sizes
 */

interface FooterProps {
  showBranding?: boolean;
  showSocialLinks?: boolean;
  showLegalLinks?: boolean;
}

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Implements a reusable footer component that adheres to the design system and
 * supports branding, navigation, and additional information.
 */
const Footer: React.FC<FooterProps> = ({
  showBranding = true,
  showSocialLinks = true,
  showLegalLinks = true
}) => {
  // State for managing footer visibility and user authentication
  const [isVisible, setIsVisible] = useState(true);
  const [currentYear] = useState(new Date().getFullYear());
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Effect to initialize footer state and check authentication
  useEffect(() => {
    const initializeFooter = async () => {
      try {
        // Validate user authentication if needed
        const user = { id: '1', email: 'user@example.com' }; // Replace with actual user data
        if (validateAuthUser(user)) {
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Footer initialization error:', error);
      }
    };

    initializeFooter();
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding Section */}
          {showBranding && (
            <div className="col-span-1">
              <h3 className="text-xl font-semibold text-white mb-4">
                Substack Replica
              </h3>
              <p className="text-sm">
                A platform for independent writers and publishers.
              </p>
            </div>
          )}

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/explore"
                  className="hover:text-white transition-colors duration-200"
                >
                  Explore
                </a>
              </li>
              <li>
                <a
                  href="/publications"
                  className="hover:text-white transition-colors duration-200"
                >
                  Publications
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-white transition-colors duration-200"
                >
                  Dashboard
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          {showSocialLinks && (
            <div className="col-span-1">
              <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://twitter.com/substackreplica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Twitter
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/substackreplica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-200"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://linkedin.com/company/substackreplica"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors duration-200"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Legal Links */}
          {showLegalLinks && (
            <div className="col-span-1">
              <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/cookies"
                    className="hover:text-white transition-colors duration-200"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              © {currentYear} Substack Replica. All rights reserved.
            </p>
            <p className="text-sm mt-2 md:mt-0">
              Last updated: {formatToDisplayDate(lastUpdated)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;