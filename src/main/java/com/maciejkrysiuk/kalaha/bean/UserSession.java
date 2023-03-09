package com.maciejkrysiuk.kalaha.bean;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Component;

import com.maciejkrysiuk.kalaha.type.PlayerRole;

/**
 * 
 */
@Component
@Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
public class UserSession {

    private Game playedGame;
    private PlayerRole userRole;

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
        // TODO: Check if there's a shorter check in JDK17
        return code != null && code.trim().equals("") && code.equals(this.playedGame.getCode());
    }

    public Game move(int field) {
        return this.playedGame.move(field, this.userRole);
    }
}
