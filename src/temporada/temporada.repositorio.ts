import { Repositorio } from "../compartido/repositorio.js";
import { Temporada } from "./temporada.entidad.js";

export class TemporadaRepositorio implements Repositorio<Temporada> {
    
    findAll(): Temporada[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Temporada | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Temporada): Temporada | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Temporada): Temporada | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Temporada | undefined {
        throw new Error("Method not implemented.");
    }

}