import { ObjectId } from "mongodb";
import { db } from "../Shared/database/connections.js";
/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/
const movieCollection = db.collection('movie');
export class MovieRepository {
    async findAll() {
        return await movieCollection.find().toArray();
    }
    async findOne(item) {
        const a = new ObjectId(item.id);
        console.log("the repository take the id and cast into a ObjectId");
        console.log(a);
        return await movieCollection.findOne({ _id: a });
    }
    async create(item) {
        movieCollection.insertOne(item);
        return;
    }
    async update(id, input) {
        console.log("Data from movie.service");
        console.log(id);
        console.log(input);
        return await movieCollection.findOneAndUpdate({ _id: id }, { $set: input }, { returnDocument: "after" }) ?? undefined;
    }
    async delete(item) {
        movieCollection.deleteOne({ _id: new ObjectId(item.id) });
        return {
            _id: new ObjectId(item.id),
        };
    }
}
//# sourceMappingURL=movie.repository.js.map