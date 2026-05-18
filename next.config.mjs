/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['shamela', 'sql.js', 'better-sqlite3', 'adm-zip'],
};

export default nextConfig;
