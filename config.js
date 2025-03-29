import "dotenv/config";

const config = {
  PORT: process.env.PORT,
  MONGODB_URL: process.env.MONGODB_URL,
  PRODDEV: process.env.PRODDEV || "prod",
  FRONTEND_PATH: process.env.FRONTEND_PATH,
};

export default config;
