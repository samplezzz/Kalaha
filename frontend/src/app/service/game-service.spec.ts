import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Client, Message } from 'stompjs';

import { AppConfig } from '../app-config';
import { Game, GameService } from './game-service';

const _ = {
    withCredentials: true,
};

describe('GameService', () => {
    let mockCreatedGame$: Subject<Game> = new Subject<Game>(),
        mockRemoteGame$: Subject<Game> = new Subject<Game>();

    let mockAppConfig: AppConfig,
        spyHttpClient: jasmine.SpyObj<HttpClient>,
        spyWebSocketInitializer: jasmine.Spy,
        spyWebSocketClient: jasmine.SpyObj<Client>;

    beforeEach(() => {
        mockAppConfig = {
            backendUrl: 'http://mockhost:7777',
        };

        spyHttpClient = jasmine.createSpyObj<HttpClient>('HttpClient', ['get', 'post', 'put']);
        spyHttpClient.post.and.returnValue(mockCreatedGame$);

        spyWebSocketClient = jasmine.createSpyObj<Client>('WebSocketClient', ['subscribe']);
        spyWebSocketClient.subscribe.and.callFake((destination, callback) => {
            let sub = mockRemoteGame$.subscribe((game) => (callback ? callback(mockMessage(game)) : null));
            return {
                id: '',
                unsubscribe: () => sub.unsubscribe(),
            };
        });

        spyWebSocketInitializer = jasmine.createSpy('WebSocketInitializer');
        spyWebSocketInitializer.and.returnValue(spyWebSocketClient);
    });

    let service: GameService;

    beforeEach(() => {
        service = new GameService(mockAppConfig, spyHttpClient, spyWebSocketInitializer);
    });

    it('should instantiate the service', () => {
        expect(service).toBeDefined();
    });
});

function mockMessage(body: any): Message {
    return {
        command: '',
        body: JSON.stringify(body),
        ack: () => {},
        headers: {},
        nack: () => {},
    };
}
