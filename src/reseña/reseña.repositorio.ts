import { Repositorio } from "../compartido/repositorio.js";
import { Reseña } from "./reseña.entidad.js";

export class ReseñaRepositorio implements Repositorio<Reseña>{
    
    findAll(): Reseña[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Reseña | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Reseña): Reseña | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Reseña): Reseña | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Reseña | undefined {
        throw new Error("Method not implemented.");
    }
} 