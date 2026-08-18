import { Movie } from "./movie.entity.js";
import { db } from "../Shared/database/connections.js";
/*is a function that convert a MovieRow into instance of Movie */
const toMovie = (row) => new Movie(row.id_author, row.path, row.tittle, row.category, Number(row.views), row.description, Boolean(row.state), undefined, row.id);
export class MovieRepository {
    async findAll() {
        /* the [rows] only take the firts parameter of the return
        its like:
        const result = await db.query...
        const rows = result[0]*/
        const [rows] = await db.query("SELECT id, id_author, tittle, category, views, description, state FROM movies ORDER BY id");
        /*map apply a callback function to every item into the array rows*/
        return rows.map(toMovie);
    }
    async findOne(id) {
        /*take the firts parameter*/
        const [rows] = await db.query("SELECT id, id_author, tittle, category, views, description, state FROM movies WHERE id = ?", [id]);
        /*ternary operators
        try to return a movie or, insted return undefined */
        return rows[0] ? toMovie(rows[0]) : undefined;
    }
    async create(item) {
        const [result] = await db.execute("INSERT INTO movies (id_author,pathF,tittle, category, views, description, state) VALUES (?, ?, ?, ?, ?, ?,?)", [item.id_author, item.pathF, item.tittle, item.category, item.views, item.description, item.state]);
        /**it set the id of the movie that inserted into the table of the database*/
        item.id = result.insertId;
        return item;
    }
    async update(id, input) {
        const allowedFields = ["tittle", "category", "views", "description", "state"];
        const fields = allowedFields.filter((field) => input[field] !== undefined);
        if (fields.length === 0)
            return this.findOne(id);
        /**it build a dinamic query with map giving a callback and appending it into a string with
         * join method
         */
        const assignments = fields.map((field) => `${field} = ?`).join(", ");
        /**and it build the query´s parameter part for execute method casting the input into correct type */
        const values = fields.map((field) => input[field]);
        await db.execute(`UPDATE movies SET ${assignments} WHERE id = ?`, [...values, id]);
        return this.findOne(id);
    }
    async delete(id) {
        const [result] = await db.execute("DELETE FROM movies WHERE id = ?", [id]);
        /**it return a number in form of a boolean value true or false  */
        return result.affectedRows > 0;
    }
}
//# sourceMappingURL=movie.repository.js.map