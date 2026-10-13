import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Serie } from "../Series/series.entity.js";

/**
 * Entity that represents a Season of a series, mapped to the seasons table.
 * Encapsulates the relationship between the series and its episodic subdivisions.
 */
@Entity({ tableName: "seasons" })
export class Season {
    // Primary key assigned by MySQL (auto-incremented)
    @PrimaryKey()
    id?: number;

    // The parent series, kept as its id (seasons.id_serie)
    @ManyToOne(() => Serie, { fieldName: "id_serie", mapToPk: true })
    id_serie: number;

    // Number of the season (e.g. 1 for Season 1, 2 for Season 2)
    @Property({ type: "integer" })
    season_number: number;

    // Synopsis or description of this specific season
    @Property({ type: "text", nullable: true })
    description: string;

    // 'active' or 'deleted' (logical delete); not sent in responses
    @Property({ hidden: true })
    state = "active";

    constructor(id_serie: number, season_number: number, description: string) {
        this.id_serie = id_serie;
        this.season_number = season_number;
        this.description = description;
    }
}
