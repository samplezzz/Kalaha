import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
    BehaviorSubject,
    distinctUntilChanged,
    filter,
    Observable,
    partition,
    pipe,
    skip,
    switchMap,
    Subject,
    take,
    tap,
    timeout,
} from 'rxjs';

import { AppConfig, APP_CONFIG } from '../app-config';

declare var SockJS: any;
declare var Stomp: any;

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
    public static readonly POLLING_TIME = 3000;

    private sock;
    private stompClient;

    private stateGame$ = new BehaviorSubject<Game | undefined>(undefined);
    game$ = this.stateGame$.asObservable();

    private remoteGame$ = new Subject<Game>();

    role: PlayerRole | undefined;

    constructor(@Inject(APP_CONFIG) private conf: AppConfig, private httpClient: HttpClient) {
        this.sock = new SockJS(`${conf.backendUrl}/live`);
        this.stompClient = Stomp.over(this.sock);

        const [newGame$, gameOver$] = partition(
            this.stateGame$.pipe(
                skip(1),
                distinctUntilChanged((previous, current) => previous?.code == current?.code)
            ),
            (game) => !!game?.code
        );

        newGame$.subscribe((game) => this.connectToGameLiveUpdates(game));
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
            // TODO: check current game's last move sequence and, if incremented, trigger the game update
            filter((game) => game.turn == this.role),
            tap((game) => console.log("Wait for opponent's move over", game)),
            take(1),
            this.updateStateGame()
        );
    }

    /**
     * Helper pipeable operator:
     *
     * Initializes {@link GameService#role} to the value from a param.
     */
    private initStateRoleWith = <T>(role: PlayerRole) =>
        pipe(
            tap((input: T) => {
                console.warn('Initializing role with', role);
                this.role = role;
            })
        );

    /**
     * Helper pipeable operator:
     *
     * Initializes {@link GameService#role} to the value from an event from input observable.
     */
    private initStateRole = () =>
        pipe(
            tap((role: PlayerRole) => {
                console.warn('Initializing role with', role);
                this.role = role;
            })
        );

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

    private connectToGameLiveUpdates(game: Game | undefined) {
        if (game) {
            console.warn('>>>>>>>>>> Connecting STOMP');
            this.stompClient.connect({}, () => {
                console.debug('Subscribing to LIVE updates of game', game?.code);
                this.stompClient.subscribe(`/queue/game-${game?.code}`, (message: any) => {
                    if (message.body) {
                        try {
                            const pushedGame = JSON.parse(message.body);
                            console.debug('Game state PUSH:', pushedGame);
                            this.remoteGame$.next(pushedGame);
                        } catch (err) {
                            this.remoteGame$.error(err);
                        }
                    }
                });
            });
        }
    }

    private disconnectFromGameLiveUpdates() {
        console.warn('<<<<<<<<<< Disconnecting STOMP');
        this.stompClient.disconnect();
    }
}
