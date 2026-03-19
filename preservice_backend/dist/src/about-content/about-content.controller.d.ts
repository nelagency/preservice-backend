import { AboutContentService } from './about-content.service';
import { UpdateAboutContentDto } from './dto/update-about-content.dto';
export declare class AboutContentController {
    private readonly aboutContentService;
    constructor(aboutContentService: AboutContentService);
    getContent(): Promise<(import("mongoose").FlattenMaps<import("./entities/about-content.entity").AboutContentDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }) | import("mongoose").FlattenMaps<import("./entities/about-content.entity").AboutContent & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & {
        createdAt: Date;
        updatedAt: Date;
    } & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    updateContent(dto: UpdateAboutContentDto): Promise<import("mongoose").FlattenMaps<import("./entities/about-content.entity").AboutContentDocument> & Required<{
        _id: import("mongoose").FlattenMaps<unknown>;
    }> & {
        __v: number;
    }>;
}
