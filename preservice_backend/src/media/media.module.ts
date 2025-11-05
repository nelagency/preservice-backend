import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from './entities/media-asset.entity';
import { BeforeAfterPair, BeforeAfterPairSchema } from './entities/before-after.entity';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { R2Service } from './r2.service';
import { StreamService } from './stream.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MediaAsset.name, schema: MediaAssetSchema },
            { name: BeforeAfterPair.name, schema: BeforeAfterPairSchema },
        ])
    ],
    controllers: [MediaController],
    providers: [MediaService, R2Service, StreamService],
    exports: [MediaService],
})
export class MediaModule { }