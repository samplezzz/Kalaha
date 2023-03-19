import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { APP_CONFIG } from './app-config';
import { AppComponent } from './app.component';
import { WEB_SOCKET_CLIENT_FACTORY } from './integration/web-socket.client';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            declarations: [AppComponent],
            providers: [
                {
                    provide: APP_CONFIG,
                    useValue: {
                        backendUrl: `http://mockhost:7777`,
                    },
                },
                {
                    provide: WEB_SOCKET_CLIENT_FACTORY,
                    useValue: () => ({}),
                },
            ],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
