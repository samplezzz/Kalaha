package com.maciejkrysiuk.kalaha.controller;

import java.util.NoSuchElementException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.type.GameStatus;

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
    @GetMapping("/{code}")
    public Game getGame(@PathVariable final String code) {
        if (this.session.isPlayingGameWithCode(code)) {
            return this.session.getPlayedGame();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new NoSuchElementException("Game not found.");
        }
    }

    @GetMapping("/{code}/status")
    public GameStatus getGameStatus(@PathVariable final String code) {
        if (this.session.isPlayingGameWithCode(code)) {
            return this.session.getPlayedGame().getStatus();
        } else {
            // TODO: Cause 404 NOT FOUND
            throw new NoSuchElementException("Game not found.");
        }
    }
}
