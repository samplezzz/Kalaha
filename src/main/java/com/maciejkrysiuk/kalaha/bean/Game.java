package com.maciejkrysiuk.kalaha.bean;

import com.maciejkrysiuk.kalaha.type.GameStatus;

public class Game implements Comparable<Game> {

    private String code;
    private GameStatus status;

    public Game(String code) {
        // TODO: Add assertion for not null.
        this.code = code;
        this.status = GameStatus.NEW;
    }

    public String getCode() {
        return this.code;
    }

    @Override()
    public int compareTo(Game other) {
        return this.code.compareTo(other.code);
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    @Override
    public boolean equals(Object other) {
        // TODO: Check if this gets nicer in JDK17
        return other instanceof Game && ((Game) other).getCode().equals(this.code);
    }

    @Override
    public int hashCode() {
        return this.code.hashCode();
    }
}
