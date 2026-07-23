package com.claimsflow.audit.domain;

import com.claimsflow.claim.domain.Claim;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, length = 160)
    private String actor;

    @Column(nullable = false, length = 80)
    private String actionType;

    @Column(nullable = false, length = 600)
    private String summary;

    @Column(length = 600)
    private String previousValue;

    @Column(length = 600)
    private String newValue;

    @Column(nullable = false)
    private Instant occurredAt;

    protected AuditEvent() {}

    public static AuditEvent record(Claim claim, String actor, String actionType, String summary, String previousValue, String newValue, Instant now) {
        AuditEvent event = new AuditEvent();
        event.id = UUID.randomUUID();
        event.claim = claim;
        event.actor = actor;
        event.actionType = actionType;
        event.summary = summary;
        event.previousValue = previousValue;
        event.newValue = newValue;
        event.occurredAt = now;
        return event;
    }

    public UUID getId() { return id; }
    public Claim getClaim() { return claim; }
    public String getActor() { return actor; }
    public String getActionType() { return actionType; }
    public String getSummary() { return summary; }
    public String getPreviousValue() { return previousValue; }
    public String getNewValue() { return newValue; }
    public Instant getOccurredAt() { return occurredAt; }
}
