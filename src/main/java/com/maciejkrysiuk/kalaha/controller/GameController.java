package com.maciejkrysiuk.kalaha.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.maciejkrysiuk.kalaha.bean.Game;
import com.maciejkrysiuk.kalaha.bean.UserSession;
import com.maciejkrysiuk.kalaha.type.GameStatus;
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
    private SimpMessagingTemplate simpMessagingTemplate;

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
            throw NO_PLAYING_GAME_EXC;
        }
    }

    @GetMapping("/role")
    public PlayerRole getGameRole() {
        if (this.session.isPlayingGame()) {
            return this.session.getGameRole();
        } else {
            throw NO_PLAYING_GAME_EXC;
        }
    }

    @GetMapping("/status")
    public GameStatus getGameStatus() {
        if (this.session.isPlayingGame()) {
            return this.session.getPlayedGame().getStatus();
        } else {
            throw NO_PLAYING_GAME_EXC;
        }
    }

    @PostMapping("/move/{field}")
    public Game move(@PathVariable int field) {
        if (this.session.isPlayingGame()) {
            final Game updatedGame = this.session.move(field);

            // Notify live game update queue about the game change.
            this.simpMessagingTemplate.convertAndSend("/queue/game-" + updatedGame.getCode(), updatedGame);

            return updatedGame;
        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Not playing any game at the moment.");
        }
    }

    @GetMapping("/turn")
    public PlayerRole getGameTurn() {
        if (this.session.isPlayingGame()) {
            return this.session.getPlayedGame().getTurn();
        } else {
            throw NO_PLAYING_GAME_EXC;
        }
    }
}
