import { ReportType } from "../Report_Type/report_type.entity.js";

//object that represents a movie during execution
export class Movie {
 
    constructor(
        public id_author:number,
        public path:string,
        public title:string,
        public category:string,
        public views:number,
        public description:string,
        public state:boolean, /*---> Maybe an enum is better in this case */
        public report?:ReportType[],
        public id?:number
        ){}
}
