// Expo injects EXPO_PUBLIC_* env vars onto process.env at build time.
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};
