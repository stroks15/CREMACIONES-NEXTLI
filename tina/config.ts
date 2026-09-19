import { defineConfig } from "tinacms";

const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // TinaCloud credentials will be added in the production connection step.
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,

  // IMPORTANT: NEXTLI already has a legacy /admin panel.
  // Keep Tina isolated at /tina-admin during the migration.
  build: {
    outputFolder: "tina-admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      publicFolder: "public",
      mediaRoot: "images",
    },
  },

  schema: {
    collections: [],
  },

  telemetry: "disabled",
});
