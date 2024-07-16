import { TransportCommandAsync } from '@ts-core/common';

export class LocaleGetCommand extends TransportCommandAsync<ILocaleGetDto, string> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'LocaleGetCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: ILocaleGetDto) {
        super(LocaleGetCommand.NAME, request);
    }
}
export interface ILocaleGetDto<T = any> {
    key: string;
    project: string;
    params?: T;
    locale?: string;
}