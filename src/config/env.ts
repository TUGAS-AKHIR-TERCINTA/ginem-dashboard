export const CONFIGS = {
  env: import.meta.env.VITE_APP_STAGE || "development",
  baseUrl: import.meta.env.VITE_BASE_URL,
  localStorageKey: import.meta.env.VITE_LOCAL_STORAGE_KEY,
  uploadFileUrl: import.meta.env.VITE_UPLOAD_FILE_URL,
  uploadFileApiKey: import.meta.env.VITE_UPLOAD_FILE_API_KEY,
  tokenKeyLocalStorage: import.meta.env.VITE_TOKEN_KEY_LOCAL_STORAGE,
  tokenSecret: import.meta.env.VITE_TOKEN_SECRET,
};
