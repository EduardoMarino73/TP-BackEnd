/**
 * Entity that represents a TV Show / Serie during execution.
 * It encapsulates the basic properties of a series and its author.
 */
export class Serie {
    constructor(
        // ID of the user (creator/author) who created this series
        public id_author: number,
        // Title of the series
        public title: string,
        // Category or genre (e.g. Action, Drama, Sci-Fi)
        public category: string,
        // Detailed synopsis or description of the series
        public description: string,
        // Current status (e.g. 'active', 'suspended', etc.)
        public state: boolean | string = "active",
        // Primary key assigned by the database (auto-incremented)
        public id?: number
    ) {}
}
