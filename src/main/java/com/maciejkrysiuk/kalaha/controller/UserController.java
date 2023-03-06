package com.maciejkrysiuk.kalaha.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/user")
public class UserController {

    @GetMapping("/")
    public void init() {
        System.out.println("New user active.");
    }

    @PostMapping("/game")
    public void createGame() {
        System.out.println("User create a new game.");
    }
}
