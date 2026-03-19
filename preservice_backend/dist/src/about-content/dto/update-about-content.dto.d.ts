declare class AboutSectionDto {
    title: string;
    content: string;
}
export declare class UpdateAboutContentDto {
    vision?: string;
    histoire?: string;
    valeurs?: string[];
    founderImages?: string[];
    sections?: AboutSectionDto[];
}
export {};
