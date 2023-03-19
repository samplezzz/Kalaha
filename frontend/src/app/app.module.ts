import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as SockJS from 'sockjs-client';
import { Client as StompClient, over } from 'stompjs';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameComponent } from './components/game-component';
import { StartComponent } from './components/start-component';
import { AppConfig, appConfig, APP_CONFIG } from './app-config';
import { WEB_SOCKET_CLIENT_FACTORY } from './integration/web-socket.client';

@NgModule({
    declarations: [AppComponent, StartComponent, GameComponent],
    imports: [BrowserAnimationsModule, BrowserModule, AppRoutingModule, FormsModule, HttpClientModule],
    providers: [
        {
            provide: APP_CONFIG,
            useFactory: () => appConfig,
        },
        {
            provide: WEB_SOCKET_CLIENT_FACTORY,
            useFactory: (config: AppConfig) => {
                let stompClient: StompClient | undefined;
                return () => {
                    if (stompClient) {
                        console.warn('>>>>>>>>>> Reinitializing STOP.');
                        try {
                            stompClient.disconnect(() => {});
                        } catch (e) {
                            console.error('Failed to disconnect from STMOP', e);
                        }
                    }
                    return (stompClient = over(new SockJS(`${config.backendUrl}/live`)));
                };
            },
            deps: [APP_CONFIG],
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
