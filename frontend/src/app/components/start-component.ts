import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { filter, Observable, Subject, switchMap } from 'rxjs';

import { GameService } from '../service/game-service';

@Component({ templateUrl: './start-component.html' })
export class StartComponent {
    pendingGameCode$: Observable<string> | undefined;

    // Events

    gameAwaitingOpponent$: Observable<string>;
    gameCreated$: Observable<any>;
    gameRequested$: Subject<undefined>;
    gameStarted$: Observable<string>;

    constructor(private gameService: GameService, private router: Router) {
        // Wire events

        this.gameRequested$ = new Subject();

        this.gameCreated$ = this.gameRequested$.pipe(
            switchMap(() => this.gameService.createNewGame())
        );

        this.gameAwaitingOpponent$ = this.gameCreated$.pipe(
            filter((game) => game.status == 'NEW')
        );

        this.gameStarted$ = this.gameAwaitingOpponent$.pipe(
            switchMap((code) => this.gameService.awaitOpponent(code))
        );

        // Init actions

        this.initActions();
    }

    private initActions() {
        this.gameStarted$.subscribe((code) =>
            this.router.navigate(['/', code])
        );
    }
}
