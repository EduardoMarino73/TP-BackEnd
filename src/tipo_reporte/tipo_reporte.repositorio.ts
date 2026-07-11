import { Repositorio } from "../compartido/repositorio.js";
import { TipoReporte } from "./tipo_reporte.entidad.js";

export class TipoReporteRepositorio implements Repositorio<TipoReporte>{
    findAll(): TipoReporte[] | undefined {
        throw new Error("Method not implemented.");
    }
    findOne(item: { id: string; }): TipoReporte | undefined {
        throw new Error("Method not implemented.");
    }
    add(item: TipoReporte): TipoReporte | undefined {
        throw new Error("Method not implemented.");
    }
    update(item: TipoReporte): TipoReporte | undefined {
        throw new Error("Method not implemented.");
    }
    delete(item: { id: string; }): TipoReporte | undefined {
        throw new Error("Method not implemented.");
    }

}