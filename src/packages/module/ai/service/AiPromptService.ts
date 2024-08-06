
import { Injectable } from '@nestjs/common';
import { User, UserMasterLevel } from '@project/common/user';
import { Transport, Logger, LoggerWrapper } from '@ts-core/common';
import { ParseUtil } from '@project/common/util';
import * as _ from 'lodash';
import { LanguageProjects } from '@ts-core/language';

@Injectable()
export class AiPromptService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private language: LanguageProjects) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Message Methods
    //
    // --------------------------------------------------------------------------

    private getTask(project: string, user: User, master: User, translation: any): string {
        return this.language.translate('prompt.tarot.spread.meaning.task', translation, project);
    }

    private getExample(project: string, user: User, master: User, translation: any): string {
        return this.language.translate('prompt.tarot.spread.meaning.example', translation, project);
    }

    private getRole(project: string, user: User, master: User, translation: any): string {
        return master.master.role;
    }

    private getManner(project: string, user: User, master: User, translation: any): string {
        return master?.master?.manner;
    }

    private getContext(project: string, user: User, master: User, translation: any): string {
        return this.language.translate('prompt.tarot.spread.meaning.context', translation, project);
    }

    // --------------------------------------------------------------------------
    //
    //  Private Methods
    //
    // --------------------------------------------------------------------------

    private getModel(master: User): IModel {
        let isBestModel = this.isNeedBestModel(master);
        let name = isBestModel ? 'gpt-4o' : 'gpt-4o';
        let maxWords = isBestModel ? 300 : 200;
        return { name, maxWords };
    }

    private isNeedBestModel(master: User): boolean {
        switch (master.master?.level) {
            case UserMasterLevel.MASTER:
            case UserMasterLevel.ADVANCED:
                return true;
        }
        return true;
    }

    // --------------------------------------------------------------------------
    //
    //  Mean Methods
    //
    // --------------------------------------------------------------------------

    public async getPrompt(project: string, user: User, master: User, pictures: Array<string>): Promise<IPrompt> {
        let model = this.getModel(master);

        let translation = {
            maxWords: model.maxWords,
            userName: ParseUtil.userName(user),
            userIsMale: user.preferences.isMale,
        }

        let role = this.getRole(project, user, master, translation);
        let task = this.getTask(project, user, master, translation);
        let manner = this.getManner(project, user, master, translation);
        let example = this.getExample(project, user, master, translation);
        let context = this.getContext(project, user, master, translation);

        return { model: model.name, user: removeTags(`${task} ${example} ${manner}`), system: removeTags(`${role} ${context}`), role, task, manner, example, context, pictures };
    }
}

function removeTags(item: string): string {
    if (_.isEmpty(item)) {
        return item;
    }
    item = item.replace(/<br\s*[\/]?>/g, '\n');
    item = item.replace(/<[^>]*>/g, '');
    return item;
}

interface IModel {
    name: string;
    maxWords: number;
}

export interface IPrompt {
    user: string;
    system: string;

    model: string;

    role: string;
    task: string;
    manner: string;
    example: string;
    context: string;
    pictures: Array<string>;
}