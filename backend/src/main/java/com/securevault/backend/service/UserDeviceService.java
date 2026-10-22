package com.securevault.backend.service;

import com.securevault.backend.entity.User;
import com.securevault.backend.entity.UserDevice;
import com.securevault.backend.repository.UserDeviceRepository;
import com.securevault.backend.util.RequestMetadataUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserDeviceService {

    private final UserDeviceRepository deviceRepository;

    public UserDeviceService(UserDeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @Transactional
    public UserDevice trackDevice(User user, HttpServletRequest request) {
        if (user == null) return null;
        String os = RequestMetadataUtil.extractDeviceInfo(request);
        String browser = RequestMetadataUtil.extractBrowser(request);
        String ip = RequestMetadataUtil.extractClientIp(request);
        String deviceName = os + " (" + browser + ")";

        Optional<UserDevice> existing = deviceRepository.findByUserAndDeviceName(user, deviceName);
        LocalDateTime now = LocalDateTime.now();

        if (existing.isPresent()) {
            UserDevice d = existing.get();
            d.setLastActive(now);
            d.setIpAddress(ip);
            return deviceRepository.save(d);
        } else {
            String deviceType = os.toLowerCase().contains("mobile") ? "Mobile" : "Desktop";
            UserDevice newDevice = new UserDevice(
                user,
                deviceName,
                deviceType,
                ip,
                now,
                false, // default not trusted until user confirms
                false, // not revoked
                now
            );
            return deviceRepository.save(newDevice);
        }
    }

    public List<UserDevice> getUserDevices(User user) {
        return deviceRepository.findByUserOrderByLastActiveDesc(user);
    }

    @Transactional
    public UserDevice trustDevice(Long deviceId, User user) {
        UserDevice d = deviceRepository.findByIdAndUser(deviceId, user)
            .orElseThrow(() -> new RuntimeException("Device not found"));
        d.setTrusted(true);
        return deviceRepository.save(d);
    }

    @Transactional
    public UserDevice revokeDevice(Long deviceId, User user) {
        UserDevice d = deviceRepository.findByIdAndUser(deviceId, user)
            .orElseThrow(() -> new RuntimeException("Device not found"));
        d.setRevoked(true);
        d.setTrusted(false);
        return deviceRepository.save(d);
    }
}
