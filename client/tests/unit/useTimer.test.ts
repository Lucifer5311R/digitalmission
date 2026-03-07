import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../../src/hooks/useTimer';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 00:00:00 when startTime is null', () => {
    const { result } = renderHook(() => useTimer(null));
    expect(result.current).toBe('00:00:00');
  });

  it('shows elapsed time from start', () => {
    const now = new Date();
    vi.setSystemTime(now);

    // Start time is 65 seconds ago
    const startTime = new Date(now.getTime() - 65000).toISOString();
    const { result } = renderHook(() => useTimer(startTime));

    expect(result.current).toBe('00:01:05');
  });

  it('updates elapsed time every second', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const startTime = new Date(now.getTime() - 1000).toISOString();
    const { result } = renderHook(() => useTimer(startTime));

    expect(result.current).toBe('00:00:01');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('00:00:02');
  });

  it('resets to 00:00:00 when startTime becomes null', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const startTime = new Date(now.getTime() - 5000).toISOString();
    const initialProps: { time: string | null } = { time: startTime };
    const { result, rerender } = renderHook(
      ({ time }: { time: string | null }) => useTimer(time),
      { initialProps }
    );

    expect(result.current).toBe('00:00:05');

    rerender({ time: null });
    expect(result.current).toBe('00:00:00');
  });

  it('formats hours correctly', () => {
    const now = new Date();
    vi.setSystemTime(now);

    const startTime = new Date(now.getTime() - 3661000).toISOString(); // 1h 1m 1s
    const { result } = renderHook(() => useTimer(startTime));

    expect(result.current).toBe('01:01:01');
  });
});
