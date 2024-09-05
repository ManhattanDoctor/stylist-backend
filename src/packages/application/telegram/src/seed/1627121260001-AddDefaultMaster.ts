import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserAccountEntity, UserEntity, UserMasterEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserAccountType, UserMasterLevel, UserMasterSkill, UserResource, UserStatus } from '@project/common/user';
import { LoginUtil } from '@project/common/login';
import { RandomUtil, ValidateUtil } from '@ts-core/common';
import { ShareUtil } from '@project/common/util';
import * as _ from 'lodash';

export class AddDefaultMaster1627121260000 implements MigrationInterface {

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    public static createMaster(name: string, isMale: boolean, picture: string, role: string, manner: string): UserEntity {
        let item = new UserEntity();
        item.login = LoginUtil.createLogin(`${RandomUtil.randomNumber(0, 10000)}`, UserResource.GOOGLE);
        item.status = UserStatus.ACTIVE;
        item.resource = UserResource.GOOGLE;

        let account = (item.account = new UserAccountEntity());
        account.type = UserAccountType.MASTER;

        let preferences = (item.preferences = new UserPreferencesEntity());
        preferences.name = name;
        preferences.isMale = isMale;
        preferences.birthday = new Date();
        preferences.picture = picture;

        let master = item.master = new UserMasterEntity();
        master.voice = `1_voice`;
        master.level = UserMasterLevel.MASTER;
        master.skills = [UserMasterSkill.ART];
        master.status = 'Модельер, кутюрье и стилист';
        master.photos = [
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_0.jpg`,
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_1.jpg`,
            `${ShareUtil.ASSETS_URL}/image/master/1/photo_2.jpg`,
        ];

        master.role = role;
        master.manner = manner;
        master.biography = `${name}`;

        master.video = `${ShareUtil.ASSETS_URL}/image/master/1/video.mp4`;
        master.videoSmall = `${ShareUtil.ASSETS_URL}/image/master/1/video_small.mp4`;
        master.picture = `${ShareUtil.ASSETS_URL}/image/master/1/picture.jpg`;
        master.pictureSmall = `${ShareUtil.ASSETS_URL}/image/master/1/picture_small.jpg`;
        master.pictureAnimated = `${ShareUtil.ASSETS_URL}/image/master/1/picture_animated.gif`;
        master.pictureAnimatedSmall = `${ShareUtil.ASSETS_URL}/image/master/1/picture_animated_small.gif`;

        ValidateUtil.validate(item);
        return item;
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async up(queryRunner: QueryRunner): Promise<any> {
        let repository = queryRunner.connection.getRepository(UserEntity);

        await repository.save(AddDefaultMaster1627121260000.createMaster('Кокоша (добрая)', false, 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Karl_Lagerfeld_2014.jpg', 'Ты добрая и благостная женщина. Ты дизайнер одежды и стилист.', 'Пиши в добром и заботливом тоне. Однако, если человек выглядит откровенно плохо и у него плохой стиль, то напиши об этом и приободри его.'));
        await repository.save(AddDefaultMaster1627121260000.createMaster('Железный Карл (злая)', true, 'https://upload.wikimedia.org/wikipedia/commons/2/22/Coco_Chanel_in_Los_Angeles%2C_1931_%28cropped%29.jpg', 'Ты злобный и ворчливый старик. Ты дизайнер одежды и стилист.', 'Пиши в злобном, недовольном и истеричном тоне. Однако, если человек выглядит откровенно хорошо и у него хороший стиль, то напиши об этом, но сдержано.'));
        await repository.save(AddDefaultMaster1627121260000.createMaster('Слава (объективный)', true, 'https://upload.wikimedia.org/wikipedia/commons/8/86/RalphLauren.jpg', 'Ты доброжелательный и вежливый мужчина. Ты модельер, дизайнер одежды, стилист и кутюрье.', 'Пиши в корректном и тактичном тоне. Однако, если человек выглядит откровенно плохо и у него плохой стиль, то напиши об этом ничего не приукрашивая и без любезностей.'));
    }

    public async down(queryRunner: QueryRunner): Promise<any> { }
}
