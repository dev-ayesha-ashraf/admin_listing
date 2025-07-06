import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": {
      REACT_APP_AWS_REGION: JSON.stringify(process.env.REACT_APP_AWS_REGION),
      REACT_APP_AWS_BUCKET: JSON.stringify(process.env.REACT_APP_AWS_BUCKET),
      REACT_APP_AWS_ACCESS_KEY_ID: JSON.stringify(
        process.env.REACT_APP_AWS_ACCESS_KEY_ID
      ),
      REACT_APP_AWS_SECRET_ACCESS_KEY: JSON.stringify(
        process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
      ),
    },
  },
});
