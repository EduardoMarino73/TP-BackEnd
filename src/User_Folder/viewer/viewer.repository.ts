import { orm } from "../../Shared/database/connections.js";
import { AppealRepository } from "../../Appeal/appeal.repository.js";
import { EpisodeRepository } from "../../Episode/episode.repository.js";
import { MovieRepository } from "../../Movie/movie.repository.js";
import { ComplaintRepository } from "../../Report/complaint.repository.js";
import { ReviewRepository } from "../../Review/review.repository.js";
import { Viewer } from "./viewer.entity.js";
import { ModerationCaseSummary } from "../../Report/complaint.entity.js";

/** Loads viewer account and engagement data. */
export class ViewerRepository {
    private readonly movies = new MovieRepository();
    private readonly episodes = new EpisodeRepository();
    private readonly reviews = new ReviewRepository();
    private readonly reports = new ComplaintRepository();
    private readonly appeals = new AppealRepository();

    /** Returns a viewer with its uploaded movies, episodes, and reviews. */
    async findOne(id: number): Promise<Viewer | undefined> {
        // loading the Viewer subclass only matches users whose role is 'viewer'
        const viewer = await orm.em.findOne(Viewer, id);
        if (!viewer) return undefined;

        const movies = await this.movies.findByAuthor(id);
        const episodes = await this.episodes.findByAuthor(id);
        viewer.uploadedAudiovisuals = [...movies, ...episodes];
        viewer.reviews = await this.reviews.findByViewer(id);
        viewer.reportsReceivedCount = await this.reports.countReceivedByViewer(id);
        viewer.appeals = await this.appeals.findByViewer(id);
        return viewer;
    }

    /** Moderation cases about content this viewer uploaded, newest first. */
    findReports(id: number): Promise<ModerationCaseSummary[]> {
        return this.reports.findCases({ ownerId: id });
    }
}
