// middleware.js
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

// Utility: choose deployment based on the traffic percentage
function selectDeployment(config) {
  // For simplicity, if trafficGreenPercent is 100, always choose green;
  // if 0, choose blue. For percentages in between, use a random chance.
  const random = Math.random() * 100;
  return random < config.trafficGreenPercent
    ? config.deploymentDomainGreen
    : config.deploymentDomainBlue;
}

export async function middleware(req) {
  // Only process GET requests for HTML pages (skip API routes, static assets, etc.)
  if (
    req.method !== 'GET' ||
    req.headers.get('sec-fetch-dest') !== 'document'
  ) {
    return NextResponse.next();
  }

  // Retrieve the blue-green configuration from Edge Config
  const config = await get('blue-green-configuration');

  // If the configuration is missing, continue normally
  if (!config) return NextResponse.next();

  const targetDomain = selectDeployment(config);

  // Check if the current host already matches the target; if so, no rewrite is needed.
  if (req.nextUrl.hostname === targetDomain) {
    return NextResponse.next();
  }

  // Otherwise, clone the URL and update the hostname
  const url = req.nextUrl.clone();
  url.hostname = targetDomain;

  // Optionally set a cookie so that subsequent requests in the session stick to the same deployment.
  const response = NextResponse.rewrite(url);
  response.cookies.set('__deployment', targetDomain, { path: '/' });
  return response;
}

// Apply this middleware to all routes.
export const config = {
  matcher: '/:path*',
};
