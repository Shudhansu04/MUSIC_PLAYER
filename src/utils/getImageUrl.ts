import { Image } from '../types';

export const getImageUrl = (images: Image[], preferredQuality: string = '500x500'): string => {
  if (!images || images.length === 0) {
    return 'https://via.placeholder.com/500';
  }

  // Try to find the preferred quality
  const preferred = images.find((img) => img.quality === preferredQuality);
  if (preferred) {
    return preferred.link || preferred.url || 'https://via.placeholder.com/500';
  }

  // Fallback to highest quality
  const sorted = [...images].sort((a, b) => {
    const aSize = parseInt(a.quality.split('x')[0]) || 0;
    const bSize = parseInt(b.quality.split('x')[0]) || 0;
    return bSize - aSize;
  });

  return sorted[0]?.link || sorted[0]?.url || 'https://via.placeholder.com/500';
};
