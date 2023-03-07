import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { filter, merge, Observable, Subject, switchMap } from 'rxjs';

import { GameService } from '../service/game-service';

@Component({ templateUrl: './start-component.html' })
export class StartComponent {
    joinCode: string | undefined;

    // Events

    gameAwaitingOpponent$: Observable<any>;
    gameCreated$: Observable<any>;
    gameJoined$: Observable<any>;
    gameStarted$: Observable<string>;
    requestJoinGame$: Subject<string>;
    requestNewGame$: Subject<undefined>;

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
            switchMap((code) => this.gameService.awaitOpponent(code))
        );

        this.gameJoined$ = this.requestJoinGame$.pipe(
            switchMap((code) => this.gameService.joinNewGame(code))
        );

        // Init actions

        this.initActions();
    }

    private initActions() {
        merge(this.gameStarted$, this.gameJoined$).subscribe((code) =>
            this.router.navigate(['/', code])
        );
    }
}
