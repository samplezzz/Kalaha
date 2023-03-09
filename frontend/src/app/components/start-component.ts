import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, concat, filter, map, merge, Observable, of, Subject, switchMap, take } from 'rxjs';

import { Game, GameService } from '../service/game-service';

@Component({ templateUrl: './start-component.html' })
export class StartComponent implements OnInit {
    joinCode: string | undefined;

    // Events

    gameAwaitingOpponent$: Observable<Game>;
    gameCreated$: Observable<Game>;
    gameJoined$: Observable<Game>;
    gameStarted$: Observable<Game>;
    requestJoinGame$: Subject<string> = new Subject();
    requestNewGame$: Subject<void> = new Subject();

    constructor(private gameService: GameService, private router: Router) {
        // Wire events

        this.gameCreated$ = this.requestNewGame$.pipe(switchMap(() => this.gameService.createNewGame()));
        this.gameAwaitingOpponent$ = this.gameCreated$.pipe(filter((game) => game.status == 'NEW'));
        this.gameStarted$ = this.gameAwaitingOpponent$.pipe(switchMap(() => this.gameService.awaitOpponent()));
        this.gameJoined$ = this.requestJoinGame$.pipe(switchMap((code) => this.gameService.joinNewGame(code)));

        // Init actions

        this.initActions();
    }

    ngOnInit() {
        // If a game aready is playing, redirect to it

        concat(
            this.gameService.game$.pipe(take(1)),
            this.gameService.continueGame().pipe(catchError(() => of(undefined)))
        )
            .pipe(
                filter((playingGame) => !!playingGame),
                take(1)
            )
            .subscribe((ongoing) => {
                console.debug('Found an existing game:', ongoing);
                this.router.navigate(['/game']);
            });
    }

    private initActions() {
        merge(this.gameStarted$.pipe(map((game) => game.code)), this.gameJoined$).subscribe((code) =>
            this.router.navigate(['/game'])
        );
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
