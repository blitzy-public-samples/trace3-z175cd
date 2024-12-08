/**
 * Human Tasks:
 * 1. Verify loading spinner animation performance on low-end devices
 * 2. Test loading component accessibility with screen readers
 * 3. Validate loading state visibility in different color modes
 */

// Import dependencies
import { Spinner } from '../components/common/Spinner';

// Import styles
import '../styles/globals.css';
import '../styles/tailwind.css';

/**
 * @requirement User Interface Design
 * Location: Technical Specification/User Interface Design/Interface Elements
 * Description: Provides a visual indicator for loading states, ensuring a consistent user experience
 * during page transitions or data fetching.
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner 
        isLoading={true}
        message="Loading content..."
      />
    </div>
  );
}