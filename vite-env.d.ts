// env.d.ts
interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly REACT_APP_GOOGLE_ID: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
