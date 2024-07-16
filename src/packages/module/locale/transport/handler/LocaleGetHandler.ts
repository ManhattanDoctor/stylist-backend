import { Injectable } from '@nestjs/common';
import { Logger, Transport, TransportCommandAsyncHandler } from '@ts-core/common';
import { ILocaleGetDto, LocaleGetCommand } from '../LocaleGetCommand';
import { LocaleService } from '../../service';
import * as _ from 'lodash';

@Injectable()
export class LocaleGetHandler extends TransportCommandAsyncHandler<ILocaleGetDto, string, LocaleGetCommand> {
    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, transport: Transport, private service: LocaleService) {
        super(logger, transport, LocaleGetCommand.NAME);
    }

    // --------------------------------------------------------------------------
    //
    //  Protected Methods
    //
    // --------------------------------------------------------------------------

    protected async execute(params: ILocaleGetDto): Promise<string> {
        let locale = params.locale;
        if (_.isNil(locale)) {
            locale = 'ru';
        }
        return this.service.translate(params.project, locale, params.key, params.params);
    }
}