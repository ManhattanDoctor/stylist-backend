import { Injectable } from '@nestjs/common';
import { ProjectName } from '@project/common';
import { LoginUtil } from '@project/common/login';
import { UserAccountType, UserMasterLevel, UserMasterSkill, UserResource, UserStatus } from '@project/common/user';
import { ShareUtil, UserUtil } from '@project/common/util';
import { DatabaseService } from '@project/module/database/service';
import { UserAccountEntity, UserEntity, UserMasterEntity, UserPreferencesEntity } from '@project/module/database/user';
import { LocaleGetCommand } from '@project/module/locale/transport';
import { AiMeanCommand } from '@project/module/ai/transport';
import { Logger, LoggerWrapper, Transport, RandomUtil, ValidateUtil } from '@ts-core/common';
import * as _ from 'lodash';

@Injectable()
export class InitializeService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        // console.log(await this.transport.sendListen(new AiMeanCommand({ userId: 2, project: ProjectName.BOT, pictures: ['https://api.telegram.org/file/bot7453863930:AAETwizYyWKF-MDKXOEcvAxssmNqs2aQG_o/photos/file_1.jpg'] })));

        let item = new UserEntity();
        item.login = LoginUtil.createLogin(`${RandomUtil.randomNumber(0, 1000)}`, UserResource.GOOGLE);
        item.status = UserStatus.ACTIVE;
        item.resource = UserResource.GOOGLE;

        let account = (item.account = new UserAccountEntity());
        account.type = UserAccountType.MASTER;

        let preferences = (item.preferences = new UserPreferencesEntity());
        preferences.name = 'Карл Лагерфельд';
        preferences.email = 'carl.lagerfeld@gmail.com';
        preferences.locale = 'ru';
        preferences.isMale = true;
        preferences.birthday = new Date();
        preferences.picture = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Karl_Lagerfeld_2014.jpg';
        preferences.description = 'Administrator';

        let master = item.master = new UserMasterEntity();
        master.voice = `1_voice`;
        master.level = UserMasterLevel.MASTER;
        master.skills = [UserMasterSkill.ART];
        master.status = 'Немецкий модельер, фотограф, коллекционер и издатель.';
        master.photos = [
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_0.jpg`,
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_1.jpg`,
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_2.jpg`,
        ];

        master.role = 'Тебя зовут Карл Лагерфельд. Ты модельер, дизайнер одежды, стились и кутюрье.';
        master.manner = 'Пиши в добром, заботливом тоне, как будто ты заботливый отец.';
        master.biography = 'Карл Лагерфельд родился 10 сентября 1933 года в Гамбурге в семье крупного предпринимателя, владельца фабрики по производству сгущённого молока Отто Лагерфельда.';

        master.video = `${ShareUtil.ASSETS_URL}/image/master/1/video.mp4`;
        master.videoSmall = `${ShareUtil.ASSETS_URL}/image/master/1/video_small.mp4`;
        master.picture = `${ShareUtil.ASSETS_URL}/image/master/1/picture.jpg`;
        master.pictureSmall = `${ShareUtil.ASSETS_URL}/image/master/1/picture_small.jpg`;
        master.pictureAnimated = `${ShareUtil.ASSETS_URL}/image/master/1/picture_animated.gif`;
        master.pictureAnimatedSmall = `${ShareUtil.ASSETS_URL}/image/master/1/picture_animated_small.gif`;

        // await ValidateUtil.validate(item);
        // await UserEntity.save(item);
        // console.log(UserUtil.isUser('user_3'));

        // console.log(await this.transport.sendListen(new LocaleGetCommand({ key: 'messenger.description', project: ProjectName.BOT })));
    }
}
