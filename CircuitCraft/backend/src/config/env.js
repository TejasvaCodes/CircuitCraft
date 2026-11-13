import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  nexarClientId: process.env.NEXAR_CLIENT_ID,
  nexarClientSecret: process.env.NEXAR_CLIENT_SECRET,
  nexarTokenUrl: process.env.NEXAR_TOKEN_URL || "https://identity.nexar.com/connect/token",
  nexarGraphqlUrl: process.env.NEXAR_GRAPHQL_URL || "https://api.nexar.com/graphql",
  nexarScope: process.env.NEXAR_SCOPE || "supply.domain"
};

export function hasNexarCredentials() {
  return Boolean(env.nexarClientId && env.nexarClientSecret &&
    env.nexarClientId !== "replace_me" && env.nexarClientSecret !== "replace_me");
}
