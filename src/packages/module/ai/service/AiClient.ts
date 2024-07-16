import { Logger, DateUtil, LoggerWrapper } from '@ts-core/common';
import { IPrompt } from './AiPromptService';
import { ChatCompletionMessageParam, ChatCompletionContentPart } from 'openai/resources';
import OpenAI from 'openai';
import * as _ from 'lodash';

export class AiClient extends LoggerWrapper {
    //--------------------------------------------------------------------------
    //
    // 	Properties
    //
    //--------------------------------------------------------------------------

    private api: OpenAI;

    //--------------------------------------------------------------------------
    //
    // 	Constructor
    //
    //--------------------------------------------------------------------------

    constructor(logger: Logger, private key: string) {
        super(logger);
        this.api = new OpenAI({ apiKey: this.key, timeout: 10 * DateUtil.MILLISECONDS_MINUTE });
    }

    //--------------------------------------------------------------------------
    //
    // 	Private Methods
    //
    //--------------------------------------------------------------------------



    //--------------------------------------------------------------------------
    //
    // 	Public Methods
    //
    //--------------------------------------------------------------------------

    public async ask(item: IPrompt): Promise<string> {
        let content: Array<ChatCompletionContentPart> = [{ type: 'text', text: item.user }];
        if (!_.isEmpty(item.pictures)) {
            item.pictures.forEach(item => content.push({ type: 'image_url', image_url: { url: item, detail: 'auto' } }));
        }
        let messages: Array<ChatCompletionMessageParam> = [{ role: 'system', content: item.system }, { role: 'user', content }];
        let { choices } = await this.api.chat.completions.create({ model: item.model, messages });
        return !_.isEmpty(choices) ? _.first(choices).message.content : null;
    }
}

