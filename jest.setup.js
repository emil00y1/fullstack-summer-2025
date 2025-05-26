// jest.setup.js
import '@testing-library/jest-dom';

// Mock Next.js router - FIX: Use jest.fn() for each hook
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  MessageSquare: () => <div data-testid='message-square' />,
  Heart: () => <div data-testid='heart' />,
  Repeat: () => <div data-testid='repeat' />,
  MoreVertical: () => <div data-testid='more-vertical' />,
  Globe: () => <div data-testid='globe' />,
  Lock: () => <div data-testid='lock' />,
  Loader2: () => <div data-testid='loader2' />,
  Trash2: () => <div data-testid='trash2' />,
  AlertTriangle: () => <div data-testid='alert-triangle' />,
}));

// Mock Next.js Image and Link
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

global.fetch = jest.fn();
