package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ProductController {
    @Autowired private ProductService productService;

    @GetMapping("/api/products/public/all")
    public ResponseEntity<List<ProductDto>> getAll() { return ResponseEntity.ok(productService.getAllActiveProducts()); }

    @GetMapping("/api/products/public/{id}")
    public ResponseEntity<ProductDto> getOne(@PathVariable Long id) { return ResponseEntity.ok(productService.getProduct(id)); }

    @GetMapping("/api/products/public/search")
    public ResponseEntity<List<ProductDto>> search(@RequestParam String q) { return ResponseEntity.ok(productService.searchProducts(q)); }

    @GetMapping("/api/products/public/categories")
    public ResponseEntity<List<String>> categories() { return ResponseEntity.ok(productService.getAllCategories()); }

    @GetMapping("/api/products/public/category/{cat}")
    public ResponseEntity<List<ProductDto>> byCategory(@PathVariable String cat) { return ResponseEntity.ok(productService.getByCategory(cat)); }

    @PostMapping("/api/seller/products")
    public ResponseEntity<ProductDto> listProduct(@RequestBody ProductRequest request, Authentication auth) {
        return ResponseEntity.ok(productService.listProduct(request, auth.getName()));
    }

    @GetMapping("/api/seller/products")
    public ResponseEntity<List<ProductDto>> myProducts(Authentication auth) { return ResponseEntity.ok(productService.getSellerProducts(auth.getName())); }

    @PutMapping("/api/seller/products/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductRequest request, Authentication auth) {
        return ResponseEntity.ok(productService.updateProduct(id, request, auth.getName()));
    }

    @GetMapping("/api/admin/products")
    public ResponseEntity<List<ProductDto>> adminGetAll() { return ResponseEntity.ok(productService.getAllProducts()); }

    @PatchMapping("/api/admin/products/{id}/toggle")
    public ResponseEntity<ProductDto> toggleStatus(@PathVariable Long id) { return ResponseEntity.ok(productService.toggleProductStatus(id)); }
}
