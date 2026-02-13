import { useState } from 'react';
import { detectTimezone } from '../utils/timezone';

export function useTimezone() {
  const [timezone, setTimezone] = useState(() => {
    const saved = localStorage.getItem('wc2026-timezone');
    return saved || detectTimezone();
  });

  const updateTimezone = (tz) => {
    setTimezone(tz);
    localStorage.setItem('wc2026-timezone', tz);
  };

  return { timezone, setTimezone: updateTimezone };
}
