import { useEffect, useState } from 'react';

const useResponsiveValue = (calculate) => {
  const isFn = typeof calculate === 'function';
  const getValue = () => (isFn ? calculate() : calculate);

  const [value, setValue] = useState(getValue);

  useEffect(() => {
    setValue(getValue());
  }, [calculate]);

  useEffect(() => {
    if (typeof window === 'undefined' || !isFn) {
      return undefined;
    }

    const handleResize = () => setValue(calculate());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculate, isFn]);

  return value;
};

export default useResponsiveValue;
