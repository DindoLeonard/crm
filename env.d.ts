namespace NodeJS {
  interface ProcessEnv {
    AUTH_SECRET: string;
    AUTH_DRIZZLE_URL: string;
    AUTH_GOOGLE_ID: string;
    AUTH_GOOGLE_SECRET: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    AWS_S3_BUCKET_NAME: string;
    NEXT_PUBLIC_AWS_REGION: string;
    NEXT_PUBLIC_AWS_S3_BUCKET_NAME: string;
  }
}
