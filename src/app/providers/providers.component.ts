import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProviderFormDialogComponent, ProviderFormDraft } from './provider-form-dialog.component';

export interface ProviderCard {
  id: string;
  name: string;
  location: string;
  status: 'Active' | 'Paused';
  activeRiders: number;
  totalRiders: number;
  avgTimeMin: number;
  acceptancePercent: number;
  slaPercent: number;
  deliveriesToday: number;
}

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
})
export class ProvidersComponent {
  searchText = '';
  detailDrawerOpen = false;
  selectedProvider: ProviderCard | null = null;

  constructor(private dialog: MatDialog) {}

  providers: ProviderCard[] = [
    { id: '1', name: 'SpeedRiders', location: 'Metro Manila, Cavite', status: 'Active', activeRiders: 42, totalRiders: 50, avgTimeMin: 28, acceptancePercent: 94, slaPercent: 97, deliveriesToday: 156 },
    { id: '2', name: 'MetroFleet', location: 'Makati, BGC', status: 'Active', activeRiders: 30, totalRiders: 35, avgTimeMin: 35, acceptancePercent: 88, slaPercent: 92, deliveriesToday: 98 },
    { id: '3', name: 'SwiftDeliver', location: 'Quezon City, Caloocan', status: 'Active', activeRiders: 38, totalRiders: 45, avgTimeMin: 32, acceptancePercent: 96, slaPercent: 99, deliveriesToday: 142 },
    { id: '4', name: 'QuickHaul', location: 'Pasig, Mandaluyong', status: 'Paused', activeRiders: 0, totalRiders: 40, avgTimeMin: 40, acceptancePercent: 85, slaPercent: 88, deliveriesToday: 0 },
    { id: '5', name: 'ExpressWay', location: 'Taguig, Muntinlupa', status: 'Active', activeRiders: 39, totalRiders: 44, avgTimeMin: 30, acceptancePercent: 91, slaPercent: 94, deliveriesToday: 120 },
  ];

  get filteredProviders(): ProviderCard[] {
    if (!this.searchText.trim()) return this.providers;
    const q = this.searchText.toLowerCase();
    return this.providers.filter(p =>
      p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }

  get summaryText(): string {
    const active = this.providers.filter(p => p.status === 'Active').length;
    const ridersOnline = this.providers.reduce((sum, p) => sum + p.activeRiders, 0);
    return `${active} active providers • ${ridersOnline} riders online`;
  }

  getInitial(name: string): string {
    return (name || 'P').charAt(0).toUpperCase();
  }

  getAcceptanceClass(pct: number): string {
    if (pct >= 92) return 'pct-high';
    if (pct >= 85) return 'pct-mid';
    return 'pct-low';
  }

  getSlaClass(pct: number): string {
    if (pct >= 92) return 'pct-high';
    if (pct >= 85) return 'pct-mid';
    return 'pct-low';
  }

  toggleActive(provider: ProviderCard): void {
    const nextActive = provider.status !== 'Active';
    provider.status = nextActive ? 'Active' : 'Paused';
    if (provider.status === 'Paused') {
      provider.activeRiders = 0;
      provider.deliveriesToday = 0;
    } else {
      provider.activeRiders = Math.max(1, Math.floor(provider.totalRiders * 0.8));
      provider.deliveriesToday = 80 + Math.floor(Math.random() * 80);
    }
  }

  onAddProvider(): void {
    this.openProviderFormDialog('create', this.createEmptyDraft());
  }

  onProviderMenuAction(provider: ProviderCard, action: string): void {
    if (action === 'View details') {
      this.selectedProvider = provider;
      this.detailDrawerOpen = true;
      return;
    }
    if (action === 'Edit') {
      this.openProviderFormDialog('edit', {
        name: provider.name,
        location: provider.location,
        status: provider.status,
        activeRiders: provider.activeRiders,
        totalRiders: provider.totalRiders,
        avgTimeMin: provider.avgTimeMin,
        acceptancePercent: provider.acceptancePercent,
        slaPercent: provider.slaPercent,
      }, provider.id);
    }
  }

  closeDetailDrawer(): void {
    this.detailDrawerOpen = false;
    this.selectedProvider = null;
  }

  private openProviderFormDialog(mode: 'create' | 'edit', draft: ProviderFormDraft, targetId?: string): void {
    this.dialog.open(ProviderFormDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: { mode, draft },
    }).afterClosed().subscribe((result: ProviderFormDraft | undefined) => {
      if (!result) return;
      if (mode === 'create') {
        this.providers.unshift({
          id: Date.now().toString(),
          deliveriesToday: result.status === 'Active' ? 80 + Math.floor(Math.random() * 80) : 0,
          name: result.name.trim(),
          location: result.location.trim(),
          status: result.status,
          activeRiders: result.activeRiders,
          totalRiders: result.totalRiders,
          avgTimeMin: result.avgTimeMin,
          acceptancePercent: result.acceptancePercent,
          slaPercent: result.slaPercent,
        });
        return;
      }
      if (!targetId) return;
      const idx = this.providers.findIndex(p => p.id === targetId);
      if (idx < 0) return;
      const existing = this.providers[idx];
      this.providers[idx] = {
        ...existing,
        name: result.name.trim(),
        location: result.location.trim(),
        status: result.status,
        activeRiders: result.activeRiders,
        totalRiders: result.totalRiders,
        avgTimeMin: result.avgTimeMin,
        acceptancePercent: result.acceptancePercent,
        slaPercent: result.slaPercent,
      };
    });
  }

  private createEmptyDraft(): ProviderFormDraft {
    return {
      name: '',
      location: '',
      status: 'Active',
      activeRiders: 20,
      totalRiders: 25,
      avgTimeMin: 30,
      acceptancePercent: 90,
      slaPercent: 94,
    };
  }
}
