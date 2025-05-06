// Add this to a utils file, e.g., lib/image-utils.ts

/**
 * Helper function to get the complete image URL from a relative path
 * @param relativePath The relative path or partial URL from the API
 * @returns The complete URL to use for displaying the image
 */
export const getCompleteImageUrl = (relativePath?: string): string => {
    // If no path is provided, return default image
    if (!relativePath) {
      return process.env.NEXT_PUBLIC_DEFAULT_IMAGE_URL || '/api/placeholder/300/200';
    }
    
    // If it's already an absolute URL (starts with http/https), return as is
    if (relativePath.startsWith('http')) {
      return relativePath;
    }
    
    // Get the API base URL from environment variables or use the hardcoded URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://phpstack-732216-5200333.cloudwaysapps.com';
    
    // Remove leading slash if present to avoid double slashes
    const cleanRelativePath = relativePath.startsWith('/') 
      ? relativePath.substring(1) 
      : relativePath;
    
    // Construct the complete URL - ensure uploads directory is included
    return `${apiBaseUrl.endsWith('/') ? apiBaseUrl : apiBaseUrl + '/'}/uploads/${cleanRelativePath}`;
  };
  
  /**
   * Helper function to extract just the filename from a path
   * @param path The full path or URL
   * @returns Just the filename
   */
  export const getFilenameFromPath = (path?: string): string | undefined => {
    if (!path) return undefined;
    
    // Split by slashes and get the last part
    const parts = path.split('/');
    return parts[parts.length - 1];
  };
  
  /**
   * Checks if an image URL is valid
   * @param url The URL to check
   * @returns Whether the URL appears to be a valid image URL
   */
  export const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    
    // Check if it's a URL or path that looks like an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().endsWith(ext)
    );
    
    return hasImageExtension;
  };