package com.maciejkrysiuk.kalaha.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.service.GameQueue;
import com.maciejkrysiuk.kalaha.type.PlayerRole;

/**
 * API endpoint for playing a {@link Game}.
 * 
 */
@RestController()
@RequestMapping("/game")
public class GameController {

    private final ErrorResponseException NO_PLAYING_GAME_EXC = new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Not playing any game at the moment.");

    @Autowired
    private GameQueue gameQueue;

    @Autowired
    private UserSession session;

    /**
     * Returns a complete object of a {@link Game} played by the requester.
     * 
     * @return Payload of the requester's {@link Game}.
     */
    @GetMapping("")
    public Game getGame() {
        return assertUserIsPlaying().getPlayedGame();
    }

    /**
     * Returns the {@link PlayerRole} of the requester
     * in the {@link Game} that exists in session.
     * 
     * @return {@link PlayerRole} of the requester
     */
    @GetMapping("/role")
    public PlayerRole getGameRole() {
        return assertUserIsPlaying().getGameRole();
    }

    /**
     * Makes a move by the requestor
     * in the {@link Game} that exists in session.
     * 
     * @param pod Number of the pod the requestor moves the beans from
     * @return
     */
    @PostMapping("/move/{pod}")
    public Game move(@PathVariable int pod) {
        assertUserIsPlaying();

        final Game updatedGame = this.session.move(pod);
        this.gameQueue.notifyGameUpdate(updatedGame);

        return updatedGame;
    }

    private UserSession assertUserIsPlaying() {
        if (!this.session.isPlayingGame()) {
            throw NO_PLAYING_GAME_EXC;
        }
        return this.session;
    }
}
