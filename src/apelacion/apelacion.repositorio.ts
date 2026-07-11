import { Repositorio } from "../compartido/repositorio.js";
import { Apelacion } from "./apelacion.entidad.js";

export class ApelacionRepositorio implements Repositorio<Apelacion>{
    
    findAll(): Apelacion[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Apelacion | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Apelacion): Apelacion | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Apelacion): Apelacion | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Apelacion | undefined {
        throw new Error("Method not implemented.");
    }

}