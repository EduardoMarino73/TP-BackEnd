import { Entity, Property } from "@mikro-orm/core";
import { Appeal } from "../../Appeal/appeal.entity.js";
import { Audiovisual } from "../../Audiovisual/audiovisual.entity.js";
import { Review } from "../../Review/review.entity.js";
import { User } from "../user.entity.js";

/**
 * Viewer account and the engagement data associated with that viewer.
 * The engagement fields are not columns (persist: false): ViewerRepository fills them
 * when it loads a profile.
 */
@Entity({ discriminatorValue: "viewer" })
export class Viewer extends User {
    @Property({ persist: false, type: "integer" })
    reportsReceivedCount?: number;

    @Property({ persist: false, type: "json" })
    appeals?: Appeal[];

    @Property({ persist: false, type: "json" })
    uploadedAudiovisuals?: Audiovisual[];

    @Property({ persist: false, type: "json" })
    reviews?: Review[];

    constructor(
        user_name: string,
        first_name: string,
        last_name: string,
        email: string,
        password_hash?: string,
    ) {
        super(user_name, first_name, last_name, email, "viewer", password_hash);
    }
}
