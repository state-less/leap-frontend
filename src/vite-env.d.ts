// env.d.ts
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly REACT_APP_GOOGLE_ID: string;
  readonly SSR: boolean;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __MD_STATE__: any;
}
