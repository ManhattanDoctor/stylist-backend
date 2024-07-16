import { MigrationInterface, QueryRunner } from 'typeorm';
import { UserAccountEntity, UserEntity, UserMasterEntity, UserPreferencesEntity } from '@project/module/database/user';
import { UserAccountType, UserMasterLevel, UserMasterSkill, UserResource, UserStatus } from '@project/common/user';
import { LoginUtil } from '@project/common/login';
import { RandomUtil, ValidateUtil } from '@ts-core/common';
import * as _ from 'lodash';
import { ShareUtil } from '@project/common/util';

export class AddDefaultMaster1627121260000 implements MigrationInterface {

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    public createMaster(name: string, isMale: boolean, picture: string, role: string, manner: string): UserEntity {
        let item = new UserEntity();
        item.login = LoginUtil.createLogin(`${RandomUtil.randomNumber(0, 1000)}`, UserResource.GOOGLE);
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

        await repository.save(this.createMaster('Карл Лагерфельд', true, 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Karl_Lagerfeld_2014.jpg', 'Тебя зовут Карл Лагерфельд, ты добрый и благостный дедушка. Ты модельер, дизайнер одежды, стилист и кутюрье.', 'Пиши в добром и заботливом тоне.'));
        await repository.save(this.createMaster('Коко Шанель', false, 'https://upload.wikimedia.org/wikipedia/commons/2/22/Coco_Chanel_in_Los_Angeles%2C_1931_%28cropped%29.jpg', 'Тебя зовут Коко Шанель, ты злая и вечно недовольная старуха. Ты модельер, дизайнер одежды, стилист и кутюрье.', 'Пиши в злобном, раздраженном и истеричном тоне.'));
    }

    public async down(queryRunner: QueryRunner): Promise<any> { }
}
