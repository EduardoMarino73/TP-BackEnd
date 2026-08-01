import "dotenv/config";
import { createPool } from "mysql2/promise";
const requiredSettings = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"];
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);
if (missingSettings.length > 0) {
    throw new Error(`Missing database settings: ${missingSettings.join(", ")}`);
}
export const db = createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
});
//# sourceMappingURL=connections.js.map