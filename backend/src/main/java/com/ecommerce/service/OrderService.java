package com.ecommerce.service;

import com.ecommerce.dto.*;
import com.ecommerce.entity.*;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public OrderDto placeOrder(OrderRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail).orElseThrow();

        Order order = Order.builder()
                .customer(customer)
                .shippingAddress(request.getShippingAddress())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getTitle());
            }

            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .build();
            items.add(item);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setOrderItems(items);
        order.setTotalAmount(total);
        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    public List<OrderDto> getMyOrders(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail).orElseThrow();
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customer)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<OrderDto> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return toDto(orderRepository.save(order));
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> itemDtos = order.getOrderItems() != null ?
                order.getOrderItems().stream().map(item -> OrderItemDto.builder()
                        .productId(item.getProduct().getId())
                        .productTitle(item.getProduct().getTitle())
                        .productImage(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .build()).collect(Collectors.toList()) : List.of();

        return OrderDto.builder()
                .id(order.getId())
                .customerName(order.getCustomer().getFullName())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .orderItems(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
