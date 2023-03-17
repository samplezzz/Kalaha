import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component, HostBinding } from '@angular/core';

import { GameService } from './service/game-service';

@Component({
    selector: 'ka-root',
    template: `<div [@routeTransition]="outlet.isActivated ? outlet.activatedRoute : ''">
        <router-outlet #outlet="outlet"></router-outlet>
    </div>`,
    animations: [
        trigger('routeTransition', [
            transition('* => *', [
                query(':enter', [style({ opacity: 0, position: 'absolute' })], {
                    optional: true,
                }),
                query(':leave', [style({ opacity: 1 }), animate('0.3s', style({ opacity: 0, position: 'absolute' }))], {
                    optional: true,
                }),
                query(':enter', [style({ opacity: 0 }), animate('0.3s', style({ opacity: 1, position: 'relative' }))], {
                    optional: true,
                }),
            ]),
        ]),
    ],
})
export class AppComponent {
    constructor(private gameService: GameService) {}

    @HostBinding('attr.player')
    get playerRole() {
        return this.gameService.role;
    }
}
