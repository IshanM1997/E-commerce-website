package com.ecommerce.dto;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderDto {
    private Long id;
    private String customerName;
    private String status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private List<OrderItemDto> orderItems;
    private LocalDateTime createdAt;
}
