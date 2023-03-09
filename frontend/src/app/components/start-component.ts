import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, merge, Observable, Subject, switchMap } from 'rxjs';

import { Game, GameService } from '../service/game-service';

@Component({ templateUrl: './start-component.html' })
export class StartComponent {
    joinCode: string | undefined;

    // Events

    gameAwaitingOpponent$: Observable<Game>;
    gameCreated$: Observable<Game>;
    gameJoined$: Observable<string>;
    gameStarted$: Observable<Game>;
    requestJoinGame$: Subject<string>;
    requestNewGame$: Subject<void>;

    constructor(private gameService: GameService, private router: Router) {
        // Wire events

        this.requestJoinGame$ = new Subject();
        this.requestNewGame$ = new Subject();

        this.gameCreated$ = this.requestNewGame$.pipe(
            switchMap(() => this.gameService.createNewGame())
        );

        this.gameAwaitingOpponent$ = this.gameCreated$.pipe(
            filter((game) => game.status == 'NEW')
        );

        this.gameStarted$ = this.gameAwaitingOpponent$.pipe(
            switchMap(() => this.gameService.awaitOpponent())
        );

        this.gameJoined$ = this.requestJoinGame$.pipe(
            switchMap((code) => this.gameService.joinNewGame(code))
        );

        // Init actions

        this.initActions();
    }

    private initActions() {
        merge(
            this.gameStarted$.pipe(map((game) => game.code)),
            this.gameJoined$
        ).subscribe((code) => this.router.navigate([code]));
    }

    test() {
        this.gameService._game$.next({
            code: 'XYZ',
            pods: [0, 11, 12, 13, 14, 15, 16, 0, 21, 22, 23, 24, 25, 26],
            status: 'PLAYING',
            turn: 'DOWN',
        });
        this.router.navigate(['XYZ']);
    }
}
