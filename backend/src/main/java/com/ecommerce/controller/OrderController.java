package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
public class OrderController {
    @Autowired private OrderService orderService;

    @PostMapping("/api/customer/orders")
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest request, Authentication auth) {
        try { return ResponseEntity.ok(orderService.placeOrder(request, auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/api/customer/orders")
    public ResponseEntity<List<OrderDto>> myOrders(Authentication auth) { return ResponseEntity.ok(orderService.getMyOrders(auth.getName())); }

    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<OrderDto>> allOrders() { return ResponseEntity.ok(orderService.getAllOrders()); }

    @PatchMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<OrderDto> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, body.get("status")));
    }
}
