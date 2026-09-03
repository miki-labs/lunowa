import {cloudflare} from '@cloudflare/vite-plugin';
import vinext from 'vinext';
import {defineConfig} from 'vite';

// Keep the Cloudflare runtime at this deployment boundary. Lunowa application
// code remains standard Next.js and does not import Workers APIs.
export default defineConfig({
  plugins: [
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: 'rsc',
        childEnvironments: ['ssr']
      }
    })
  ]
});
