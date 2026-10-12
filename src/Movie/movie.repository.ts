import { Movie } from "./movie.entity.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Repository } from "../Shared/repository.js";

/*represent a table in the movies table */
type MovieRow = RowDataPacket & {
    id: number;
    id_author: number;
    path: string;
    title: string;
    category: string;
    views: number;
    description: string;
    state: string;
    thumbnail_path: string | null;
    uploader_user_name?: string | null;
};

/* every read joins the uploader, so the detail can show who uploaded the movie */
const MOVIE_SELECT = `SELECT m.id, m.id_author, m.path, m.title, m.category, m.views, m.description, m.state,
        m.thumbnail_path, u.user_name AS uploader_user_name
    FROM movies AS m
    LEFT JOIN users AS u ON u.id_user = m.id_author`;

export type DTO_Movie = {
    id: number;
    title: string;
}

/*is a function that convet a MovieRow into instance of Movie */
const toMovie = (row: MovieRow): Movie => Object.assign(new Movie(
    row.id_author,
    row.path,
    row.title,
    row.category,
    Number(row.views),
    row.description,
    row.state,
    undefined,
    row.id,
), {
    uploader_user_name: row.uploader_user_name ?? undefined,
    thumbnail_path: row.thumbnail_path ?? null,
});

export class MovieRepository implements Repository<Movie> {

    async findAll(): Promise<Movie[]> {
        /* the [rows] only take the firts parameter of the return
        its like:
        const result = await db.query...
        const rows = result[0]*/
        const [rows] = await db.query<MovieRow[]>(
            `${MOVIE_SELECT} WHERE m.state = 'active' ORDER BY m.id`,
        );
        /*map apply a callback function to every item into the array rows*/
        return rows.map(toMovie);
    }

    async findOne(id: number): Promise<Movie | undefined> {
        /*take the firts parameter*/
        const [rows] = await db.query<MovieRow[]>(
            `${MOVIE_SELECT} WHERE m.id = ? AND m.state = 'active'`,
            [id],
        );
        /*ternary operators
        try to return a movie or, insted return undefined */
        return rows[0] ? toMovie(rows[0]) : undefined;
    }

    /** Returns movies uploaded by one user. */
    async findByAuthor(authorId: number): Promise<Movie[]> {
        const [rows] = await db.execute<MovieRow[]>(
            `${MOVIE_SELECT}
             WHERE m.id_author = ? AND m.state <> 'deleted'
             ORDER BY m.id`,
            [authorId],
        );
        return rows.map(toMovie);
    }

    async create(item: Movie): Promise<Movie> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO movies (id_author, path, thumbnail_path, title, category, views, description, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [item.id_author, item.path, item.thumbnail_path, item.title, item.category, item.views, item.description, item.state],
        );
        /**it set the id of the movie that inserted into the table of the database*/
        item.id = result.insertId;
        return item;
    }

    async update(id:number,input: Partial<Movie>): Promise<Movie | undefined> {
        /* only the fields an uploader may edit: state, views, path and the author are never changed here */
        const allowedFields = ["title", "category", "description"] as const;
        const fields = allowedFields.filter((field) => input[field] !== undefined);
        if (fields.length === 0) return this.findOne(id);
        
        /**it build a dinamic query with map giving a callback and appending it into a string with 
         * join method 
         */
        const assignments = fields.map((field) => `${field} = ?`).join(", ");
        /**and it build the query´s parameter part for execute method casting the input into correct type */
        const values = fields.map((field) => input[field]) as Array<string | number | boolean>;
        await db.execute(
            `UPDATE movies SET ${assignments} WHERE id = ?`,
            [...values, id],
        );
        return this.findOne(id);
    }
    
    /** Logical delete: the movie is hidden everywhere, but its row and file are kept. */
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "UPDATE movies SET state = 'deleted' WHERE id = ? AND state = 'active'",
            [id],
        );
        /**it return a number in form of a boolean value true or false  */
        return result.affectedRows > 0;
    }
}
