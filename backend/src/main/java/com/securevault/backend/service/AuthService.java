package com.securevault.backend.service;
import com.securevault.backend.entity.User; import com.securevault.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service;
@Service public class AuthService{
    private final UserRepository repo; private final PasswordEncoder encoder;
    public AuthService(UserRepository repo,PasswordEncoder encoder){this.repo=repo;this.encoder=encoder;}
    public User register(String name,String email,String password){
        if(name==null||name.isBlank())throw new RuntimeException("Name is required");
        if(email==null||email.isBlank())throw new RuntimeException("Email is required");
        if(password==null||password.isBlank())throw new RuntimeException("Password is required");
        email=email.trim().toLowerCase();
        if(repo.findByEmail(email).isPresent())throw new RuntimeException("Email already registered");
        return repo.save(new User(name.trim(),email,encoder.encode(password)));
    }
    public boolean login(String email,String password){
        User u=repo.findByEmail(email.trim().toLowerCase()).orElseThrow(()->new RuntimeException("Invalid email or password"));
        return encoder.matches(password,u.getPassword());
    }
}
