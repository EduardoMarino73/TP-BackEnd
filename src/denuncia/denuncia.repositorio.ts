import { Repositorio } from "../compartido/repositorio.js";
import { Denuncia } from "./denuncia.entidad.js";

export class DenunciaRepositorio implements Repositorio<Denuncia>{
    
    findAll(): Denuncia[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): Denuncia | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: Denuncia): Denuncia | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: Denuncia): Denuncia | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): Denuncia | undefined {
        throw new Error("Method not implemented.");
    }

}