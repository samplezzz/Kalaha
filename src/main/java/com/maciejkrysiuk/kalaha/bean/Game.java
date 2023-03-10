package com.maciejkrysiuk.kalaha.bean;

import static com.maciejkrysiuk.kalaha.type.PlayerRole.DOWN;
import static com.maciejkrysiuk.kalaha.type.PlayerRole.UP;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.maciejkrysiuk.kalaha.type.GameStatus;
import com.maciejkrysiuk.kalaha.type.PlayerRole;

/**
 * 
 */
public class Game implements Comparable<Game> {

    private final int FIELD_SIZE = 14;
    private final int DOWN_BIG_POD_INDEX = 6;
    private final int UP_BIG_POD_INDEX = 13;

    private final int INITIAL_BEANS_PER_POD = 6;

    private String code;
    private int[] pods;

    private GameStatus status;
    private PlayerRole turn;

    public Game(String code) {
        // TODO: Add assertion for not null.
        this.code = code;

        this.pods = new int[FIELD_SIZE];
        Arrays.fill(this.pods, INITIAL_BEANS_PER_POD);
        this.pods[DOWN_BIG_POD_INDEX] = this.pods[UP_BIG_POD_INDEX] = 0;

        this.status = GameStatus.NEW;
        this.turn = PlayerRole.DOWN;
    }

    /*
     * Getters & setters
     */

    public String getCode() {
        return this.code;
    }

    public int[] getPods() {
        return this.pods;
    }

    public GameStatus getStatus() {
        return status;
    }

    public void setStatus(GameStatus status) {
        this.status = status;
    }

    public PlayerRole getTurn() {
        return this.turn;
    }

    /*
     * Object utils
     */

    @Override()
    public int compareTo(Game other) {
        return this.code.compareTo(other.code);
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

    public Game move(final int sourcePod, final PlayerRole actor) {

        // Validation

        if (!this.turn.equals(actor)) {
            throw new IllegalStateException("This move is not authorised.");
        }
        if (!isOwnPod(sourcePod, actor) || sourcePod == getOwnBigPod(actor)) {
            throw new IllegalArgumentException("This field cannot be moved.");
        }

        // The move

        final PlayerRole nextPlayer = this.doMove(sourcePod, actor);
        this.turn = nextPlayer;

        return this;
    }

    private PlayerRole doMove(final int sourcePod, final PlayerRole actor) {
        final int movedBeans = removeBeans(sourcePod);
        final List<Integer> targetPods = getTargetPods(sourcePod, movedBeans, actor);

        // By default, next player is the opposite player.
        PlayerRole nextPlayer = actor.equals(DOWN) ? UP : DOWN;

        // Move

        targetPods.forEach(target -> this.pods[target]++);
        final int lastDistributionPod = targetPods.get(targetPods.size() - 1);

        if (lastDistributionPod == (getOwnBigPod(actor))) {
            // Keep the actor's turn
            nextPlayer = actor;
        } else if (isOwnPod(lastDistributionPod, actor) && this.pods[lastDistributionPod] == 1) {
            // Bonus move
            final int bonusMovedBeans = removeBeans(lastDistributionPod, getOppositePod(lastDistributionPod));
            this.pods[getOwnBigPod(actor)] += bonusMovedBeans;
        }

        return nextPlayer;
    }

    private int removeBeans(final int... fields) {
        int beans = 0;
        for (int field : fields) {
            beans += this.pods[field];
            this.pods[field] = 0;
        }
        return beans;
    }

    private List<Integer> getTargetPods(final int sourcePodIndex, final int movedBeans, PlayerRole actor) {
        final List<Integer> targetPods = new ArrayList<Integer>(movedBeans);
        final int opponentsBigPodIndex = getOponnentsBigPod(actor);

        int targetPodIndex = nextPod(sourcePodIndex);
        while (targetPods.size() < movedBeans) {
            if (targetPodIndex != opponentsBigPodIndex) {
                targetPods.add(targetPodIndex);
            }
            targetPodIndex = nextPod(targetPodIndex);
        }

        return targetPods;
    }

    private int getOwnBigPod(PlayerRole actor) {
        return actor.equals(DOWN) ? DOWN_BIG_POD_INDEX : UP_BIG_POD_INDEX;
    }

    private int getOponnentsBigPod(PlayerRole actor) {
        return actor.equals(DOWN) ? UP_BIG_POD_INDEX : DOWN_BIG_POD_INDEX;
    }

    private int getOppositePod(int podIndex) {
        return FIELD_SIZE - 2 - podIndex;
    }

    private boolean isOwnPod(int field, PlayerRole actor) {
        return isDownPod(field) && actor.equals(PlayerRole.DOWN) || isUpPod(field) && actor.equals(PlayerRole.UP);
    }

    private boolean isDownPod(int field) {
        return field <= DOWN_BIG_POD_INDEX;
    }

    private boolean isUpPod(int field) {
        return field > DOWN_BIG_POD_INDEX;
    }

    private int nextPod(int podIndex) {
        return (podIndex + 1) % FIELD_SIZE;
    }
}
