// src/lib/useEnlargement.ts

import { useState } from 'react';

export const useEnlargement = () => {
  const [isEnlarged, setIsEnlarged] = useState(false);
  return { isEnlarged, setIsEnlarged };
};