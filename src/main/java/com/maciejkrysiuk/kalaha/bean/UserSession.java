package com.maciejkrysiuk.kalaha.bean;

import java.util.Objects;
import java.util.Optional;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import com.maciejkrysiuk.kalaha.type.PlayerRole;

/**
 * A service that just wraps user's {@link Game} in session
 * and associates user's {@link PlayerRole} with it.
 * 
 */
@Component
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class UserSession {

    private PlayerRole gameRole;
    private Game playedGame;

    /*
     * Getters & setters
     */

    public PlayerRole getGameRole() {
        return gameRole;
    }

    public void setGameRole(PlayerRole gameRole) {
        this.gameRole = gameRole;
    }

    public Game getPlayedGame() {
        return playedGame;
    }

    public void setPlayedGame(Game game) {
        this.playedGame = game;
    }

    /*
     * Business logic
     */

    public boolean isPlayingGame() {
        return this.playedGame != null;
    }

    public boolean isPlayingGameWithCode(String code) {
        return this.playedGame != null && Objects.equals(this.playedGame.getCode(), code);
    }

    public Game move(int field) {
        return Optional.of(this.playedGame)
                .orElseThrow(() -> new IllegalStateException("Cannot make a move because no game exists in session."))
                .move(field, this.gameRole);
    }
}
