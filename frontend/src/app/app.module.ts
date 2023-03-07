import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game-component';
import { StartComponent } from './components/start-component';
import { appConfig, APP_CONFIG } from './app-config';

@NgModule({
    declarations: [AppComponent, StartComponent, GameComponent],
    imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
    providers: [
        {
            provide: APP_CONFIG,
            useFactory: () => appConfig,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
