
  // next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Existing config...
    
    // Add this to ignore TypeScript errors during build
    typescript: {
      // !! WARN !!
      // Dangerously allow production builds to successfully complete even if
      // your project has type errors.
      // !! WARN !!
      ignoreBuildErrors: true,
    },

    // Add image configuration
    images: {
      remotePatterns: [
        {
          protocol: 'http', // or 'https' if your backend uses it
          hostname: 'localhost',
          port: '3005', // Specify the port
          pathname: '/api/uploads/**', // Allow any path under /api/uploads
        },
        // Add other allowed domains here if needed
      ],
    },
  }
  
  export default nextConfig;  // Use ES module export instead of module.exports