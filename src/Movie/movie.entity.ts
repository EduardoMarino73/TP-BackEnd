import { Report } from "../tipo_reporte/report.entity.js";

//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie {
 
    constructor(
        public tittle:string,
        public category:string,
        public views:BigInteger,
        public description:string,
        public state:boolean, /*---> Maybe a enum is better in this case */
        public report:Report[] = new Array<Report>,
        public id_Movie = crypto.randomUUID()
        ){}
}