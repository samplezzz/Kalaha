package com.maciejkrysiuk.kalaha.bean;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.SessionScope;

/**
 * 
 */
@Component
@SessionScope
public class UserSession {

    private Game playedGame;

    public Game getPlayedGame() {
        return playedGame;
    }

    public void setPlayedGame(Game game) {
        this.playedGame = game;
    }

    public boolean isPlayingGame() {
        return this.playedGame != null;
    }

    public boolean isPlayingGameWithCode(String code) {
        // TODO: Check if there's a shorter check in JDK17
        return code != null && code.trim().equals("") && code.equals(this.playedGame.getCode());
    }
}
