package com.maciejkrysiuk.kalaha.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.type.GameStatus;

public class PlaygroundServiceTest {

    private PlaygroundService service;

    @BeforeEach
    public void initEach() {
        service = new PlaygroundService();
    }

    @Test
    public void joinGame() {
        assertEquals(0, service.newGames.size());

        Game newGame = service.createNewGame();
        final String gameCode = newGame.getCode();

        assertEquals(1, service.newGames.size());
        assertEquals(GameStatus.NEW, newGame.getStatus());

        try {
            service.joinGame("NON-EXISTING-GAME");
            fail("Should throw exception when joining non existing hgame.");
        } catch (Exception e) {
        }

        assertEquals(1, service.newGames.size());

        Game joinedGame = service.joinGame(gameCode);

        assertSame(newGame, joinedGame);
        assertEquals(GameStatus.PLAYING, joinedGame.getStatus());
        assertEquals(0, service.newGames.size());
    }
}
