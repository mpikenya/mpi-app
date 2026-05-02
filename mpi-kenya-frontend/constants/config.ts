// File: constants/config.ts

// The BASE_URL is now read from the environment variables.
// The `EXPO_PUBLIC_API_URL` is set in your .env files for local dev
// and in your eas.json for production builds.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// We add a check to make sure the developer doesn't forget to set the variable.
if (!BASE_URL) {
  throw new Error("Missing API URL. Please set EXPO_PUBLIC_API_URL in your environment.");
}

export default {
  BASE_URL,
};