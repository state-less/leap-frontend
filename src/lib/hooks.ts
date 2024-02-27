import { useEffect, useRef, useState } from 'react';

export const useSyncedState = (
  defValue,
  updateFn,
  {
    draft,
    successFn,
  }: { draft?: boolean; successFn?: (value?: unknown) => void } = {
    draft: false,
  }
) => {
  const timeout = useRef<number | NodeJS.Timeout | null>(null);
  const timestampSave = useRef(0);
  const timestampLocal = useRef(0);
  const [localValue, setLocalValue] = useState(defValue);
  const [loading, setLoading] = useState(false);

  const setValue = async (value) => {
    setLocalValue(value);
    timestampLocal.current = +new Date();
    if (timeout.current) clearTimeout(timeout.current);
    const save = async () => {
      setLoading(true);
      timestampSave.current = +new Date();
      await updateFn(value);
      successFn?.(value);
    };

    if (draft) {
      await save();
    } else {
      timeout.current = setTimeout(async () => {
        await save();
      }, 1500);
    }
  };

  useEffect(() => {
    if (timestampLocal <= timestampSave) {
      setLocalValue(defValue);
    }

    setLoading(false);
  }, [defValue]);

  return [localValue, setValue, { loading }];
};

export const useIsOffScreen = () => {
  const [isOffScreen, setIsOffScreen] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    if (!ref?.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsOffScreen(true);
        } else if (entries[0]?.boundingClientRect?.y > 0) {
          setIsOffScreen(false);
        }
      },
      {
        root: document.body,
        rootMargin: '0px 0px -100%',
        threshold: 0.0,
      }
    );
    obs.observe(ref?.current);
  }, [setIsOffScreen]);

  return [ref, isOffScreen];
};
