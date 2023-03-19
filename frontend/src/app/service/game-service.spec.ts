import { AppConfig } from '../app-config';
import { GameService } from './game-service';

describe('GameService', () => {
    let mockAppConfig: AppConfig;
    let spyHttpClient: any;
    let spyWebSocketClient: any;

    beforeEach(() => {
        mockAppConfig = {
            backendUrl: 'http://mockhost:7777',
        };

        spyHttpClient = jasmine.createSpyObj('WebSocketClient', ['get', 'post', 'put']);
        spyWebSocketClient = jasmine.createSpyObj('WebSocketClient', ['connect', 'disconnect', 'subscribe']);
    });

    let service: GameService;

    beforeEach(() => {
        service = new GameService(mockAppConfig, spyHttpClient, () => spyWebSocketClient);
    });

    it('should instantiate the service', () => {
        expect(service).toBeDefined();
    });
});
