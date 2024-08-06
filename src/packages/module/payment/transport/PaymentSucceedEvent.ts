import { TransportEvent } from '@ts-core/common';

export class PaymentSucceedEvent extends TransportEvent<number> {
    // --------------------------------------------------------------------------
    //
    //  Static Properties
    //
    // --------------------------------------------------------------------------

    public static readonly NAME = 'PaymentSucceedEvent';

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(data: number) {
        super(PaymentSucceedEvent.NAME, data);
    }
}