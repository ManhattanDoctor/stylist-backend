import { TransportCommandAsync } from '@ts-core/common';

export class MeanCommand extends TransportCommandAsync<IMeanDto, string> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'MeanCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IMeanDto) {
        super(MeanCommand.NAME, request);
    }
}

export interface IMeanDto {
    userId: number;
    pictures: Array<string>;
    project?: string;
    masterId?: number;
}