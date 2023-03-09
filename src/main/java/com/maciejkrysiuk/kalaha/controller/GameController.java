package com.maciejkrysiuk.kalaha.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.type.GameStatus;

/**
 * API endpoint for playing a {@link Game}.
 * 
 */
@RestController()
@RequestMapping("/game")
public class GameController {

    @Autowired
    private UserSession session;

    /**
     * Returns a complete object of a {@link Game} played by the requester.
     * 
     * @param code The code of the requested game.
     * @return Details of the requester's {@link Game}.
     */
    @GetMapping("")
    public Game getGame() {
        if (this.session.isPlayingGame()) {
            return this.session.getPlayedGame();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new IllegalStateException("Not playing any game at the moment.");
        }
    }

    @GetMapping("/status")
    public GameStatus getGameStatus() {
        if (this.session.isPlayingGame()) {
            return this.session.getPlayedGame().getStatus();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new IllegalStateException("Not playing any game at the moment.");
        }
    }

    @PostMapping("/move/{field}")
    public Game move(@PathVariable int field) {
        if (this.session.isPlayingGame()) {
            return this.session.move(field);
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new IllegalStateException("Not playing any game at the moment.");
        }
    }
}
