package com.maciejkrysiuk.kalaha.controller;

import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.service.PlaygroundService;
import com.maciejkrysiuk.kalaha.type.GameStatus;

@RestController()
@RequestMapping("/user")
public class UserController {

    @Autowired
    private PlaygroundService playground;
    @Autowired
    private UserSession session;

    @GetMapping("/")
    public void init() {
        System.out.println("New user active.");
    }

    /**
     * Creates a new game owned by the requester.
     * 
     * @return A {@link GameStatus.NEW} {@link Game} that is pending for another
     *         player to join.
     */
    @PostMapping("/game")
    public Game createGame() {
        System.out.println("User create a new game.");
        if (!this.session.isPlayingGame()) {
            return this.playground.createNewGame();
        } else {
            return this.session.getPlayedGame();
        }
    }

    /**
     * Returns a complete object of a {@link Game} played by the requester.
     * 
     * @param code The code of the requested game.
     * @return Details of the requester's {@link Game}.
     */
    @GetMapping("/game/{code}")
    public Game getGame(@PathVariable final String code) {
        if (this.session.isPlayingGameWithCode(code)) {
            return this.session.getPlayedGame();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new NoSuchElementException("Game not found.");
        }
    }

    @GetMapping("/game/{code}/status")
    public GameStatus getGameStatus(@PathVariable final String code) {
        if (this.session.isPlayingGameWithCode(code)) {
            return this.session.getPlayedGame().getStatus();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new NoSuchElementException("Game not found.");
        }
    }

    @PostMapping("/game/{code}")
    public void joinGame(@PathVariable final String code) {
        try {
            this.playground.joinNewGame(code);
        } catch (Exception e) {
            // TODO: Cause appropriate HTTP code
            throw new IllegalStateException("");
        }
    }
}
