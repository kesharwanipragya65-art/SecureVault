package com.securevault.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class EncryptionService {
    private static final String PREFIX="ENC:";
    private final SecretKeySpec key;
    public EncryptionService(@Value("${securevault.encryption.key}") String base64Key){
        byte[] bytes=Base64.getDecoder().decode(base64Key);
        if(bytes.length!=32) throw new IllegalArgumentException("Encryption key must decode to exactly 32 bytes");
        key=new SecretKeySpec(bytes,"AES");
    }
    public String encrypt(String plain){
        try{
            byte[] iv=new byte[12]; new SecureRandom().nextBytes(iv);
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE,key,new GCMParameterSpec(128,iv));
            byte[] encrypted=cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8));
            return PREFIX+Base64.getEncoder().encodeToString(iv)+":"+Base64.getEncoder().encodeToString(encrypted);
        }catch(Exception e){throw new RuntimeException("Encryption failed",e);}
    }
    public String decrypt(String value){
        if(value==null || !value.startsWith(PREFIX)) return value;
        try{
            String[] parts=value.substring(PREFIX.length()).split(":",2);
            byte[] iv=Base64.getDecoder().decode(parts[0]);
            byte[] encrypted=Base64.getDecoder().decode(parts[1]);
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,iv));
            return new String(cipher.doFinal(encrypted),StandardCharsets.UTF_8);
        }catch(Exception e){throw new RuntimeException("Decryption failed",e);}
    }
    public boolean isEncrypted(String value){return value!=null && value.startsWith(PREFIX);}
}
