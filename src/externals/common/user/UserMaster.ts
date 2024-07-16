import * as _ from 'lodash';

export class UserMaster {
    level: UserMasterLevel;
    voice: string;
    status: string;
    photos: Array<string>;
    skills: Array<UserMasterSkill>;
    biography: string;

    role: string;
    manner: string;

    video: string;
    videoSmall: string;

    picture: string;
    pictureSmall: string;
    
    pictureAnimated: string;
    pictureAnimatedSmall: string;
}
export enum UserMasterSkill {
    ART = 'ART'
}
export enum UserMasterLevel {
    MASTER = 'MASTER',
    BEGINNER = 'BEGINNER',
    ADVANCED = 'ADVANCED',
}
