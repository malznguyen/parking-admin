/**
 * Image Helper Functions
 * Utilities for generating and managing mock parking images
 */

/**
 * Get a random entry image path
 * Returns one of 20 available entry camera images
 */
export function getRandomEntryImage(): string {
  const imageNumber = Math.floor(Math.random() * 20) + 1; // 1-20
  return `/mock-images/entry-${imageNumber}.jpg`;
}

/**
 * Get a random exit image path
 * Returns one of 20 available exit camera images
 */
export function getRandomExitImage(): string {
  const imageNumber = Math.floor(Math.random() * 20) + 1; // 1-20
  return `/mock-images/exit-${imageNumber}.jpg`;
}

/**
 * Get a random exception raw image path
 * Returns one of 30 available raw exception images
 */
export function getRandomExceptionRawImage(): string {
  const imageNumber = Math.floor(Math.random() * 30) + 1; // 1-30
  return `/mock-images/exception-raw-${imageNumber}.jpg`;
}

/**
 * Get a random exception processed image path
 * Returns one of 30 available processed exception images
 */
export function getRandomExceptionProcessedImage(): string {
  const imageNumber = Math.floor(Math.random() * 30) + 1; // 1-30
  return `/mock-images/exception-processed-${imageNumber}.jpg`;
}

/**
 * Get fallback placeholder image URL for type
 * Uses placehold.co service for demo purposes when actual images don't exist
 */
export function getFallbackImage(
  type: 'entry' | 'exit' | 'exception',
  width: number = 800,
  height: number = 600
): string {
  const labels = {
    entry: 'Entry+Camera',
    exit: 'Exit+Camera',
    exception: 'Exception+Image',
  };

  return `https://placehold.co/${width}x${height}/1e293b/94a3b8?text=${labels[type]}`;
}

/**
 * Validate image path format
 * Checks if the path follows the expected mock-images pattern
 */
export function isValidImagePath(path: string): boolean {
  return (
    path.startsWith('/mock-images/') &&
    (path.includes('entry-') ||
      path.includes('exit-') ||
      path.includes('exception-'))
  );
}

/**
 * Get specific entry image by number
 */
export function getEntryImage(num: number): string {
  const imageNumber = Math.max(1, Math.min(20, num)); // Clamp between 1-20
  return `/mock-images/entry-${imageNumber}.jpg`;
}

/**
 * Get specific exit image by number
 */
export function getExitImage(num: number): string {
  const imageNumber = Math.max(1, Math.min(20, num)); // Clamp between 1-20
  return `/mock-images/exit-${imageNumber}.jpg`;
}

/**
 * Get specific exception raw image by number
 */
export function getExceptionRawImage(num: number): string {
  const imageNumber = Math.max(1, Math.min(30, num)); // Clamp between 1-30
  return `/mock-images/exception-raw-${imageNumber}.jpg`;
}

/**
 * Get specific exception processed image by number
 */
export function getExceptionProcessedImage(num: number): string {
  const imageNumber = Math.max(1, Math.min(30, num)); // Clamp between 1-30
  return `/mock-images/exception-processed-${imageNumber}.jpg`;
}
