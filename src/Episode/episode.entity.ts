import { Report_type } from "../Report_Type/report_type.entity.js";

/*Objeto que me representa a un episodio durante la ejecucion */
export class Episode {

    constructor(
        public id_author:bigint,
        public pathF:string,
        public tittle:string,
        public views:number,
        public description:string,
        public state:boolean,
        public id_Season:number,
        public report?:Report_type[],
        public id_Episode?:number
    ){}
}