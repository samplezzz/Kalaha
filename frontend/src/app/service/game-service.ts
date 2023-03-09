import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
    filter,
    interval,
    Observable,
    map,
    ReplaySubject,
    switchMap,
    take,
    tap,
    timeout,
} from 'rxjs';

import { AppConfig, APP_CONFIG } from '../app-config';

export type Game = {
    code: string;
    pods: number[];
    status: 'NEW' | 'PLAYING' | 'FINISHED' | 'ABORTED';
    turn: 'UP' | 'DOWN';
};

@Injectable({
    providedIn: 'root',
})
export class GameService {
    public readonly AWAIT_OPPONENT_MAXTIME = 1000 * 60 * 5;

    public _game$: ReplaySubject<Game> = new ReplaySubject(1);
    game$ = this._game$.asObservable();

    constructor(
        @Inject(APP_CONFIG) private conf: AppConfig,
        private httpClient: HttpClient
    ) {}

    public awaitOpponent(): Observable<Game> {
        return interval(1000).pipe(
            switchMap(() =>
                this.httpClient.get(`${this.conf.backendUrl}/game/status`, {
                    withCredentials: true,
                })
            ),
            filter((status) => status == 'PLAYING'),
            switchMap(() =>
                this.httpClient.get<Game>(`${this.conf.backendUrl}/game`, {
                    withCredentials: true,
                })
            ),
            tap((game) => this._game$.next(game)),
            take(1),
            timeout(this.AWAIT_OPPONENT_MAXTIME)
        );
    }

    public createNewGame(): Observable<Game> {
        return this.httpClient.post<Game>(
            `${this.conf.backendUrl}/user/play`,
            {},
            { withCredentials: true }
        );
    }

    public joinNewGame(code: string): Observable<string> {
        return this.httpClient
            .post<Game>(
                `${this.conf.backendUrl}/user/join/${code}`,
                {},
                { withCredentials: true }
            )
            .pipe(
                tap((game) => this._game$.next(game)),
                map((game) => game.code)
            );
    }

    public move(field: number): Observable<Game> {
        return this.httpClient
            .post<Game>(
                `${this.conf.backendUrl}/game/move/${field}`,
                {},
                {
                    withCredentials: true,
                }
            )
            .pipe(tap((game) => this._game$.next(game)));
    }
}
