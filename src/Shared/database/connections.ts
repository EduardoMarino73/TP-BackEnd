import "reflect-metadata";
import "dotenv/config";
import { MikroORM } from "@mikro-orm/mysql";
import { Appeal } from "../../Appeal/appeal.entity.js";
import { Audiovisual } from "../../Audiovisual/audiovisual.entity.js";
import { Episode } from "../../Episode/episode.entity.js";
import { Movie } from "../../Movie/movie.entity.js";
import { Complaint, ContentReport } from "../../Report/complaint.entity.js";
import { ReportType } from "../../Report_Type/report_type.entity.js";
import { Review } from "../../Review/review.entity.js";
import { Season } from "../../Season/season.entity.js";
import { Serie } from "../../Series/series.entity.js";
import { Administrator } from "../../User_Folder/administrator/administrator.entity.js";
import { User } from "../../User_Folder/user.entity.js";
import { UserSession } from "../../User_Folder/user_session.entity.js";
import { Viewer } from "../../User_Folder/viewer/viewer.entity.js";
import { WatchLater } from "../../WatchLater/watch_later.entity.js";

const requiredSettings = ["MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD", "MYSQL_DATABASE"] as const;
const missingSettings = requiredSettings.filter((setting) => !process.env[setting]);

if (missingSettings.length > 0) {
    throw new Error(`Missing database settings: ${missingSettings.join(", ")}`);
}

/**
 * The ORM (MikroORM) that maps the entities to the MySQL tables.
 * The tables are created by init.sql: the ORM only maps them, it never changes the schema.
 * Repositories use orm.em, which index.ts scopes to each request with a RequestContext.
 */
export const orm = await MikroORM.init({
    entities: [
        User, Viewer, Administrator, UserSession,
        Audiovisual, Movie, Serie, Season, Episode,
        Review, WatchLater, ReportType, Complaint, ContentReport, Appeal,
    ],
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    dbName: process.env.MYSQL_DATABASE,
    pool: { min: 0, max: 10 },
    ensureDatabase: false,
    // MYSQL_DEBUG=true logs every SQL query the ORM runs
    debug: process.env.MYSQL_DEBUG === "true",
});
