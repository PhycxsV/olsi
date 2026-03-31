import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProviderCard, ProviderService } from '../providers/provider.service';

export interface PreferredProviderDialogData {
  /** Provider IDs already assigned to this client (hidden from the dropdown). */
  excludeProviderIds: string[];
}

export interface PreferredProviderDialogSelection {
  providerId: string;
  providerName: string;
}

@Component({
  selector: 'app-preferred-provider-dialog',
  templateUrl: './preferred-provider-dialog.component.html',
  styleUrls: ['./preferred-provider-dialog.component.scss'],
})
export class PreferredProviderDialogComponent {
  readonly dialogTitle: string;
  providers: ProviderCard[] = [];
  selectedProviderIds: string[] = [];
  readonly maxPreferredProviders = 2;
  readonly maxSelectableInDialog: number;

  constructor(
    private dialogRef: MatDialogRef<PreferredProviderDialogComponent, { selections: PreferredProviderDialogSelection[] }>,
    @Inject(MAT_DIALOG_DATA) public data: PreferredProviderDialogData,
    providerService: ProviderService,
  ) {
    this.dialogTitle = 'Add preferred provider';
    const exclude = new Set(data.excludeProviderIds ?? []);
    this.providers = [...providerService.getProviders()]
      .filter(p => !exclude.has(p.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    this.maxSelectableInDialog = Math.max(0, this.maxPreferredProviders - exclude.size);
    if (this.providers.length > 0 && this.maxSelectableInDialog > 0) {
      this.selectedProviderIds = [this.providers[0].id];
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByIndex(index: number): number {
    return index;
  }

  get canAddAnotherProvider(): boolean {
    return (
      this.providers.length > this.selectedProviderIds.length &&
      this.selectedProviderIds.length < this.maxSelectableInDialog
    );
  }

  get hasValidSelections(): boolean {
    return this.selectedProviderIds.length > 0 && this.selectedProviderIds.every(id => !!id);
  }

  getSelectableProviders(index: number): ProviderCard[] {
    const picked = new Set(this.selectedProviderIds.filter((_, i) => i !== index));
    return this.providers.filter(provider => !picked.has(provider.id));
  }

  addAnotherProvider(): void {
    if (!this.canAddAnotherProvider) return;
    const picked = new Set(this.selectedProviderIds);
    const next = this.providers.find(provider => !picked.has(provider.id));
    if (!next) return;
    this.selectedProviderIds = [...this.selectedProviderIds, next.id];
  }

  removeProvider(index: number): void {
    if (index < 0 || index >= this.selectedProviderIds.length) return;
    this.selectedProviderIds = this.selectedProviderIds.filter((_, i) => i !== index);
  }

  save(): void {
    if (this.providers.length === 0) return;
    if (!this.hasValidSelections) return;
    const selections: PreferredProviderDialogSelection[] = this.selectedProviderIds
      .map(selectedId => this.providers.find(provider => provider.id === selectedId))
      .filter((provider): provider is ProviderCard => !!provider)
      .map(provider => ({ providerId: provider.id, providerName: provider.name }));
    if (selections.length === 0) return;
    this.dialogRef.close({ selections });
  }
}
