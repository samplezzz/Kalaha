import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    Observable,
    of,
    partition,
    pipe,
    retry,
    skip,
    switchMap,
    Subject,
    take,
    tap,
    timeout,
} from 'rxjs';
import { Client, Message } from 'stompjs';

import { AppConfig, APP_CONFIG } from '../app-config';
import { WEB_SOCKET_CLIENT_FACTORY, WebSocketInitializer } from '../integration/web-socket.client';

// TODO: Export to HTTP Interceptor
const _ = {
    withCredentials: true,
};

export type PlayerRole = 'UP' | 'DOWN';

export type GameStatus = 'NEW' | 'PLAYING' | 'FINISHED' | 'ABORTED';

export type Game = {
    code: string;
    pods: number[];
    status: GameStatus;
    turn: PlayerRole;
};

@Injectable({
    providedIn: 'root',
})
export class GameService {
    public static readonly AWAIT_OPPONENT_MAXTIME = 1000 * 60 * 5;

    role: PlayerRole | undefined;

    private stateGame$ = new BehaviorSubject<Game | undefined>(undefined);
    game$ = this.stateGame$.asObservable();
    private stompClient: Client;
    private remoteGame$ = new Subject<Game>();

    constructor(
        @Inject(APP_CONFIG) private conf: AppConfig,
        private httpClient: HttpClient,
        @Inject(WEB_SOCKET_CLIENT_FACTORY) private initWebSocket: WebSocketInitializer
    ) {
        this.stompClient = this.initWebSocket();

        const [newGame$, gameOver$] = <[Observable<Game>, Observable<Game | undefined>]>partition(
            this.stateGame$.pipe(
                skip(1),
                distinctUntilChanged((previous, current) => previous?.code == current?.code)
            ),
            (game) => !!game?.code
        );

        newGame$
            .pipe(
                switchMap((game) =>
                    this.connectToGameLiveUpdates(game).pipe(
                        timeout({ first: 3000, each: 1000 }),
                        retry({ delay: () => of((this.stompClient = this.initWebSocket())) })
                    )
                )
            )
            .subscribe();

        gameOver$.subscribe(() => this.disconnectFromGameLiveUpdates());
    }

    awaitOpponent() {
        return this.remoteGame$.pipe(
            filter((game) => game.status == 'PLAYING'),
            take(1),
            timeout(GameService.AWAIT_OPPONENT_MAXTIME),

            this.initStateRoleWith('DOWN'),
            this.updateStateGame()
        );
    }

    continueRemoteGame(): Observable<Game> {
        return this.httpClient.get<PlayerRole>(`${this.conf.backendUrl}/game/role`, _).pipe(
            this.initStateRole(),
            switchMap(() => this.httpClient.get<Game>(`${this.conf.backendUrl}/game`, _)),
            this.updateStateGame()
        );
    }

    createNewGame(): Observable<Game> {
        return this.httpClient.post<Game>(`${this.conf.backendUrl}/user/start`, {}, _).pipe(this.updateStateGame());
    }

    joinNewGame(code: string): Observable<Game> {
        return this.httpClient
            .post<Game>(`${this.conf.backendUrl}/user/join/${code}`, {}, _)
            .pipe(this.initStateRoleWith('UP'), this.updateStateGame());
    }

    move(field: number): Observable<Game> {
        return this.httpClient
            .post<Game>(`${this.conf.backendUrl}/game/move/${field}`, {}, _)
            .pipe(this.updateStateGame());
    }

    waitForMove() {
        return this.remoteGame$.pipe(
            filter((game) => game.turn == this.role),
            take(1),
            this.updateStateGame()
        );
    }

    /**
     * Helper pipeable operator:
     *
     * Initializes {@link GameService#role} to the value from a param.
     */
    private initStateRoleWith = <T>(role: PlayerRole) => pipe(tap((input: T) => (this.role = role)));

    /**
     * Helper pipeable operator:
     *
     * Initializes {@link GameService#role} to the value from an event from input observable.
     */
    private initStateRole = () => pipe(tap((role: PlayerRole) => (this.role = role)));

    /**
     * Helper pipeable operator:
     *
     * Updates {@link GameService}'s {@link Game} state from the observable input
     * or, if the input is empty, fetches the current game from API endpoint.
     */
    private updateStateGame = () =>
        pipe(
            tap((game: Game) => console.debug('Game state update', game)),
            tap((game) => this.stateGame$.next(game))
        );

    private connectToGameLiveUpdates(game: Game): Observable<void> {
        const connected$: Observable<void> = new Observable((subscriber) => {
            console.warn('>>>>>>>>>> Connecting STOMP', game);
            this.stompClient.connect(
                {},
                () => {
                    subscriber?.next();
                    subscriber?.complete();
                    this.stompClient.subscribe(`/queue/game-${game?.code}`, (message: Message) => {
                        if (message.body) {
                            try {
                                this.remoteGame$.next(JSON.parse(message.body));
                            } catch (err) {
                                this.remoteGame$.error(err);
                            }
                        }
                    });
                },
                (err: any) => {
                    subscriber?.error();
                    console.error('Could not connect to WebSocket', err);
                }
            );
        });

        return connected$;
    }

    private disconnectFromGameLiveUpdates() {
        console.warn('<<<<<<<<<< Disconnecting STOMP');
        this.stompClient.disconnect(() => {});
    }
}
