import { Appeal } from "../../Appeal/appeal.entity.js";
import { Audiovisual } from "../../Audiovisual/audiovisual.entity.js";
import { Review } from "../../Review/review.entity.js";
import { User } from "../user.entity.js";

/** Viewer account and the engagement data associated with that viewer. */
export class Viewer extends User {
    public reportsReceivedCount: number;
    public appeals: Appeal[];
    public uploadedAudiovisuals: Audiovisual[];
    public reviews: Review[];

    constructor(
        id_user: number,
        user_name: string,
        first_name: string,
        last_name: string,
        email: string,
        active: boolean,
        reportsReceivedCount: number = 0,
        appeals: Appeal[] = [],
        uploadedAudiovisuals: Audiovisual[] = [],
        reviews: Review[] = [],
    ) {
        super(id_user, user_name, first_name, last_name, email, "viewer", active);
        this.reportsReceivedCount = reportsReceivedCount;
        this.appeals = appeals;
        this.uploadedAudiovisuals = uploadedAudiovisuals;
        this.reviews = reviews;
    }
}
