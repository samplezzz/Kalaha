import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { GameService } from '../service/game-service';

@Component({
    templateUrl: './game-component.html',
    styleUrls: ['./game-component.scss'],
})
export class GameComponent {
    game$: Observable<any>;

    constructor(private gameService: GameService) {
        this.game$ = this.gameService.game$;
    }

    move(fromField: number) {
        this.gameService.move(fromField);
    }
}
