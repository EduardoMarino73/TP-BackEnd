import { Report } from "../tipo_reporte/report.entidad.ts";

//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie {
 
    constructor(
        public tittle:string,
        public category:string,
        public views:BigInteger,
        public description:string,
        public report:Report[],
        public state:Boolean, /*---> Maybe a enum is better in this case */
        public id_Movie = crypto.randomUUID()
        ){}
}