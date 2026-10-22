package com.securevault.backend.controller;
import org.springframework.web.bind.annotation.*;
@RestController @CrossOrigin(origins="http://localhost:5173")
public class ProtectedController{@GetMapping("/api/protected") public String protectedEndpoint(){return "You have accessed a protected endpoint!";}}
