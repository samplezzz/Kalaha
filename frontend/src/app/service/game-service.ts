import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { filter, interval, Observable, switchMap, take } from 'rxjs';

import { AppConfig, APP_CONFIG } from '../app-config';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    constructor(
        @Inject(APP_CONFIG) private conf: AppConfig,
        private httpClient: HttpClient
    ) {}

    public createNewGame(): Observable<any> {
        return this.httpClient.post(`${this.conf.backendUrl}/user/game`, {});
    }

    public awaitOpponent(code: string): Observable<any> {
        return interval(1000).pipe(
            switchMap(() =>
                this.httpClient.get(
                    `${this.conf.backendUrl}/game/${code}/status`
                )
            ),
            filter((status) => status == 'PLAYING'),
            take(1)
        );
    }
}
