import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TrainerDashboard } from '../../src/components/trainer/TrainerDashboard';

// Mock auth context
const mockUser = {
  id: 'trainer-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'trainer' as const,
};

vi.mock('../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock API calls
let mockStatsResponse: any;
let mockActiveResponse: any;
let mockSessionsResponse: any;
let mockApiError = false;

vi.mock('../../src/services/api', () => ({
  trainersApi: {
    getStats: vi.fn(() =>
      mockApiError
        ? Promise.reject(new Error('API error'))
        : Promise.resolve(mockStatsResponse)
    ),
  },
  sessionsApi: {
    getActive: vi.fn(() =>
      mockApiError
        ? Promise.reject(new Error('API error'))
        : Promise.resolve(mockActiveResponse)
    ),
    getMySessions: vi.fn(() =>
      mockApiError
        ? Promise.reject(new Error('API error'))
        : Promise.resolve(mockSessionsResponse)
    ),
  },
}));

// Mock useTimer hook
vi.mock('../../src/hooks/useTimer', () => ({
  useTimer: () => '01:30:00',
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Clock: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'clock-icon' }),
  Calendar: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'calendar-icon' }),
  Star: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'star-icon' }),
  Play: (props: any) => React.createElement('svg', { ...props, 'data-testid': 'play-icon' }),
}));

describe('TrainerDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiError = false;
    mockStatsResponse = {
      data: {
        data: {
          stats: {
            averageRating: 4.5,
            totalRatings: 10,
            totalSessions: 25,
            totalHours: 120,
          },
        },
      },
    };
    mockActiveResponse = {
      data: { data: null },
    };
    mockSessionsResponse = {
      data: {
        data: [
          {
            id: 's1',
            trainer_id: 'trainer-1',
            class_id: 'c1',
            check_in_time: '2024-01-15T09:00:00Z',
            check_out_time: '2024-01-15T11:00:00Z',
            duration_minutes: 120,
            status: 'completed',
            class: { id: 'c1', name: 'Morning Yoga' },
            created_at: '2024-01-15T09:00:00Z',
          },
        ],
      },
    };
  });

  it('shows loading spinner initially', () => {
    const { container } = render(<TrainerDashboard />);
    // The loading spinner has an svg with animate-spin
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders welcome message after loading', async () => {
    render(<TrainerDashboard />);
    expect(await screen.findByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByText("Here's your attendance overview")).toBeInTheDocument();
  });

  it('displays stats cards with data', async () => {
    render(<TrainerDashboard />);
    expect(await screen.findByText('120h')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('displays today\'s sessions', async () => {
    render(<TrainerDashboard />);
    expect(await screen.findByText("Today's Sessions")).toBeInTheDocument();
    expect(screen.getByText('Morning Yoga')).toBeInTheDocument();
  });

  it('shows "No sessions today" when empty', async () => {
    mockSessionsResponse = { data: { data: [] } };
    render(<TrainerDashboard />);
    expect(await screen.findByText('No sessions today')).toBeInTheDocument();
  });

  it('shows active session banner when active', async () => {
    mockActiveResponse = {
      data: {
        data: {
          id: 's-active',
          trainer_id: 'trainer-1',
          class_id: 'c1',
          check_in_time: '2024-01-15T09:00:00Z',
          check_out_time: null,
          duration_minutes: null,
          status: 'active',
          class: { id: 'c1', name: 'Active Class' },
          created_at: '2024-01-15T09:00:00Z',
        },
      },
    };
    render(<TrainerDashboard />);
    expect(await screen.findByText('Active Session')).toBeInTheDocument();
    expect(screen.getByText('Active Class')).toBeInTheDocument();
    expect(screen.getByText('01:30:00')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('shows N/A for average rating when null', async () => {
    mockStatsResponse = {
      data: {
        data: {
          stats: {
            averageRating: null,
            totalRatings: 0,
            totalSessions: 0,
            totalHours: 0,
          },
        },
      },
    };
    render(<TrainerDashboard />);
    expect(await screen.findByText('N/A')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    mockApiError = true;
    render(<TrainerDashboard />);
    // Should still render (error caught, loading finishes)
    expect(await screen.findByText('Welcome, John Doe')).toBeInTheDocument();
  });
});
