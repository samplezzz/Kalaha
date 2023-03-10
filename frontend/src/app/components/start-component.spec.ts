import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, defer, of, Subject, throwError } from 'rxjs';

import { Game, GameService, GameStatus } from '../service/game-service';
import { StartComponent } from './start-component';

describe('StartComponent', () => {
    let fixture: ComponentFixture<StartComponent>, component: StartComponent, location: Location;

    // mocks

    let mockGameState$: BehaviorSubject<Game | undefined>, mockRemoteOpponent$: Subject<Game>;

    beforeEach(() => {
        mockGameState$ = new BehaviorSubject<Game | undefined>(undefined);
        mockRemoteOpponent$ = new Subject<Game>();
    });

    let spyGameAPI: any, spyCreateGameAPI: any, spyJoinGameAPI: any;

    beforeEach(() => {
        spyCreateGameAPI = jasmine.createSpyObj('API/user/start', ['POST']);
        spyCreateGameAPI.POST.and.returnValue({ code: 'CREATED-GAME', status: 'NEW' });
        spyGameAPI = jasmine.createSpyObj('API/game', ['GET']);
        spyGameAPI.GET.and.returnValue({ code: 'REMOTE-GAME' });
        spyJoinGameAPI = jasmine.createSpyObj('API/user/join', ['POST']);
        spyJoinGameAPI.POST.and.returnValue({ code: 'JOINED-GAME' });
    });

    let spyGameService: any;

    beforeEach(() => {
        spyGameService = jasmine.createSpyObj('GameService', [
            'awaitOpponent',
            'createNewGame',
            'continueRemoteGame',
            'joinNewGame',
        ]);

        spyGameService.game$ = mockGameState$;

        spyGameService.awaitOpponent.and.returnValue(defer(() => mockRemoteOpponent$));
        spyGameService.continueRemoteGame.and.returnValue(defer(() => of(spyGameAPI.GET())));
        spyGameService.createNewGame.and.returnValue(defer(() => of(spyCreateGameAPI.POST())));
        spyGameService.joinNewGame.and.returnValue(defer(() => of(spyJoinGameAPI.POST())));
    });

    // test bed

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'game', component: MockGameComponent }])],
            declarations: [StartComponent],
            providers: [
                {
                    provide: GameService,
                    useFactory: () => spyGameService,
                },
            ],
        }).compileComponents();
    });

    // tests

    it('should create the Start Component', () => {
        initComponent();
        expect(component).toBeTruthy();
    });

    it('should be able to continue a game existing in the state', fakeAsync(() => {
        mockGameState$.next({ code: 'IN-STATE-GAME', pods: [], status: 'PLAYING', turn: 'DOWN' });
        initComponent();

        expect(location.path()).toBe('');

        fixture.detectChanges();

        expect(spyGameService.continueRemoteGame).toHaveBeenCalled();
        expect(spyGameAPI.GET).not.toHaveBeenCalled();

        tick();

        expect(location.path()).toBe('/game');
    }));

    it('should be able to continue a game existing on the backend', fakeAsync(() => {
        initComponent();

        expect(location.path()).toBe('');

        fixture.detectChanges();

        expect(spyGameService.continueRemoteGame).toHaveBeenCalled();
        expect(spyGameAPI.GET).toHaveBeenCalled();

        tick();

        expect(location.path()).toBe('/game');
    }));

    describe('when there is no existing game', () => {
        beforeEach(() => {
            spyGameService.continueRemoteGame.and.returnValue(throwError(() => 'No game is being played.'));
        });

        it('should offer starting/joining a new game when no existing games are found', fakeAsync(() => {
            initComponent();

            expect(location.path()).toBe('');

            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('h2')).nativeElement.textContent).toBe('initializing the app...');
            expect(spyGameService.continueRemoteGame).toHaveBeenCalled();
            expect(spyGameAPI.GET).not.toHaveBeenCalled();

            tick();
            fixture.detectChanges();

            expect(location.path()).toBe('');

            const buttons = fixture.debugElement.queryAll(By.css('button'));
            expect(buttons.length).toBe(2);
            expect(buttons[0].nativeElement.textContent).toBe('Start game');
            expect(buttons[1].nativeElement.textContent).toBe('Join game');
        }));

        it('should be able to start a new game', fakeAsync(() => {
            initComponent();
            fixture.detectChanges();
            expect(location.path()).toBe('');

            tick();
            fixture.detectChanges();

            let viewSnapshot = view();

            viewSnapshot.startButton.nativeElement.click();

            tick();

            expect(spyCreateGameAPI.POST).toHaveBeenCalled();

            fixture.detectChanges();

            viewSnapshot = view();

            expect(viewSnapshot.newGameCode).toBeDefined();
            expect(viewSnapshot.newGameCode.nativeElement.textContent).toBe('CREATED-GAME');

            mockRemoteOpponent$.next({ code: 'CREATED-GAME', pods: [], status: 'PLAYING', turn: 'DOWN' });
            tick();

            expect(location.path()).toBe('/game');
        }));
    });

    function initComponent() {
        fixture = TestBed.createComponent(StartComponent);
        component = fixture.componentInstance;
        location = TestBed.inject(Location);
    }

    function view() {
        return {
            startButton: fixture.debugElement.queryAll(By.css('button'))?.[0],
            joinButton: fixture.debugElement.queryAll(By.css('button'))?.[1],
            newGameCode: fixture.debugElement.query(By.css('[test-new-game-code]')),
        };
    }
});

@Component({})
class MockGameComponent {}
