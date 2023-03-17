package com.maciejkrysiuk.kalaha.type;

public enum PlayerRole {
    UP,
    DOWN;

    public static PlayerRole oppositeRole(PlayerRole toRole) {
        if (toRole == null) {
            return null;
        }
        return toRole.equals(PlayerRole.UP) ? PlayerRole.DOWN : PlayerRole.UP;
    }
}
