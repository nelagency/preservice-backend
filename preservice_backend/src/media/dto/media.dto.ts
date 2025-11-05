import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MediaKind, UploaderRole } from '../entities/media-asset.entity';

export class RequestR2PresignDto {
    @ApiProperty() @IsString() filename: string;
    @ApiProperty() @IsString() contentType: string; // ex: image/jpeg
    @ApiPropertyOptional() @IsOptional() @IsMongoId() eventId?: string;
    @ApiPropertyOptional() @IsOptional() @IsEnum(UploaderRole) uploaderRole?: UploaderRole;
}

export class FinalizeR2UploadDto {
    @ApiProperty() @IsString() key: string;
    @ApiProperty({ enum: MediaKind }) @IsEnum(MediaKind) kind: MediaKind;
    @ApiPropertyOptional() @IsOptional() @IsMongoId() eventId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() filename?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() contentType?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) size?: number;
    @ApiPropertyOptional() @IsOptional() @IsDateString() takenAt?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() caption?: string;
    @ApiPropertyOptional() @IsOptional() width?: number;
    @ApiPropertyOptional() @IsOptional() height?: number;
    @ApiPropertyOptional() @IsOptional() @IsMongoId() uploaderId?: string;
    @ApiPropertyOptional() @IsOptional() @IsEnum(UploaderRole) uploaderRole?: UploaderRole;
}

export class CreateStreamDirectUploadDto {
    @ApiPropertyOptional() @IsOptional() @IsMongoId() eventId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() filename?: string;
    @ApiPropertyOptional() @IsOptional() @IsEnum(UploaderRole) uploaderRole?: UploaderRole;
}

export class FinalizeStreamUploadDto {
    @ApiProperty() @IsString() uid: string; // UID renvoyé par Stream
    @ApiPropertyOptional() @IsOptional() @IsMongoId() eventId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() caption?: string;
    @ApiPropertyOptional() @IsOptional() @IsDateString() takenAt?: string;
    @ApiPropertyOptional() @IsOptional() @IsNumber() duration?: number;
    @ApiPropertyOptional() @IsOptional() @IsMongoId() uploaderId?: string;
}

export class ApproveMediaDto {
    @ApiProperty() @IsBoolean() approved: boolean;
}

export class CreateBeforeAfterDto {
    @ApiProperty() @IsMongoId() eventId: string;
    @ApiProperty() @IsMongoId() beforeId: string;
    @ApiProperty() @IsMongoId() afterId: string;
    @ApiPropertyOptional() @IsOptional() @IsString() caption?: string;
}