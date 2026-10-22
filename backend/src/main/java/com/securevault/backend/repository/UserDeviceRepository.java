package com.securevault.backend.repository;

import com.securevault.backend.entity.User;
import com.securevault.backend.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDeviceRepository extends JpaRepository<UserDevice, Long> {
    List<UserDevice> findByUserOrderByLastActiveDesc(User user);
    Optional<UserDevice> findByUserAndDeviceName(User user, String deviceName);
    Optional<UserDevice> findByIdAndUser(Long id, User user);
    long countByUser(User user);
    long countByUserAndRevokedFalse(User user);
}
