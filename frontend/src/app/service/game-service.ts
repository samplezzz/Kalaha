import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { filter, interval, Observable, Subject, switchMap, take } from 'rxjs';

import { AppConfig, APP_CONFIG } from '../app-config';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private _game$: Subject<any> = new Subject();
    game$ = this._game$.asObservable();

    constructor(
        @Inject(APP_CONFIG) private conf: AppConfig,
        private httpClient: HttpClient
    ) {}

    public createNewGame(): Observable<any> {
        return this.httpClient.post(`${this.conf.backendUrl}/user/play`, {});
    }

    public joinNewGame(code: string): Observable<any> {
        return this.httpClient.post(
            `${this.conf.backendUrl}/user/join/${code}`,
            {}
        );
    }

    public awaitOpponent(code: string): Observable<any> {
        return interval(1000).pipe(
            switchMap(() =>
                this.httpClient.get(`${this.conf.backendUrl}/game/status`)
            ),
            filter((status) => status == 'PLAYING'),
            take(1)
        );
    }

    public move(fromField: number) {
        this.httpClient
            .post(`${this.conf.backendUrl}/game/move`, {
                from: fromField,
            })
            .subscribe((game) => this._game$.next(game));
    }
}
