package com.maciejkrysiuk.kalaha.bean;

import com.maciejkrysiuk.kalaha.type.GameStatus;
import com.maciejkrysiuk.kalaha.type.PlayerRole;

/**
 * 
 */
public class Game implements Comparable<Game> {

    private String code;
    private int[] pods = { 0, 6, 6, 6, 6, 6, 6, 0, 6, 6, 6, 6, 6, 6 };
    private final int FIELD_SIZE = this.pods.length;
    private GameStatus status;
    private PlayerRole turn;

    public Game(String code) {
        // TODO: Add assertion for not null.
        this.code = code;
        this.status = GameStatus.NEW;
    }

    /*
     * Getters & setters
     */

    public String getCode() {
        return this.code;
    }

    public PlayerRole getTurn() {
        return turn;
    }

    /*
     * Object utils
     */

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

    /*
     * Business logic
     */

    public Game move(final int field, final PlayerRole actor) {

        // Validation

        if (!this.turn.equals(actor)) {
            throw new IllegalAccessError("This move is not authorised.");
        }
        if (field < 0 || field > FIELD_SIZE/* Implement proper check of the field */) {
            throw new IllegalArgumentException("This field cannot be moved.");
        }

        this.doMove(field);

        // Update the turn
        this.turn = this.turn.equals(PlayerRole.UP) ? PlayerRole.DOWN : PlayerRole.UP;

        return this;
    }

    // TODO: Implement
    private void doMove(int field) {
        final int nextField = (field + 1) % FIELD_SIZE;
        this.pods[nextField] += this.pods[field];
        this.pods[field] = 0;
    }
}
