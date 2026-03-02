import type { Config } from "drizzle-kit";

const config: Config = {
    out: "drizzle/migrations",
    schema: "src/db/schema.ts",
    dialect: "sqlite",
};

export default config satisfies Config;