package com.ecommerce.service;

import com.ecommerce.entity.Product;
import com.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExternalProductSyncService {

    private static final Logger log = LoggerFactory.getLogger(ExternalProductSyncService.class);

    @Autowired private ProductRepository productRepository;
    @Value("${external.api.products}") private String productsApiUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Runs every 24 hours (midnight) to sync external products.
     * Also triggered on startup via ApplicationRunner (see below).
     */
    @Scheduled(cron = "${product.sync.cron}")
    public void syncExternalProducts() {
        log.info("Starting external product sync from FakeStoreAPI...");
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(productsApiUrl))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode products = objectMapper.readTree(response.body());
                List<Product> toSave = new ArrayList<>();

                for (JsonNode node : products) {
                    String externalId = node.get("id").asText();

                    if (!productRepository.existsByExternalId(externalId)) {
                        Product product = Product.builder()
                                .title(node.get("title").asText())
                                .description(node.get("description").asText())
                                .price(new BigDecimal(node.get("price").asText()))
                                .category(node.get("category").asText())
                                .imageUrl(node.get("image").asText())
                                .rating(node.has("rating") ? node.get("rating").get("rate").asDouble() : 0.0)
                                .ratingCount(node.has("rating") ? node.get("rating").get("count").asInt() : 0)
                                .stock(50) // Default stock for external products
                                .externalProduct(true)
                                .externalId(externalId)
                                .active(true)
                                .build();
                        toSave.add(product);
                    }
                }

                if (!toSave.isEmpty()) {
                    productRepository.saveAll(toSave);
                    log.info("Synced {} new products from FakeStoreAPI", toSave.size());
                } else {
                    log.info("No new products to sync. All products already in database.");
                }
            } else {
                log.error("FakeStoreAPI returned status: {}", response.statusCode());
            }
        } catch (Exception e) {
            log.error("Error syncing external products: {}", e.getMessage(), e);
        }
    }
}
