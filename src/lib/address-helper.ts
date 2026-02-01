// src/lib/address-helper.ts

export interface SplitAddress {
  street: string;
  city: string;
}

/**
 * Splits a full Swiss address into street and city parts
 * @param fullAddress - Full address like "Hagenholzstrasse 60, 8050 Zürich"
 * @returns Object with street and city parts
 */
export function splitAddress(fullAddress: string): SplitAddress {
  if (!fullAddress) {
    return { street: '', city: '' };
  }

  // Swiss addresses typically use comma to separate street from city
  const parts = fullAddress.split(',');
  
  if (parts.length >= 2) {
    return {
      street: parts[0].trim(),
      city: parts.slice(1).join(',').trim()
    };
  }
  
  // Fallback: try to split at PLZ (4-digit number)
  const plzMatch = fullAddress.match(/^(.*?)(\d{4}\s+.+)$/);
  if (plzMatch) {
    return {
      street: plzMatch[1].trim().replace(/,$/, ''),
      city: plzMatch[2].trim()
    };
  }
  
  // If no pattern matches, return whole address as street
  return {
    street: fullAddress.trim(),
    city: ''
  };
}

/**
 * Joins street and city back into full address
 */
export function joinAddress(street: string, city: string): string {
  if (!street && !city) return '';
  if (!street) return city;
  if (!city) return street;
  return `${street}, ${city}`;
}
