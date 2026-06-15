package com.ecommerce.service;

import com.ecommerce.dto.ReviewDto;
import com.ecommerce.dto.ReviewRequest;
import com.ecommerce.entity.*;
import com.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    public ReviewDto addReview(ReviewRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail).orElseThrow();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (reviewRepository.existsByProductAndCustomer(product, customer)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .product(product)
                .customer(customer)
                .comment(request.getComment())
                .rating(request.getRating())
                .build();

        return toDto(reviewRepository.save(review));
    }

    public List<ReviewDto> getProductReviews(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return reviewRepository.findByProduct(product).stream().map(this::toDto).collect(Collectors.toList());
    }

    private ReviewDto toDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .customerName(review.getCustomer().getFullName())
                .comment(review.getComment())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
