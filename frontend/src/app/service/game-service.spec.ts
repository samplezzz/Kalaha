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

        spyWebSocketClient = jasmine.createSpyObj<Client>('WebSocketClient', ['connect', 'disconnect', 'subscribe']);
        spyWebSocketClient.connect.and.callFake((headers, connectCallback, errorCallback) => {
            if (connectCallback instanceof Function) {
                connectCallback();
            }
        });
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

    it('should initialize Web Socket connection but not subscribe until a new game is present', () => {
        expect(spyWebSocketInitializer).toHaveBeenCalled();
        expect(spyHttpClient.post).not.toHaveBeenCalled();

        service.createNewGame().subscribe();

        expect(spyHttpClient.post).toHaveBeenCalledOnceWith(`http://mockhost:7777/user/start`, {}, jasmine.any(Object));
        expect(spyWebSocketClient.subscribe).not.toHaveBeenCalled();

        mockCreatedGame$.next({ code: 'CREATED-GAME', pods: [], status: 'NEW', turn: 'DOWN' });

        expect(spyWebSocketClient.subscribe).toHaveBeenCalledWith(`/queue/game-CREATED-GAME`, jasmine.any(Function));
    });

    it('should notify about opponent joining', () => {
        let gameState: Game | undefined | null = null;
        service.game$.subscribe((g) => (gameState = g));

        expect(gameState).withContext('The game should be initially undefined.').toBeUndefined();
        expect(service.role).toBeUndefined();

        service.createNewGame().subscribe();
        mockCreatedGame$.next({ code: 'CREATED-GAME', pods: [], status: 'NEW', turn: 'DOWN' });

        if (gameState) {
            expect(gameState)
                .withContext('The game should be initialized after #createNewGame() is called.')
                .toBeDefined();
            expect(gameState)
                .withContext('The game should be initialized to the object returned by the API.')
                .toEqual({ code: 'CREATED-GAME', pods: [], status: 'NEW', turn: 'DOWN' });
        } else {
            fail('Game should be defined.');
        }
        expect(service.role).withContext('User role should not be initialized after creating a game.').toBeUndefined();

        let joinedGame: Game | undefined;
        service.awaitOpponent().subscribe((g) => (joinedGame = g));

        expect(joinedGame)
            .withContext('#awaitOpponent() should not notify until a game is joined on the backend')
            .toBeUndefined();
        expect(service.role)
            .withContext('User role should not be initialized when awaiting the opponent.')
            .toBeUndefined();

        if (gameState) {
            mockRemoteGame$.next(Object.assign(gameState, { status: 'PLAYING' }));
            expect(joinedGame)
                .withContext('#awaitOpponent() should notify when a game is joined on the backend')
                .toBeDefined();
            expect(service.role)
                .withContext('User role should be initialized to DOWN after the opponent joins.')
                .toBe('DOWN');
        } else {
            fail('Game should be defined.');
        }
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
