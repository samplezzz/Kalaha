import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GameComponent } from './components/game-component';
import { StartComponent } from './components/start-component';

const routes: Routes = [
    {
        path: '',
        component: StartComponent,
    },
    {
        path: 'game',
        component: GameComponent,
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
