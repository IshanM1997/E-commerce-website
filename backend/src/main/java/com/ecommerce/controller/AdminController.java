package com.ecommerce.controller;

import com.ecommerce.dto.UserDto;
import com.ecommerce.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> allUsers() { return ResponseEntity.ok(adminService.getAllUsers()); }

    @GetMapping("/users/pending")
    public ResponseEntity<List<UserDto>> pendingUsers() { return ResponseEntity.ok(adminService.getPendingUsers()); }

    @PatchMapping("/users/{id}/approve")
    public ResponseEntity<UserDto> approve(@PathVariable Long id) { return ResponseEntity.ok(adminService.approveUser(id)); }

    @PatchMapping("/users/{id}/reject")
    public ResponseEntity<UserDto> reject(@PathVariable Long id) { return ResponseEntity.ok(adminService.rejectUser(id)); }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDto> changeRole(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return ResponseEntity.ok(adminService.changeUserRole(id, body.get("role")));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) { adminService.deleteUser(id); return ResponseEntity.noContent().build(); }
}
