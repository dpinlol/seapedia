import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "3001"),
  databaseUrl: process.env.DATABASE_URL || "",
  jwtSecret: process.env.JWT_SECRET || "seapedia-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
