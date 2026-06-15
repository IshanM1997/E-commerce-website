package com.ecommerce.service;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.dto.ProductRequest;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    public List<ProductDto> getAllActiveProducts() {
        return productRepository.findByActiveTrue().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto getProduct(Long id) {
        Product p = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        return toDto(p);
    }

    public List<ProductDto> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public List<ProductDto> getByCategory(String category) {
        return productRepository.findByCategory(category).stream().map(this::toDto).collect(Collectors.toList());
    }

    // Seller: list their own product
    public ProductDto listProduct(ProductRequest request, String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow();
        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .imageUrl(request.getImageUrl())
                .stock(request.getStock())
                .externalProduct(false)
                .seller(seller)
                .active(true)
                .build();
        return toDto(productRepository.save(product));
    }

    // Seller: get their own products
    public List<ProductDto> getSellerProducts(String sellerEmail) {
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow();
        return productRepository.findBySeller(seller).stream().map(this::toDto).collect(Collectors.toList());
    }

    // Seller: update their product
    public ProductDto updateProduct(Long id, ProductRequest request, String sellerEmail) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        User seller = userRepository.findByEmail(sellerEmail).orElseThrow();
        if (!product.getSeller().getId().equals(seller.getId())) {
            throw new RuntimeException("Not authorized to edit this product");
        }
        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setStock(request.getStock());
        return toDto(productRepository.save(product));
    }

    // Admin: toggle product active status
    public ProductDto toggleProductStatus(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(!product.isActive());
        return toDto(productRepository.save(product));
    }

    // Admin: get all products
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDto toDto(Product p) {
        return ProductDto.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .price(p.getPrice())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .rating(p.getRating())
                .ratingCount(p.getRatingCount())
                .stock(p.getStock())
                .externalProduct(p.isExternalProduct())
                .sellerId(p.getSeller() != null ? p.getSeller().getId() : null)
                .sellerName(p.getSeller() != null ? p.getSeller().getFullName() : "External")
                .createdAt(p.getCreatedAt())
                .build();
    }
}
