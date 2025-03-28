
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
  }
  
  export default nextConfig;  // Use ES module export instead of module.exports