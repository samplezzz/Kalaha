package com.maciejkrysiuk.kalaha.service;

import java.util.Collections;
import java.util.SortedSet;
import java.util.TreeSet;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.type.GameStatus;

@Service
public class PlaygroundService {

    private SortedSet<Game> newGames = Collections.synchronizedSortedSet(new TreeSet<>());

    public Game createNewGame() {
        // TODO: Generate shorter game code
        final Game newGame = new Game(UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        this.newGames.add(newGame);
        return newGame;
    }

    public Game findNewGame(String code) {
        // TODO: Find more efficient search
        // TODO: Has to throw an exception if game with code not found.
        return this.newGames.stream().filter(g -> g.getCode().equals(code)).findFirst().get();
    }

    public Game joinNewGame(String code) {
        final Game joinedGame = this.findNewGame(code);
        if (this.newGames.remove(joinedGame)) {
            joinedGame.setStatus(GameStatus.PLAYING);
            // TODO: The creator of the game needs to be notified at this point.
            return joinedGame;
        } else {
            // TODO: Think of a right type of this exception.
            throw new IllegalStateException("The game you tried to join is not available anymore.");
        }
    }
}
