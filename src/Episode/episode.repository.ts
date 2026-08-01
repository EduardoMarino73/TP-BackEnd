import { Repository } from "../Shared/repository.js";
import { Episodie } from "./episode.entity.js";

/*episodio.repositorio es el DAO.
Se va a encargar de buscar o guardar los episodios con los que tenga que trabajar*/

export class EpisodieRepository implements Repository<Episodie> {

    /*De forma analoga hacemos lo mismo que en el repositorio de peliculas, definiendo el comportamiento 
    especifico de los metodos generales que obtengo del contrato de la interfaz */

    async findAll(): Promise<Episodie[]> {
        throw new Error("Method not implemented.");
    }
    async findOne(id: number): Promise<Episodie | undefined> {
        throw new Error("Method not implemented.");
    }
    async create(item: Episodie): Promise<Episodie> {
        throw new Error("Method not implemented.");
    }
    async update(id: number, input: Partial<Episodie>): Promise<Episodie | undefined> {
        throw new Error("Method not implemented.");
    }
    async delete(id: number): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    
}
