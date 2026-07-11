import { Repositorio } from "../../compartido/repositorio.js";
import { Administrador } from "./administrador.entidad.js";

export class AdministradorRepositorio implements Repositorio<Administrador>{
    
    findAll(): Administrador[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Administrador | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Administrador): Administrador | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Administrador): Administrador | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Administrador | undefined {
        throw new Error("Method not implemented.");
    }

}