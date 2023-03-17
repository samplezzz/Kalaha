package com.maciejkrysiuk.kalaha.service;

import java.util.Collections;
import java.util.NoSuchElementException;
import java.util.SortedMap;
import java.util.TreeMap;

import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.type.GameStatus;

/**
 * Owns and maintains a pool of {@link GameStatus.NEW} {@link Game}s
 * that can be joined.
 * 
 * Makes sure that a {@link Game} is joined synchronously,
 * that is only 2 players can end up playing a {@link Game}.
 */
@Service
public class PlaygroundService {

    public static int GAME_CODE_LENGTH = 6;

    private SortedMap<String, Game> newGames = Collections.synchronizedSortedMap(new TreeMap<>());

    public Game createNewGame() {
        final Game newGame = new Game(RandomStringUtils.randomAlphanumeric(GAME_CODE_LENGTH).toUpperCase());
        this.newGames.put(newGame.getCode(), newGame);
        return newGame;
    }

    public Game joinGame(String code) {
        final Game joinedGame = this.newGames.remove(code);
        if (joinedGame != null) {
            joinedGame.setStatus(GameStatus.PLAYING);
            return joinedGame;
        } else {
            throw new NoSuchElementException("The game you tried to join is not available.");
        }
    }
}
