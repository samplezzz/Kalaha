import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
    BehaviorSubject,
    filter,
    interval,
    Observable,
    map,
    switchMap,
    take,
    tap,
    timeout,
    of,
    pipe,
    concat,
} from 'rxjs';

import { AppConfig, APP_CONFIG } from '../app-config';

// TODO: Export to HTTP Interceptor
const _ = {
    withCredentials: true,
};

export type PlayerRole = 'UP' | 'DOWN';

export type Game = {
    code: string;
    pods: number[];
    status: 'NEW' | 'PLAYING' | 'FINISHED' | 'ABORTED';
    turn: PlayerRole;
};

@Injectable({
    providedIn: 'root',
})
export class GameService {
    public readonly AWAIT_OPPONENT_MAXTIME = 1000 * 60 * 5;

    public _game$ = new BehaviorSubject<Game | undefined>(undefined);
    game$ = this._game$.asObservable();

    role: 'UP' | 'DOWN' | undefined;

    constructor(@Inject(APP_CONFIG) private conf: AppConfig, private httpClient: HttpClient) {}

    public awaitOpponent(): Observable<Game> {
        return interval(5000).pipe(
            switchMap(() => this.httpClient.get<string>(`${this.conf.backendUrl}/game/status`, _)),
            filter((status) => status == 'PLAYING'),

            take(1),
            timeout(this.AWAIT_OPPONENT_MAXTIME),

            this.initRole('DOWN'),
            this.forceUpdateGame()
        );
    }

    public continueGame(): Observable<Game> {
        return of(undefined).pipe(
            this.initRole(),
            this.forceUpdateGame(),
            tap((game) => {
                console.debug('Continue existing game', game);
            })
        );
    }

    public createNewGame(): Observable<Game> {
        return this.httpClient.post<Game>(`${this.conf.backendUrl}/user/start`, {}, _);
    }

    public joinNewGame(code: string): Observable<Game> {
        return this.httpClient
            .post<Game>(`${this.conf.backendUrl}/user/join/${code}`, {}, _)
            .pipe(this.initRole('UP'), this.updateGame());
    }

    public move(field: number): Observable<Game> {
        return this.httpClient.post<Game>(`${this.conf.backendUrl}/game/move/${field}`, {}, _).pipe(this.updateGame());
    }

    public waitForMove() {
        return interval(5000).pipe(
            switchMap(() => this.httpClient.get<string>(`${this.conf.backendUrl}/game/turn`, _)),
            filter((turn) => turn == this.role),
            take(1),
            this.forceUpdateGame()
        );
    }

    /**
     * Helper pipeable operator:
     *
     * Initializes {@link GameService#role} to the value from a param
     * or, if the param is empty, fetches the user's role from API endpoint.
     */
    private initRole = <T>(role?: PlayerRole) =>
        pipe(
            switchMap((input: T) =>
                (role ? of(role) : this.httpClient.get<PlayerRole>(`${this.conf.backendUrl}/game/role`, _)).pipe(
                    tap((role) => (this.role = role)),
                    map(() => input)
                )
            )
        );

    /**
     * Helper pipeable operator:
     *
     * Updates {@link GameService}'s {@link Game} state from the observable input
     * or, if the input is empty, fetches the current game from API endpoint.
     */
    private updateGame = () =>
        pipe(
            switchMap((game: Game | undefined) =>
                game ? of(game) : this.httpClient.get<Game>(`${this.conf.backendUrl}/game`, _)
            ),
            tap((game) => this._game$.next(game))
        );

    /**
     * Same as above but always fetches new game from API endpoint.
     */
    private forceUpdateGame = () =>
        pipe(
            map(() => undefined),
            this.updateGame()
        );
}
