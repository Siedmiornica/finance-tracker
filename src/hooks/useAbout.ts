import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { AboutData, ValidationResult } from '../lib/types';

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function useAbout() {
  const [about, setAbout] = useState<AboutData | null>(() => {
    return storage.get<AboutData | null>('about', null);
  });

  useEffect(() => {
    const data = storage.get<AboutData | null>('about', null);
    setAbout(data);
  }, []);

  function save(data: AboutData): ValidationResult {
    const errors: Record<string, string> = {};

    if (data.description.length > 2000) {
      errors.description = 'Opis nie może przekraczać 2000 znaków';
    }

    if (data.socialLinks.length > 10) {
      errors.socialLinks = 'Maksymalnie 10 linków do mediów społecznościowych';
    }

    data.socialLinks.forEach((link, index) => {
      if (!isValidUrl(link.url)) {
        errors[`socialLinks[${index}].url`] = `Nieprawidłowy format URL: ${link.url}`;
      }
    });

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    storage.set('about', data);
    setAbout(data);
    return { success: true, errors: {} };
  }

  return { about, save };
}
