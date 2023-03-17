package com.maciejkrysiuk.kalaha.controller;

import static com.maciejkrysiuk.kalaha.type.PlayerRole.oppositeRole;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.service.GameQueue;
import com.maciejkrysiuk.kalaha.service.PlaygroundService;
import com.maciejkrysiuk.kalaha.type.GameStatus;

/**
 * API endpoint for creating and joining games.
 * 
 */
@RestController()
@RequestMapping("/user")
public class UserController {

    @Autowired
    private GameQueue gameQueue;

    @Autowired
    private PlaygroundService playground;

    @Autowired
    private UserSession session;

    /**
     * Creates a new game owned by the requester.
     * 
     * @return A {@link GameStatus.NEW} {@link Game} that is pending for another
     *         player to join.
     */
    @PostMapping("/start")
    public Game createGame() {
        if (!this.session.isPlayingGame()) {
            final Game newGame = this.playground.createNewGame();
            this.session.setPlayedGame(newGame);
            this.session.setGameRole(newGame.getTurn());
            return newGame;
        } else {
            return this.session.getPlayedGame();
        }
    }

    /**
     * Joins a {@link Game} created by other user.
     * 
     * @param code The code of the {@link Game} to join.
     */
    @PostMapping("/join/{code}")
    public Game joinGame(@PathVariable final String code) {
        try {
            final Game joinedGame = this.playground.joinGame(code);

            this.session.setPlayedGame(joinedGame);
            this.session.setGameRole(oppositeRole(joinedGame.getTurn()));

            this.gameQueue.notifyGameUpdate(joinedGame);

            return joinedGame;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Could not join specified game.", e);
        }
    }
}
