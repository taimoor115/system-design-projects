import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Tells Next.js to trace files from the monorepo root so the standalone
  // bundle includes shared workspace packages (e.g. @repo/schemas).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  reactCompiler: true,

  images: {
    qualities: [75],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
}

export default nextConfig