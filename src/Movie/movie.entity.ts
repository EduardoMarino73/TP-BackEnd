import { Report_type } from "../Report_Type/report_type.entity.js";

//Movie Object
export class Movie {
 
    constructor(
        public id_author:bigint,
        public pathF:string,
        public tittle:string,
        public category:string,
        public views:number,
        public description:string,
        public state:boolean, /*---> Maybe a enum is better in this case */
        public report?:Report_type[],
        public id?:number
        ){}
}
