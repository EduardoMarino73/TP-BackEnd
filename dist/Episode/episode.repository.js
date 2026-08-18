import { db } from "../Shared/database/connections.js";
import { Episode } from "./episode.entity.js";
const toEpisode = (row) => new Episode(row.id_author, row.path, row.tittle, Number(row.views), row.description, Boolean(row.state), row.id_Season, row.report, row.id_Episode);
export class EpisodieRepository {
    /*De forma analoga hacemos lo mismo que en el repositorio de peliculas, definiendo el comportamiento
    especifico de los metodos generales que obtengo del contrato de la interfaz */
    async findAll() {
        const [rows] = await db.query("SELECT id_Episode, id_author, tittle, views, description, state FROM episodes ORDER BY id_Episode");
        return rows.map(toEpisode);
    }
    async findOne(id) {
        const [rows] = await db.query("SELECT id_Episode, id_author, tittle, views, description, state FROM episodes where id_Episode = ?", [id]);
        return rows[0] ? toEpisode(rows[0]) : undefined;
    }
    async create(item) {
        const [result] = await db.execute("INSERT INTO episodes (id_author, pathF, tittle, views, description, state, id_Season) VALUES (?, ?, ?, ?, ?, ?, ?)", [item.id_author, item.pathF, item.tittle, item.views, item.description, item.state, item.id_Season]);
        item.id_Episode = result.insertId;
        return item;
    }
    async update(id, input) {
        throw new Error("Method not implemented.");
    }
    async delete(id) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=episode.repository.js.map