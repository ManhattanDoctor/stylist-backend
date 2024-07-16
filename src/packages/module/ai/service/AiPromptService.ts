
import { Injectable } from '@nestjs/common';
import { User, UserMasterLevel } from '@project/common/user';
import { Transport, Logger, LoggerWrapper } from '@ts-core/common';
import { ParseUtil } from '@project/common/util';
import { LocaleGetCommand } from '@project/module/locale/transport';
import * as _ from 'lodash';

@Injectable()
export class AiPromptService extends LoggerWrapper {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Message Methods
    //
    // --------------------------------------------------------------------------

    private async getTask(project: string, user: User, master: User, translation: any): Promise<string> {
        return this.translate(project, 'prompt.tarot.spread.meaning.task', translation);
    }

    private async getExample(project: string, user: User, master: User, translation: any): Promise<string> {
        return this.translate(project, 'prompt.tarot.spread.meaning.example', translation);
    }

    private async getRole(project: string, user: User, master: User, translation: any): Promise<string> {
        let role = master?.master?.role;
        return !_.isNil(role) ? role : this.translate(project, 'prompt.tarot.spread.meaning.role', translation);
    }

    private async getManner(project: string, user: User, master: User, translation: any): Promise<string> {
        let manner = master?.master?.manner;
        return !_.isNil(manner) ? manner : this.translate(project, 'prompt.tarot.spread.meaning.manner', translation);
    }

    private async getContext(project: string, user: User, master: User, translation: any): Promise<string> {
        return this.translate(project, 'prompt.tarot.spread.meaning.context', translation);
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

    private async translate<T>(project: string, key: string, params: T): Promise<string> {
        return this.transport.sendListen(new LocaleGetCommand({ key, params, project }));
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

        let role = await this.getRole(project, user, master, translation);
        let task = await this.getTask(project, user, master, translation);
        let manner = await this.getManner(project, user, master, translation);
        let example = await this.getExample(project, user, master, translation);
        let context = await this.getContext(project, user, master, translation);

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