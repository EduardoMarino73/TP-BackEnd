import { ObjectId } from "mongodb";
import { db } from "../Shared/database/connections.js";
/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/
const movieCollection = db.collection('peliculas');
export class MovieRepository {
    async findAll() {
        return await movieCollection.find().toArray();
    }
    async findOne(item) {
        const a = new ObjectId(item.id);
        return await movieCollection.findOne({ _id_Movie: a });
    }
    async add(item) {
        return;
    }
    async update(item) {
        return;
    }
    async delete(item) {
        return {
            _id: new ObjectId(item.id),
        };
    }
}
//# sourceMappingURL=movie.repository.js.map