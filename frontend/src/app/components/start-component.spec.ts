import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject, throwError } from 'rxjs';

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { Game, GameService } from '../service/game-service';
import { StartComponent } from './start-component';

describe('StartComponent', () => {
    let fixture: ComponentFixture<StartComponent>, component: StartComponent, location: Location;

    // Mocks

    let mockGameState$: BehaviorSubject<Game | undefined> = new BehaviorSubject<Game | undefined>(undefined),
        mockRemoteOpponent$: Subject<Game> = new Subject<Game>(),
        mockRemoteExistingGame$: Subject<Game> = new Subject<Game>(),
        mockRemoteGameCreated$: Subject<Game> = new Subject<Game>(),
        mockRemoteGameJoined$: Subject<Game> = new Subject<Game>();

    beforeEach(() => {
        mockGameState$.next(undefined);
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

        spyGameService.awaitOpponent.and.returnValue(mockRemoteOpponent$);
        spyGameService.continueRemoteGame.and.returnValue(mockRemoteExistingGame$);
        spyGameService.createNewGame.and.returnValue(mockRemoteGameCreated$);
        spyGameService.joinNewGame.and.returnValue(mockRemoteGameJoined$);
    });

    // Test bed

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                RouterTestingModule.withRoutes([{ path: 'game', component: MockGameComponent }]),
            ],
            declarations: [StartComponent],
            providers: [
                {
                    provide: GameService,
                    useFactory: () => spyGameService,
                },
            ],
        }).compileComponents();
    });

    // Tests

    it('should create the Start Component', () => {
        initComponent();
        expect(component).toBeTruthy();
    });

    it('should be able to continue a game existing in the state', fakeAsync(() => {
        mockGameState$.next({ code: 'IN-STATE-GAME', pods: [], status: 'PLAYING', turn: 'DOWN' });
        initComponent();
        fixture.detectChanges();

        expect(location.path()).toBe('');
        expect(spyGameService.continueRemoteGame).toHaveBeenCalled();

        tick();

        expect(location.path()).toBe('/game');
    }));

    it('should be able to continue a game existing on the backend', fakeAsync(() => {
        initComponent();
        fixture.detectChanges();

        expect(location.path()).toBe('');
        expect(spyGameService.continueRemoteGame).toHaveBeenCalled();

        mockRemoteExistingGame$.next({ code: 'REMOTE-EXISTING-GAME', status: 'PLAYING', pods: [], turn: 'DOWN' });
        tick();

        expect(location.path()).toBe('/game');
    }));

    describe('when there is no existing game', () => {
        beforeEach(() => {
            spyGameService.continueRemoteGame.and.returnValue(throwError(() => 'No game is being played.'));
        });

        it('should offer starting/joining a new game when no existing games are found', fakeAsync(() => {
            initComponent();
            fixture.detectChanges();

            let viewSnapshot = view();

            expect(spyGameService.continueRemoteGame)
                .withContext(
                    "Should have called for backend's game status because frontend's game state was undefined."
                )
                .toHaveBeenCalled();
            expect(viewSnapshot.startButton).withContext('Should display the Start button.').toBeDefined();
            expect(viewSnapshot.startButton.nativeElement.textContent)
                .withContext('Should display the Start button.')
                .toBe('Start game');
            expect(viewSnapshot.joinButton).withContext('Should display the Join button').toBeDefined();
            expect(viewSnapshot.joinButton.nativeElement.textContent)
                .withContext('Should display the Join button')
                .toBe('Join game');
        }));

        it('should be able to start a new game', fakeAsync(() => {
            initComponent();
            fixture.detectChanges();

            let viewSnapshot = view();

            viewSnapshot.startButton.nativeElement.click();
            tick();

            mockRemoteGameCreated$.next({ code: 'CREATED-GAME', status: 'NEW', pods: [], turn: 'DOWN' });
            tick();

            fixture.detectChanges();
            viewSnapshot = view();

            expect(viewSnapshot.newGameCode)
                .withContext('Should display the new game code after creating a game.')
                .toBeDefined();
            expect(viewSnapshot.newGameCode.nativeElement.textContent)
                .withContext('Displayed code should equal the code returned by the API.')
                .toBe('CREATED-GAME');
            expect(location.path())
                .withContext('Should stay on start page while the game has not changed its status to PLAYING.')
                .toBe('');

            mockRemoteOpponent$.next({ code: 'CREATED-GAME', pods: [], status: 'PLAYING', turn: 'DOWN' });
            tick();

            expect(location.path())
                .withContext('Should navigate to /game after a created game changed status to PLAYING')
                .toBe('/game');
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
