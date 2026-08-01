import { Report_type } from "../Report_Type/report_type.entity.js";

//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie {
 
    constructor(
        public path:string,
        public tittle:string,
        public category:string,
        public views:number,
        public description:string,
        public state:boolean, /*---> Maybe a enum is better in this case */
        public report?:Report_type[],
        public id?:number
        ){}
}
