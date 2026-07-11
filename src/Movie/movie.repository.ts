import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";

/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/

export class MovieRepository implements Repository<Movie>{

    findAll(): Movie[] | undefined {
        return
    }

    findOne(item: { id: string; }): Movie | undefined {
        return
    }

    add(item: Movie): Movie | undefined {
        return
    }

    update(item: Movie): Movie | undefined {
        return
    }
    
    public delete(item:{ id:string;}): {id:string} | undefined {
        return item;
    }
}