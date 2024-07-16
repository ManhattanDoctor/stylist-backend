
import { TransportEvent } from '@ts-core/common';

export class AiMeanedEvent extends TransportEvent<IAiMeanedDto> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'AiMeanedEvent';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IAiMeanedDto) {
        super(AiMeanedEvent.NAME, data);
    }
}

export interface IAiMeanedDto {
    result: string;
    project: string;

    userId: number;
    chatId: number;
    chatMessageId: number;
}
