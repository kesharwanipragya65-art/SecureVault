package com.securevault.backend.util;

import jakarta.servlet.http.HttpServletRequest;

public class RequestMetadataUtil {

    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "Unknown";
        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
        };
        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0].trim();
            }
        }
        String remote = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(remote) || "::1".equals(remote)) {
            return "127.0.0.1 (localhost)";
        }
        return remote != null ? remote : "Unknown";
    }

    public static String extractDeviceInfo(HttpServletRequest request) {
        if (request == null) return "Unknown Device";
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.isEmpty()) return "Unknown Device";

        String os = "Unknown OS";
        if (ua.contains("Windows")) os = "Windows PC";
        else if (ua.contains("Macintosh") || ua.contains("Mac OS")) os = "macOS";
        else if (ua.contains("Android")) os = "Android Mobile";
        else if (ua.contains("iPhone") || ua.contains("iPad")) os = "iOS Device";
        else if (ua.contains("Linux")) os = "Linux PC";

        return os;
    }

    public static String extractBrowser(HttpServletRequest request) {
        if (request == null) return "Unknown Browser";
        String ua = request.getHeader("User-Agent");
        if (ua == null || ua.isEmpty()) return "Unknown Browser";

        if (ua.contains("Edg/")) return "Microsoft Edge";
        if (ua.contains("Chrome/")) return "Google Chrome";
        if (ua.contains("Firefox/")) return "Mozilla Firefox";
        if (ua.contains("Safari/") && !ua.contains("Chrome")) return "Apple Safari";
        if (ua.contains("Opera") || ua.contains("OPR/")) return "Opera";
        return "Standard Browser";
    }
}
