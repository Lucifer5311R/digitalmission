import { useState, useEffect, useRef } from 'react';
import { getElapsedTime, padZero } from '../utils/formatters';

export function useTimer(startTime: string | null) {
  const [elapsed, setElapsed] = useState('00:00:00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startTime) {
      setElapsed('00:00:00');
      return;
    }

    const updateTimer = () => {
      const { hours, minutes, seconds } = getElapsedTime(startTime);
      setElapsed(`${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`);
    };

    updateTimer();
    intervalRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime]);

  return elapsed;
}
