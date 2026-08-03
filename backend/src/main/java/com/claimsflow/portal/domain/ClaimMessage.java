package com.claimsflow.portal.domain;

import com.claimsflow.claim.domain.Claim;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "claim_messages")
public class ClaimMessage {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, length = 160)
    private String author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageAudience audience;

    @Column(nullable = false, length = 1200)
    private String body;

    @Column(nullable = false)
    private Instant createdAt;

    protected ClaimMessage() {}

    public static ClaimMessage create(
            Claim claim,
            String author,
            MessageAudience audience,
            String body,
            Instant createdAt) {
        ClaimMessage message = new ClaimMessage();
        message.id = UUID.randomUUID();
        message.claim = claim;
        message.author = author;
        message.audience = audience;
        message.body = body;
        message.createdAt = createdAt;
        return message;
    }

    public UUID getId() { return id; }
    public Claim getClaim() { return claim; }
    public String getAuthor() { return author; }
    public MessageAudience getAudience() { return audience; }
    public String getBody() { return body; }
    public Instant getCreatedAt() { return createdAt; }
}
