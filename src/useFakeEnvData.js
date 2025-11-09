// src/useFakeEnvData.js
import { useEffect, useState } from "react";

/**
 * Simulates live environment data.
 * Returns { temp, hum } and updates them every ~1.2s with a small random walk.
 */
export function useFakeEnvData() {
  const [data, setData] = useState({ temp: 78.0, hum: 42.0 });

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const nextT = Math.max(60, Math.min(100, prev.temp + (Math.random() - 0.5) * 1.6));
        const nextH = Math.max(15, Math.min(90,  prev.hum  + (Math.random() - 0.5) * 2.2));
        return {
          temp: Number(nextT.toFixed(1)),
          hum:  Number(nextH.toFixed(1))
        };
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return data;
}
