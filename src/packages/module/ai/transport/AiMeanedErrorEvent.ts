
import { ErrorCode } from '@project/common/api';
import { TransportEvent } from '@ts-core/common';

export class AiMeanedErrorEvent extends TransportEvent<IAiMeanedErrorDto> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'AiMeanedErrorEvent';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: IAiMeanedErrorDto) {
        super(AiMeanedErrorEvent.NAME, data);
    }
}

export interface IAiMeanedErrorDto {
    code: ErrorCode;
    message: string;

    userId: number;
    chatId: number;
    project: string;
    chatMessageId: number;
}
