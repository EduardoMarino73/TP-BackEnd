/**
 * Entity that represents a Season of a series during execution.
 * Encapsulates the relationship between the series and its episodic subdivisions.
 */
export class Season {
    constructor(
        // Foreign key referencing the parent series (series.id)
        public id_serie: number,
        // Number of the season (e.g. 1 for Season 1, 2 for Season 2)
        public season_number: number,
        // Synopsis or description of this specific season
        public description: string,
        // Primary key assigned by MySQL (auto-incremented)
        public id?: number
    ) {}
}
