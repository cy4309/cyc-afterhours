export type DataSource = "mock" | "cloudflare";

export interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1Statement;
}

export interface R2Credentials {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicBaseUrl?: string;
}

export interface RuntimeEnv {
  dataSource: DataSource;
  db?: D1DatabaseLike;
  r2?: R2Credentials;
}

function readProcessEnv(): NodeJS.ProcessEnv {
  return process.env;
}

export function getDataSource(): DataSource {
  return readProcessEnv().DATA_SOURCE === "cloudflare" ? "cloudflare" : "mock";
}

export async function getRuntimeEnv(): Promise<RuntimeEnv> {
  const dataSource = getDataSource();

  if (dataSource === "mock") {
    return { dataSource };
  }

  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as CloudflareEnv;

  const accountId = cloudflareEnv.R2_ACCOUNT_ID || readProcessEnv().R2_ACCOUNT_ID;
  const accessKeyId = cloudflareEnv.R2_ACCESS_KEY_ID || readProcessEnv().R2_ACCESS_KEY_ID;
  const secretAccessKey =
    cloudflareEnv.R2_SECRET_ACCESS_KEY || readProcessEnv().R2_SECRET_ACCESS_KEY;
  const bucketName = cloudflareEnv.R2_BUCKET_NAME || readProcessEnv().R2_BUCKET_NAME;
  const publicBaseUrl = cloudflareEnv.R2_PUBLIC_BASE_URL || readProcessEnv().R2_PUBLIC_BASE_URL;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.");
  }

  if (!cloudflareEnv.cyc_afterhours) {
    throw new Error("Missing D1 binding cyc_afterhours.");
  }

  return {
    dataSource,
    db: cloudflareEnv.cyc_afterhours,
    r2: {
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicBaseUrl: publicBaseUrl || undefined,
    },
  };
}
