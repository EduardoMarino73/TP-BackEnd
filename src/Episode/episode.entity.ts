/**
 * Entity that represents an Episode belonging to a Season.
 * Encapsulates the video file path, author, views, and episode sequencing.
 */
export class Episode {
    constructor(
        // Foreign key referencing the parent season (seasons.id)
        public id_season: number,
        // Sequential episode number within the season (e.g. 1, 2, 3...)
        public episode_number: number,
        // Title of the episode
        public title: string,
        // Detailed synopsis of this episode
        public description: string,
        // Relative file path on the server where the video file is saved (e.g. '/series/1723...mp4')
        public path: string,
        // ID of the user / author who uploaded this episode
        public id_author: number,
        // Total view count counter
        public views: number = 0,
        // Current state of the episode ('active', 'suspended', etc.)
        public state: string = "active",
        // Primary key assigned by the database (auto-incremented)
        public id?: number
    ) {}
}
