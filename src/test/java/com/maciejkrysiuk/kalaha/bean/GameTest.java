package com.maciejkrysiuk.kalaha.bean;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.BeforeEach;

import static com.maciejkrysiuk.kalaha.type.PlayerRole.DOWN;
import static com.maciejkrysiuk.kalaha.type.PlayerRole.UP;

import org.junit.jupiter.api.Test;

public class GameTest {

    private Game game;

    @BeforeEach
    public void initEach() {
        game = new Game("MOCK-GAME");
    }

    @Test
    public void move() {
        game.move(1, DOWN);

        assertArrayEquals(game.getPods(), new int[] { 6, 0, 7, 7, 7, 7, 1, 7, 6, 6, 6, 6, 6, 0 });
        assertEquals(game.getTurn(), UP);
    }

    @Test
    public void moveAndEndInOwnBigPod() {
        game.move(0, DOWN);

        assertArrayEquals(game.getPods(), new int[] { 0, 7, 7, 7, 7, 7, 1, 6, 6, 6, 6, 6, 6, 0 });
        assertEquals(game.getTurn(), DOWN);
    }

    @Test
    public void moveIllegalPlayer() {
        try {
            game.move(1, UP);
            fail("Illegal player should throw a move exception.");
        } catch (Exception e) {
        }
    }

    @Test
    public void moveIllegalPod() {
        try {
            game.move(10, DOWN);
            fail("Illegal source pod should throw a move exception.");
        } catch (Exception e) {
        }

        try {
            game.move(6, DOWN);
            fail("Illegal source pod should throw a move exception.");
        } catch (Exception e) {
        }
    }
}
