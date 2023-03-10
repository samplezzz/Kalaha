import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    catchError,
    concat,
    defaultIfEmpty,
    filter,
    lastValueFrom,
    map,
    merge,
    Observable,
    of,
    Subject,
    switchMap,
    take,
} from 'rxjs';

import { Game, GameService } from '../service/game-service';

@Component({ templateUrl: './start-component.html', styleUrls: ['./start-component.scss'] })
export class StartComponent implements OnInit {
    joinCode: string | undefined;

    // Events

    existingGame$: Observable<Game | undefined>;
    gameAwaitingOpponent$: Observable<Game>;
    gameCreated$: Observable<Game>;
    gameJoined$: Observable<Game>;
    gameStarted$: Observable<Game>;
    inited$: Promise<boolean>;
    requestJoinGame$: Subject<string> = new Subject();
    requestNewGame$: Subject<void> = new Subject();

    constructor(private gameService: GameService, private router: Router) {
        // Wire events

        this.existingGame$ = concat(
            this.gameService.game$.pipe(take(1)),
            this.gameService.continueRemoteGame().pipe(catchError(() => of(undefined)))
        ).pipe(
            filter((playingGame) => !!playingGame),
            take(1)
        );

        this.inited$ = lastValueFrom(
            this.existingGame$.pipe(
                map(() => true),
                defaultIfEmpty(true)
            )
        ); // wait for the existing game check to complete

        this.gameCreated$ = this.requestNewGame$.pipe(switchMap(() => this.gameService.createNewGame()));
        this.gameAwaitingOpponent$ = this.gameCreated$.pipe(filter((game) => game.status == 'NEW'));
        this.gameStarted$ = this.gameAwaitingOpponent$.pipe(switchMap(() => this.gameService.awaitOpponent()));
        this.gameJoined$ = this.requestJoinGame$.pipe(switchMap((code) => this.gameService.joinNewGame(code)));

        // Init actions

        this.initActions();
    }

    ngOnInit() {
        // If a game aready is playing, redirect to it
        this.existingGame$.subscribe((ongoing) => this.router.navigate(['/game']));
    }

    private initActions() {
        merge(this.gameStarted$.pipe(map((game) => game.code)), this.gameJoined$).subscribe((code) =>
            this.router.navigate(['/game'])
        );
    }
}
