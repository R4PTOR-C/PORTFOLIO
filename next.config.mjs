/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  /* Static export ships no image optimizer, so next/image serves the files
     as-is. Still worth using: it reserves layout space and lazy-loads. */
  images: { unoptimized: true },
};

export default nextConfig;
