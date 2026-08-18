import { Repository } from "../Shared/repository.js";
import { db } from "../Shared/database/connections.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { Episode } from "./episode.entity.js";

/*episodio.repositorio es el DAO.
Se va a encargar de buscar o guardar los episodios con los que tenga que trabajar*/

type EpisodeRow = RowDataPacket & {
    id_author:bigint;
    pathF:string;
    tittle:string;
    views:bigint;
    description:string;
    state:boolean;
    report:Report[];
    id_Episode:number;
    id_Season:number;
    
};

const toEpisode = (row: EpisodeRow): Episode => new Episode(
    row.id_author,
    row.path,
    row.tittle,
    Number(row.views),
    row.description,
    Boolean(row.state),
    row.id_Season,
    row.report,
    row.id_Episode,
    
);

export class EpisodieRepository implements Repository<Episode> {

    /*De forma analoga hacemos lo mismo que en el repositorio de peliculas, definiendo el comportamiento 
    especifico de los metodos generales que obtengo del contrato de la interfaz */

    async findAll(): Promise<Episode[] | undefined> {
        const [rows] = await db.query<EpisodeRow[]>(
                    "SELECT id_Episode, id_author, tittle, views, description, state FROM episodes ORDER BY id_Episode",
                );
        return rows.map(toEpisode);
    }

    async findOne(id: number): Promise<Episode | undefined> {
        const [rows] = await db.query<EpisodeRow[]>(
                    "SELECT id_Episode, id_author, tittle, views, description, state FROM episodes where id_Episode = ?",
                    [id]
                );
        return rows[0] ? toEpisode(rows[0]) : undefined;
    }

    async create(item: Episode): Promise<Episode> {
        const [result] = await db.execute<ResultSetHeader>(
            "INSERT INTO episodes (id_author, pathF, tittle, views, description, state, id_Season) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [item.id_author, item.pathF, item.tittle, item.views, item.description, item.state, item.id_Season],
        );
        item.id_Episode = result.insertId;
        return item;
    }

    async update(id: number, input: Partial<Episode>): Promise<Episode | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
}
