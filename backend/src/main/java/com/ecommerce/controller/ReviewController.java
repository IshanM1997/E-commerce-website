package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {
    @Autowired private ReviewService reviewService;

    @PostMapping("/customer/reviews")
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request, Authentication auth) {
        try { return ResponseEntity.ok(reviewService.addReview(request, auth.getName())); }
        catch (Exception e) { return ResponseEntity.badRequest().body(e.getMessage()); }
    }

    @GetMapping("/products/public/{productId}/reviews")
    public ResponseEntity<List<ReviewDto>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }
}
