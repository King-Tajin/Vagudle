import { useEffect, useRef } from "react";

export const useStorageSync = (key: string, onChange: () => void): void => {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.storageArea && e.storageArea !== localStorage) return;
      onChangeRef.current();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);
};
