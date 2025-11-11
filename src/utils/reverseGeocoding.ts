const cache = new Map<string, string>();

/**
 * Convert latitude and longitude to a human-readable address using OpenCage Geocoding API.
 * Caches results to minimize API calls.
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns A promise that resolves to the address string.
 */
export const reverseGeocode = async (
  lat: number,
  lon: number
): Promise<string> => {
  const cacheKey = `${lat},${lon}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  if (!apiKey) throw new Error("Falta la API Key de OpenCage");

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}&language=es&no_annotations=1`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Error en la respuesta de OpenCage");

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error("Sin dirección");
  }

  const address = data.results[0].formatted;
  cache.set(cacheKey, address);

  return address;
};
