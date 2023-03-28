import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, first, Observable, partition, switchMap } from 'rxjs';

import { GameService } from '../service/game-service';

@Component({
    host: { class: 'page' },
    templateUrl: './game-component.html',
    styleUrls: ['./game-component.scss'],
})
export class GameComponent implements OnInit {
    game$: Observable<any>;

    upperPods = [12, 11, 10, 9, 8, 7];
    lowerPods = [0, 1, 2, 3, 4, 5];

    constructor(router: Router, public gameService: GameService) {
        const [presentGame$, absentGame$] = partition(this.gameService.game$, (game) => !!game);

        this.game$ = presentGame$;

        absentGame$.subscribe(() => router.navigate(['/']));
    }

    move(field: number) {
        this.gameService
            .move(field)
            .pipe(switchMap(() => this.gameService.waitForOwnTurn()))
            .subscribe(() => {});
    }

    ngOnInit(): void {
        // Start waiting if it's not your move
        this.game$
            .pipe(
                first(),
                switchMap((game) => (game.turn != this.gameService.role ? this.gameService.waitForOwnTurn() : EMPTY))
            )
            .subscribe(() => {});
    }
}
