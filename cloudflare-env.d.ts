declare global {
  interface CloudflareEnv {
    cyc_afterhours: {
      prepare(query: string): {
        bind(...values: unknown[]): this;
        all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
        first<T = Record<string, unknown>>(): Promise<T | null>;
        run(): Promise<{ success: boolean }>;
      };
    };
    MEDIA_BUCKET?: unknown;
    DATA_SOURCE?: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
    R2_PUBLIC_BASE_URL?: string;
  }
}

export {};
