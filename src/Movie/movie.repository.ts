import { Movie } from "./movie.entity.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Repository } from "../Shared/repository.js";

/*represent a table in the movies table */
type MovieRow = RowDataPacket & {
    id: number;
    title: string;
    category: string;
    views: number;
    description: string;
    state: number;
};

export type DTO_Movie = {
    id: number;
    tittle: string;
}

/*is a function that convet a MovieRow into instance of Movie */
const toMovie = (row: MovieRow): Movie => new Movie(
    row.path,
    row.tittle,
    row.category,
    Number(row.views),
    row.description,
    Boolean(row.state),
    undefined,
    row.id,
);

export class MovieRepository implements Repository<Movie> {

    async findAll(): Promise<Movie[]> {
        /* the [rows] only take the firts parameter of the return
        its like:
        const result = await db.query...
        const rows = result[0]*/
        const [rows] = await db.query<MovieRow[]>(
            "SELECT id, title, category, views, description, state FROM movies ORDER BY id",
        );
        /*map apply a callback function to every item into the array rows*/
        return rows.map(toMovie);
    }

    async findOne(id: number): Promise<Movie | undefined> {
        /*take the firts parameter*/
        const [rows] = await db.query<MovieRow[]>(
            "SELECT id, title, category, views, description, state FROM movies WHERE id = ?",
            [id],
        );
        /*ternary operators
        try to return a movie or, insted return undefined */
        return rows[0] ? toMovie(rows[0]) : undefined;
    }

    async create(item: Movie): Promise<Movie> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO movies (tittle, category, views, description, state) VALUES (?, ?, ?, ?, ?)",
            [item.tittle, item.category, item.views, item.description, item.state],
        );
        /**it set the id of the movie that inserted into the table of the database*/
        item.id = result.insertId;
        return item;
    }

    async update(id:number,input: Partial<Movie>): Promise<Movie | undefined> {
        const allowedFields = ["tittle", "category", "views", "description", "state"] as const;
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
    
    async delete(id: number): Promise<boolean> {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM movies WHERE id = ?",
            [id],
        );
        /**it return a number in form of a boolean value true or false  */
        return result.affectedRows > 0;
    }
}
