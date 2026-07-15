import { ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";
import { db } from "../Shared/database/connections.js";

/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/

const movieCollection  = db.collection<Movie>('peliculas')

export class MovieRepository implements Repository<Movie>{

    async findAll(): Promise<Movie[] | undefined> {
        return await movieCollection.find().toArray();
    }

    async findOne(item: { id: string; }): Promise<Movie | undefined> {
        const a = new ObjectId(item.id)
        return await movieCollection.findOne({_id_Movie: a}) as Movie
    }

    async add(item: Movie): Promise<Movie | undefined> {
        return
    }

    async update(item: Movie): Promise<Movie | undefined> {
        return
    }
    
    async delete(item:{ id:string;}): Promise<{_id:ObjectId} | undefined> {
        return {
        _id: new ObjectId(item.id),
        };
    }
}