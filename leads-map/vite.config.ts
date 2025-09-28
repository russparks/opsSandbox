import { defineConfig, loadEnv } from 'vite';
import environment from 'vite-plugin-environment';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      environment({
        VITE_GOOGLE_MAPS_API_KEY: env.VITE_GOOGLE_MAPS_API_KEY ?? '',
        VITE_MAP_ID: env.VITE_MAP_ID ?? '6e0ccd1a55446bd922d281f4',
      }),
    ],
  };
});
