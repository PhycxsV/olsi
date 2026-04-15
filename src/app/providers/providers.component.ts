import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService, ClientSupplierRider } from '../clients/client.service';
import { ProviderDetailDialogComponent } from './provider-detail-dialog/provider-detail-dialog.component';
import { ProviderFormDialogComponent, ProviderFormDraft } from './provider-form-dialog.component';
import { ProviderCard, ProviderService } from './provider.service';
import { KeriProvidersApiService } from '../core/api/keri-providers-api.service';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss'],
})
export class ProvidersComponent implements OnInit {
  searchText = '';
  /** '' = all, 'Active' | 'Paused' */
   statusFilter: 'Active' | 'Paused' | '' = '';

  constructor(
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private providerService: ProviderService,
    private keriApi: KeriProvidersApiService,
    private snackBar: MatSnackBar,
  ) {}

  get providers(): ProviderCard[] {
    return this.providerService.getProviders();
  }

  ngOnInit(): void {
    this.providerService.loadAccreditedFromApiIfConfigured().subscribe({
      next: () => this.openProviderFromQueryParam(),
      error: () => this.openProviderFromQueryParam(),
    });
  }

  get filteredProviders(): ProviderCard[] {
    let list = this.providers;
    if (this.statusFilter) {
      list = list.filter(p => p.status === this.statusFilter);
    }
    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
      );
    }
    return list;
  }

  setStatusFilter(value: "Active" | "Paused" | ''): void {
    this.statusFilter = value;
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
    if (this.keriApi.isConfigured()) {
      if (!provider.apiResourceId) {
        window.alert('This provider is missing its server id, so the status cannot be saved yet. Please reload and try again.');
        return;
      }
      this.keriApi.toggleProviderActive(provider.apiResourceId, nextActive).subscribe({
        next: () => {
          this.applyLocalProviderStatus(provider, nextActive);
          this.showSuccessToast(`Provider ${nextActive ? 'activated' : 'paused'} successfully.`);
          this.providerService.loadAccreditedFromApiIfConfigured().subscribe({
            error: err => {
              window.alert(this.extractProviderApiErrorMessage(err, 'Failed to refresh providers.'));
            },
          });
        },
        error: err => {
          window.alert(this.extractProviderApiErrorMessage(err, 'Update failed.'));
        },
      });
      return;
    }

    this.applyLocalProviderStatus(provider, nextActive);
  }

  private applyLocalProviderStatus(provider: ProviderCard, nextActive: boolean): void {
    provider.is_active = nextActive;
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
      this.openProviderDetail(provider);
      return;
    }
    if (action === 'Edit') {
      this.openProviderFormDialog('edit', {
        name: provider.name,
        documentId: provider.documentId,
        location: provider.location,
        status: provider.status,
        integrationType: provider.integrationType,
        activeRiders: provider.activeRiders,
        totalRiders: provider.totalRiders,
        avgTimeMin: provider.avgTimeMin,
        acceptancePercent: provider.acceptancePercent,
        slaPercent: provider.slaPercent,
        is_active: provider.is_active,
      }, provider.id);
    }
  }

  private openProviderDetail(provider: ProviderCard): void {
    const riders = provider.integrationType === 'THIRD_PARTY_APP'
      ? []
      : this.clientService.getRidersByProviderName(provider.name);
    this.dialog.open(ProviderDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      height: '100%',
      maxHeight: '100vh',
      position: { right: '0', top: '0' },
      data: { provider, riders },
      panelClass: 'provider-detail-dialog-right',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '250ms',
    }).afterClosed().subscribe((result: { action?: string } | undefined) => {
      if (result?.action !== 'edit') return;
      this.openProviderFormDialog('edit', {
        name: provider.name,
        documentId: provider.documentId,
        location: provider.location,
        status: provider.status,
        integrationType: provider.integrationType,
        activeRiders: provider.activeRiders,
        totalRiders: provider.totalRiders,
        avgTimeMin: provider.avgTimeMin,
        acceptancePercent: provider.acceptancePercent,
        slaPercent: provider.slaPercent,
        is_active: provider.is_active
      }, provider.id);
    });
  }

  private openProviderFromQueryParam(): void {
    const providerId = this.route.snapshot.queryParamMap.get('open');
    if (!providerId) return;

    const match = this.providers.find(p => p.id === providerId);
    if (match) {
      this.openProviderDetail(match);
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { open: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
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
        const isActive = result.status === 'Active';
        this.providerService.addProvider({
          id: Date.now().toString(),
          documentId: '',
          deliveriesToday: isActive ? 80 + Math.floor(Math.random() * 80) : 0,
          name: result.name.trim(),
          location: result.location.trim(),
          status: isActive ? 'Active' : 'Paused',
          integrationType: result.integrationType,
          activeRiders: isActive ? result.activeRiders : 0,
          totalRiders: result.totalRiders,
          avgTimeMin: result.avgTimeMin,
          acceptancePercent: result.acceptancePercent,
          slaPercent: result.slaPercent,
          is_active: isActive
        });
        this.showSuccessToast('Provider added successfully.');
        return;
      }
      if (!targetId) return;
      const existing = this.providerService.getProviderById(targetId);
      if (!existing) return;
      if (this.keriApi.isConfigured()) {
        const documentId = (existing.apiResourceId || existing.id || '').trim();
        if (!documentId) {
          window.alert(
            'This provider is missing its server id, so changes cannot be saved. Please reload and try again.',
          );
          return;
        }
        this.keriApi.updateProviderOperational(documentId, result.is_active).subscribe({
          next: () => {
            this.showSuccessToast('Provider updated successfully.');
            this.providerService.loadAccreditedFromApiIfConfigured().subscribe({
              error: err =>
                window.alert(this.extractProviderApiErrorMessage(err, 'Failed to refresh providers.')),
            });
          },
          error: err =>
            window.alert(this.extractProviderApiErrorMessage(err, 'Failed to save provider.')),
        });
        return;
      }
      const isActive = result.status === 'Active';
      this.providerService.updateProvider(targetId, {
        name: result.name.trim(),
        location: result.location.trim(),
        status: isActive ? 'Active' : 'Paused',
        integrationType: result.integrationType,
        activeRiders: isActive ? result.activeRiders : 0,
        totalRiders: result.totalRiders,
        avgTimeMin: result.avgTimeMin,
        acceptancePercent: result.acceptancePercent,
        slaPercent: result.slaPercent,
        is_active: isActive,
      });
      this.showSuccessToast('Provider updated successfully.');
    });
  }

  private createEmptyDraft(): ProviderFormDraft {
    return {
      name: '',
      documentId: '',
      location: '',
      status: 'Active',
      integrationType: 'USES_PROVIDER_RIDER_APP',
      activeRiders: 20,
      totalRiders: 25,
      avgTimeMin: 30,
      acceptancePercent: 90,
      slaPercent: 94,
      is_active: true
    };
  }

  private extractProviderApiErrorMessage(err: unknown, fallback: string): string {
    const errorBody = (err as { error?: any })?.error;
    const detailErrors =
      errorBody?.error?.details?.errors ??
      errorBody?.details?.errors;

    if (Array.isArray(detailErrors) && detailErrors.length > 0) {
      const messages = detailErrors
        .map((item: any) => {
          const path = Array.isArray(item?.path)
            ? item.path.join('.')
            : typeof item?.path === 'string'
              ? item.path
              : '';
          const message = typeof item?.message === 'string' ? item.message.trim() : '';
          if (path && message) return `${path}: ${message}`;
          return message || path;
        })
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    const msg =
      errorBody?.error?.message ||
      errorBody?.message ||
      (err as { message?: string })?.message ||
      fallback;
    return typeof msg === 'string' ? msg : fallback;
  }

  private showSuccessToast(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2500,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
