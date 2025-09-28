/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  readonly VITE_MAP_ID: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
