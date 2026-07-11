import { Repository } from "../Shared/repository.js";
import { Movie } from "./movie.entity.js";

/*peliculas.repositorio es el DAO.
Se va a encargar de recuperar las distintas peliculas que tenga guardadas en la BDDS.Tambien se encarga
del comportamiento necesario para reflejar en la BDDS todos los cambios que una peliculas sufra*/

export class MovieRepository implements Repository<Movie>{

    /*Implemento la interfaz generica Repositorio y le indico que va a manejar objetos de tipo pelicula.
    Seguido de eso defio el comportamiento especifico que quiero que tengan todos los metodos que forman 
    parte del contrato de la interfaz */

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
    
    /*i need fix this shit */
    public delete(item: { id:string;}): string | undefined {
        return item.id;
    }
}