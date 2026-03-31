import { Injectable } from '@angular/core';

export interface ProviderCard {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Paused';
  integrationType: 'provider_app' | 'aggregator_app' | 'third_party_app';
  activeRiders: number;
  totalRiders: number;
  avgTimeMin: number;
  acceptancePercent: number;
  slaPercent: number;
  deliveriesToday: number;
}

const INITIAL_PROVIDERS: ProviderCard[] = [
  { id: '1', name: 'SpeedRiders', location: 'Metro Manila, Cavite', status: 'Active', integrationType: 'provider_app', activeRiders: 42, totalRiders: 50, avgTimeMin: 28, acceptancePercent: 94, slaPercent: 97, deliveriesToday: 156 },
  { id: '2', name: 'MetroFleet', location: 'Makati, BGC', status: 'Active', integrationType: 'aggregator_app', activeRiders: 30, totalRiders: 35, avgTimeMin: 35, acceptancePercent: 88, slaPercent: 92, deliveriesToday: 98 },
  { id: '3', name: 'SwiftDeliver', location: 'Quezon City, Caloocan', status: 'Active', integrationType: 'provider_app', activeRiders: 38, totalRiders: 45, avgTimeMin: 32, acceptancePercent: 96, slaPercent: 99, deliveriesToday: 142 },
  { id: '4', name: 'QuickHaul', location: 'Pasig, Mandaluyong', status: 'Paused', integrationType: 'third_party_app', activeRiders: 0, totalRiders: 40, avgTimeMin: 40, acceptancePercent: 85, slaPercent: 88, deliveriesToday: 0 },
  { id: '5', name: 'ExpressWay', location: 'Taguig, Muntinlupa', status: 'Active', integrationType: 'aggregator_app', activeRiders: 39, totalRiders: 44, avgTimeMin: 30, acceptancePercent: 91, slaPercent: 94, deliveriesToday: 120 },
];

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private providers: ProviderCard[] = INITIAL_PROVIDERS.map(p => ({ ...p }));

  getProviders(): ProviderCard[] {
    return this.providers;
  }

  getProviderById(id: string): ProviderCard | undefined {
    return this.providers.find(p => p.id === id);
  }

  addProvider(card: ProviderCard): void {
    this.providers.unshift(card);
  }

  updateProvider(id: string, updates: Partial<ProviderCard>): void {
    const i = this.providers.findIndex(p => p.id === id);
    if (i < 0) return;
    this.providers[i] = { ...this.providers[i], ...updates } as ProviderCard;
  }
}
