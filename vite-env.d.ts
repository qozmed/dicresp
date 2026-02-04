/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_CONTACT_API_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
