package com.securevault.backend.controller;
import com.securevault.backend.dto.ShareResponse; import com.securevault.backend.entity.User; import com.securevault.backend.repository.UserRepository; import com.securevault.backend.service.ShareService;
import org.springframework.http.*; import org.springframework.security.core.Authentication; import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.List;
@RestController @RequestMapping("/api/sharing") @CrossOrigin(origins="http://localhost:5173")
public class ShareController{
    private final ShareService service; private final UserRepository users;
    public ShareController(ShareService service,UserRepository users){this.service=service;this.users=users;}
    private User user(Authentication a){return users.findByEmail(a.getName()).orElseThrow(()->new RuntimeException("User not found"));}
    @PostMapping("/share") public ResponseEntity<?> share(@RequestParam Long credentialId,@RequestParam String email,@RequestParam String permission,@RequestParam(required=false) String expiresAt,Authentication a){try{LocalDateTime exp=expiresAt==null||expiresAt.isBlank()?null:LocalDateTime.parse(expiresAt);return ResponseEntity.ok(service.share(credentialId,email,permission,exp,user(a)));}catch(Exception e){return ResponseEntity.badRequest().body(e.getMessage());}}
    @GetMapping("/mine") public List<ShareResponse> mine(Authentication a){return service.mine(user(a));}
    @GetMapping("/by-me") public List<ShareResponse> sharedByMe(Authentication a){return service.sharedByMe(user(a));}
    @GetMapping("/{id}") public ResponseEntity<?> get(@PathVariable Long id,Authentication a){try{return ResponseEntity.ok(service.getForUser(id,user(a)));}catch(RuntimeException e){return ResponseEntity.status(403).body(e.getMessage());}}
    @PutMapping("/{id}") public ResponseEntity<?> edit(@PathVariable Long id,@RequestParam String title,@RequestParam String username,@RequestParam String password,Authentication a){try{return ResponseEntity.ok(service.updateShared(id,title,username,password,user(a)));}catch(RuntimeException e){return ResponseEntity.status(403).body(e.getMessage());}}
    @DeleteMapping("/{id}") public ResponseEntity<String> revoke(@PathVariable Long id,Authentication a){try{service.revoke(id,user(a));return ResponseEntity.ok("Sharing removed");}catch(RuntimeException e){return ResponseEntity.status(403).body(e.getMessage());}}
}
