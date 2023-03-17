package com.maciejkrysiuk.kalaha.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.maciejkrysiuk.kalaha.bean.Game;

/**
 * Event service for {@link Game} updates.
 */
@Service
public class GameQueue {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    /**
     * Sends notification abotu updated game.
     * 
     * @param updatedGame Updated game
     */
    public void notifyGameUpdate(Game updatedGame) {

        this.simpMessagingTemplate.convertAndSend("/queue/game-" + updatedGame.getCode(), updatedGame);
    }
}
