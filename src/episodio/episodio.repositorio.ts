import { Repositorio } from "../compartido/repositorio.js";
import { Episodio } from "./episodio.entidad.js";

/*episodio.repositorio es el DAO.
Se va a encargar de buscar o guardar los episodios con los que tenga que trabajar*/

export class EpisodioRepositorio implements Repositorio<Episodio> {

    /*De forma analoga hacemos lo mismo que en el repositorio de peliculas, definiendo el comportamiento 
    especifico de los metodos generales que obtengo del contrato de la interfaz */

    findAll(): Episodio[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Episodio | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Episodio): Episodio | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Episodio): Episodio | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Episodio | undefined {
        throw new Error("Method not implemented.");
    }
    
}