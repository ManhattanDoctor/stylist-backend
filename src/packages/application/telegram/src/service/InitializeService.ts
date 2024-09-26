import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@project/module/database/service';
import { Logger, LoggerWrapper, Transport } from '@ts-core/common';
import * as _ from 'lodash';

@Injectable()
export class InitializeService extends LoggerWrapper {

    // --------------------------------------------------------------------------
    //
    //  Constructor
    //
    // --------------------------------------------------------------------------

    constructor(logger: Logger, private transport: Transport, private database: DatabaseService) {
        super(logger);
    }

    // --------------------------------------------------------------------------
    //
    //  Public Methods
    //
    // --------------------------------------------------------------------------

    public async initialize(): Promise<void> {
        // api.setRoot();
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('ACL:UserAdd', { signature: { publicKey: SECOND_USER_PUBLIC_KEY, algorithm: TransportCryptoManagerMetamaskBackend.ALGORITHM, value: personalSign({ data: '1', privateKey: Buffer.from(SECOND_USER_PRIVATE_KEY, 'hex') }), nonce: '1' }, inviterUid: PLATFORM_USER_UID })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('ACL:UserAdd', { signature: { publicKey: THIRD_USER_PUBLIC_KEY, algorithm: TransportCryptoManagerMetamaskBackend.ALGORITHM, value: personalSign({ data: '1', privateKey: Buffer.from(THIRD_USER_PRIVATE_KEY, 'hex') }), nonce: '1' }, inviterUid: SECOND_USER_UID })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:CoinTransfer', { to: SECOND_USER_UID, coinUid: COIN_UID, amount: '10000' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:CoinTransfer', { to: THIRD_USER_UID, coinUid: COIN_UID, amount: '10000' })));
        // api.setSecond();
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionPrimaryAdd', { nickname: 'renat' })));
        // api.setThird();
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionSecondaryAdd', { price: { coinId: 'TRUE', value: '1000' } })));
 
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionBidConditionsGet', { auctionUid: 'auction/renat' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionBid', { auctionUid: 'auction/renat' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionAdd', { nickname: 'vasya' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionBidConditionsGet', { auctionUid: 'auction/renat' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionBidConditionsGet', { auctionUid: 'auction/vasya' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionCheck', { uid: 'auction/vasya' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionGet', { uid: 'auction/renat' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionCheck', { uid: 'auction/renat' })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:NicknameTransfer', { to: ROOT_USER_UID })));
        // console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionCheck', { uid: 'auction/renat' })));
        /*
        console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('AUCTION:AuctionConditionsGet', {
            uid: '0x1c242abEc0de72a3F9C1102cDBaE3f3eD6C0C770',
            wallet: '0x1c242abEc0de72a3F9C1102cDBaE3f3eD6C0C772'
        })));
    
        console.log(await api.ledgerRequestSendListen(new TransportFabricCommandAsync('ACL:UserEdit', {
            uid: '0x1c242abEc0de72a3F9C1102cDBaE3f3eD6C0C770',
            wallet: '0x1c242abEc0de72a3F9C1102cDBaE3f3eD6C0C772'
        })));
        */

        // console.log(await this.transport.sendListen(new AiMeanCommand({ userId: 2, project: ProjectName.BOT, pictures: ['https://api.telegram.org/file/bot7453863930:AAETwizYyWKF-MDKXOEcvAxssmNqs2aQG_o/photos/file_1.jpg'] })));
        // console.log(await this.transport.dispatch(new PaymentSucceedEvent(1)));
    }

    public parseAddress(address: string): string {
        address = address.toLowerCase();
        return address.replace(new RegExp(`[^[0-9a-f]`, 'g'), '');
    }
}
