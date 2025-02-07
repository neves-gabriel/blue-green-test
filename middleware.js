// Define your blue/green configuration (you can later replace this with a fetch from an external service)
const blueGreenConfig = {
  deploymentDomainBlue: 'blue-green-test.vercel.app',
  deploymentDomainGreen: 'green--blue-green-test.vercel.app',
  // Adjust the percentage as needed: 20 means 20% of traffic goes to green.
  trafficGreenPercent: 20,
};

// Helper function to select the deployment based on the traffic percentage.
function selectDeployment() {
  const random = Math.random() * 100;
  return random < blueGreenConfig.trafficGreenPercent
    ? blueGreenConfig.deploymentDomainGreen
    : blueGreenConfig.deploymentDomainBlue;
}

export default async function middleware(request) {
  // Only process GET requests for HTML pages.
  if (request.method !== 'GET') {
    return fetch(request);
  }

  const targetDomain = selectDeployment();
  const url = new URL(request.url);

  // If the current hostname is already the target, simply continue.
  if (url.hostname === targetDomain) {
    return fetch(request);
  }

  // Change the hostname to the target deployment.
  url.hostname = targetDomain;

  // Option 1: Redirect the client (visible change in URL)
  // return Response.redirect(url.toString(), 307);

  // Option 2: Proxy the request server-side (seamless rewrite)
  const response = await fetch(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  return response;
}

// Export the Edge Function configuration.
export const config = {
  runtime: 'edge',
  matcher: '/:path*',
};
