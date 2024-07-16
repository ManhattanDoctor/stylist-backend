import { TransportCommand } from '@ts-core/common';

export class AiMeanCommand extends TransportCommand<IAiMeanDto> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'AiMeanCommand';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(request: IAiMeanDto) {
        super(AiMeanCommand.NAME, request);
    }
}


export interface IAiMeanDto {
    userId: number;
    project: string;
    pictures: Array<string>;

    chatMessageId?: number;
}

