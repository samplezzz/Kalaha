import { Component, HostBinding } from '@angular/core';

import { GameService } from './service/game-service';

@Component({
    selector: 'ka-root',
    template: `<router-outlet></router-outlet>`,
})
export class AppComponent {
    constructor(private gameService: GameService) {}

    @HostBinding('attr.player')
    get playerRole() {
        return this.gameService.role;
    }
}
