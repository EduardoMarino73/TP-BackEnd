import { Filter, ObjectId } from "mongodb";
import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";
import { db } from "../Shared/database/connections.js";

/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/

const movieCollection  = db.collection<Movie>('movie')

export class MovieRepository implements Repository<Movie>{

    async findAll(): Promise<Movie[] | undefined> {
        return await movieCollection.find().toArray();
    }

    async findOne(item: { id: string; }): Promise<Movie | undefined> {
        const a = new ObjectId(item.id);
        console.log("the repository take the id and cast into a ObjectId");
        console.log(a);
        return await movieCollection.findOne({_id: a}) as Movie
    }

    async create(item: Movie): Promise<Movie | undefined> {
        movieCollection.insertOne(item)
        return
    }

    async update(id:ObjectId,input: Movie): Promise<Movie | undefined> {
        console.log("Data from movie.service");
        console.log(id);
        console.log(input);
        return await movieCollection.findOneAndUpdate({_id: id},{$set: input},{returnDocument: "after"}) ?? undefined;
    }
    
    async delete(item:{ id:string;}): Promise<{_id:ObjectId} | undefined> {
        movieCollection.deleteOne({_id: new ObjectId(item.id)})
        return {
        _id: new ObjectId(item.id),
        };
    }
}