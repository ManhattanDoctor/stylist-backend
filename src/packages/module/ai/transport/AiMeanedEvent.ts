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
    meaning: string;

    userId: number;
    chatId: number;
    project: string;
    chatMessageId: number;
}
