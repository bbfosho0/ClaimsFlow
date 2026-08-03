import { Signal, WritableSignal, signal } from '@angular/core';
import { OperationalResource } from './operational-data.models';

function emptyResource<T>(): OperationalResource<T> {
  return {
    value: null,
    loading: false,
    refreshing: false,
    stale: false,
    error: '',
    updatedAt: null,
    changedClaimIds: [],
  };
}

export class OperationalResourceController<T> {
  private readonly writable: WritableSignal<OperationalResource<T>> = signal(emptyResource<T>());
  readonly state: Signal<OperationalResource<T>> = this.writable.asReadonly();

  begin(background: boolean): void {
    this.writable.update(current => ({
      ...current,
      loading: !background && !current.value,
      refreshing: background || Boolean(current.value),
      error: background ? current.error : '',
    }));
  }

  succeed(value: T, updatedAt = new Date()): void {
    this.writable.update(current => ({
      ...current,
      value,
      loading: false,
      refreshing: false,
      stale: false,
      error: '',
      updatedAt,
    }));
  }

  fail(message: string): void {
    this.writable.update(current => ({
      ...current,
      loading: false,
      refreshing: false,
      stale: Boolean(current.value),
      error: message,
    }));
  }

  markClaimsChanged(ids: readonly string[]): void {
    if (!ids.length) return;
    this.writable.update(current => ({
      ...current,
      changedClaimIds: Array.from(new Set([...current.changedClaimIds, ...ids])),
    }));
  }

  clearClaimsChanged(ids: readonly string[]): void {
    if (!ids.length) return;
    const removed = new Set(ids);
    this.writable.update(current => ({
      ...current,
      changedClaimIds: current.changedClaimIds.filter(id => !removed.has(id)),
    }));
  }
}
