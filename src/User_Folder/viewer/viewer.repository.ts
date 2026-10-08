import { Audiovisual } from "../../Audiovisual/audiovisual.entity.js";
import { AppealRepository } from "../../Appeal/appeal.repository.js";
import { EpisodeRepository } from "../../Episode/episode.repository.js";
import { MovieRepository } from "../../Movie/movie.repository.js";
import { ComplaintRepository } from "../../Report/complaint.repository.js";
import { ReviewRepository } from "../../Review/review.repository.js";
import { UserRepository } from "../user.repository.js";
import { Viewer } from "./viewer.entity.js";

/** Loads viewer account and engagement data from the current database schema. */
export class ViewerRepository {
    private readonly users = new UserRepository();
    private readonly movies = new MovieRepository();
    private readonly episodes = new EpisodeRepository();
    private readonly reviews = new ReviewRepository();
    private readonly reports = new ComplaintRepository();
    private readonly appeals = new AppealRepository();

    /** Returns a viewer with its uploaded movies, episodes, and reviews. */
    async findOne(id: number): Promise<Viewer | undefined> {
        const user = await this.users.findById(id);
        if (!user || user.role !== "viewer") return undefined;

        const [movies, episodes, reviews, reportsReceivedCount, appeals] = await Promise.all([
            this.movies.findByAuthor(id),
            this.episodes.findByAuthor(id),
            this.reviews.findByViewer(id),
            this.reports.countReceivedByViewer(id),
            this.appeals.findByViewer(id),
        ]);
        const uploadedAudiovisuals: Audiovisual[] = [...movies, ...episodes];

        return new Viewer(
            user.id_user,
            user.user_name,
            user.first_name,
            user.last_name,
            user.email,
            user.active,
            reportsReceivedCount,
            appeals,
            uploadedAudiovisuals,
            reviews,
        );
    }
}
