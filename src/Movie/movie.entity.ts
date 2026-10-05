import { Report_type } from "../Report_Type/report_type.entity.js";
import { Audiovisual } from "../Audiovisual/audiovisual.entity.js";

//objeto que me va a representar a una pelicula durante la ejecucion
export class Movie extends Audiovisual {
    constructor(
        id_author:number,
        public path:string,
        title:string,
        category:string,
        views:number,
        description:string,
        state:string,
        public report?:Report_type[],
        id?:number
    ) {
        super(title, category, views, description, id_author, state, id);
    }
}
