import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game-component';
import { StartComponent } from './components/start-component';

@NgModule({
    declarations: [AppComponent, StartComponent, GameComponent],
    imports: [BrowserModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
