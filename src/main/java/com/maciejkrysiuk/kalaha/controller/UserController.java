package com.maciejkrysiuk.kalaha.controller;

import org.springframework.beans.factory.annotation.Autowired;
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

    /**
     * Creates a new game owned by the requester.
     * 
     * @return A {@link GameStatus.NEW} {@link Game} that is pending for another
     *         player to join.
     */
    @PostMapping("/play")
    public Game createGame() {
        System.out.println("User create a new game.");
        if (!this.session.isPlayingGame()) {
            return this.playground.createNewGame();
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
            final Game joinedGame = this.playground.joinNewGame(code);
            this.session.setPlayedGame(joinedGame);
            return joinedGame;
        } catch (Exception e) {
            // TODO: Cause appropriate HTTP code
            throw new IllegalArgumentException("Could not join the specified game.", e);
        }
    }
}
