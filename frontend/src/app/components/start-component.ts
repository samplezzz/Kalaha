import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
    catchError,
    concat,
    defaultIfEmpty,
    EMPTY,
    filter,
    map,
    merge,
    Observable,
    of,
    shareReplay,
    Subject,
    switchMap,
    take,
} from 'rxjs';

import { Game, GameService } from '../service/game-service';

@Component({
    templateUrl: './start-component.html',
    styleUrls: ['./start-component.scss'],
    animations: startAnimations(),
})
export class StartComponent implements OnInit {
    joinCode: string | undefined;

    // Events

    existingGame$: Observable<Game>;
    gameRequiringAnOpponent$: Observable<Game | undefined>;
    gameCreated$: Observable<Game>;
    gameJoined$: Observable<Game>;
    gameStarted$: Observable<any>;
    inited$: Observable<Game | boolean>;
    requestJoinGame$: Subject<string> = new Subject();
    requestNewGame$: Subject<void> = new Subject();

    constructor(private gameService: GameService, private router: Router) {
        // Wire events

        this.existingGame$ = concat(
            this.gameService.game$.pipe(
                take(1),
                switchMap((game) => (game ? of(game) : EMPTY))
            ), // from the front end state
            this.gameService.continueRemoteGame().pipe(catchError(() => EMPTY)) // from the backend state
        ).pipe(
            take(1),
            shareReplay(1) // existing game must be checked only once
        );

        // wait for the existing game check to complete
        this.inited$ = this.existingGame$.pipe(defaultIfEmpty(true));

        this.gameCreated$ = this.requestNewGame$.pipe(
            switchMap(() => this.gameService.createNewGame()),
            shareReplay(1)
        );
        this.gameRequiringAnOpponent$ = merge(
            this.gameCreated$,
            this.existingGame$.pipe(filter((game) => game.status == 'NEW')),
            this.gameService.game$.pipe(filter((game) => !game))
        );
        this.gameStarted$ = this.gameRequiringAnOpponent$.pipe(
            switchMap(() => this.gameService.awaitOpponent()),
            shareReplay(1)
        );
        this.gameJoined$ = this.requestJoinGame$.pipe(switchMap((code) => this.gameService.joinNewGame(code)));

        // Init actions

        this.initActions();
    }

    ngOnInit() {
        // If a game aready is playing, redirect to it
        this.existingGame$
            .pipe(filter((game) => game.status == 'PLAYING'))
            .subscribe(() => this.router.navigate(['/game']));
    }

    @ViewChild('joinCodeInput')
    set joinCodeInput(el: ElementRef) {
        el?.nativeElement.focus();
    }

    abortGame() {
        this.gameService.reset();
    }

    private initActions() {
        merge(this.gameStarted$.pipe(map((game) => game.code)), this.gameJoined$).subscribe(() =>
            this.router.navigate(['/game'])
        );
    }
}

function startAnimations() {
    return [
        trigger('intro', [
            transition(':leave', [
                style({ opacity: 0, transform: 'translateX(0)' }),
                animate('1s ease-in-out', style({ opacity: 0, transform: 'translateX(5em)' })),
            ]),
        ]),
        trigger('main', [transition(':enter', [style({ opacity: 0 }), animate('1s ease-out', style({ opacity: 1 }))])]),
    ];
}
