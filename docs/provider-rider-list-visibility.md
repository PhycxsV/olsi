# Provider rider list visibility rule

This note explains the rider list rule in Provider Details.

## Business rule

If a provider uses a 3rd Party App, do not show the rider list.

If a provider uses Provider Rider App or Aggregator Rider App, show the rider list.

## Where it is implemented

The provider model now has an `integrationType` field in `src/app/providers/providers.component.ts`.

Allowed values:

- `provider_app`
- `aggregator_app`
- `third_party_app`

The rider list visibility is controlled in `src/app/providers/provider-detail-dialog/provider-detail-dialog.component.ts`.

`canShowRiderList` returns false when `integrationType` is `third_party_app`.

Code:

```ts
get canShowRiderList(): boolean {
  return this.data.provider.integrationType !== 'third_party_app';
}
```

The template in `src/app/providers/provider-detail-dialog/provider-detail-dialog.component.html` uses that condition:

- If `canShowRiderList` is true, the Riders tab is visible and rider cards are rendered
- If `canShowRiderList` is false, the Riders tab is not rendered

Code:

```html
<mat-tab label="Riders" *ngIf="canShowRiderList">
  ...
</mat-tab>
```

## Data flow

`ProvidersComponent` sends provider data to the detail dialog.

Before opening the dialog, rider data fetching is skipped for `third_party_app`.

This avoids loading rider data that should not be shown.

Code:

```ts
const riders = provider.integrationType === 'third_party_app'
  ? []
  : this.clientService.getRidersByProviderName(provider.name);
```

## Form updates

The Add/Edit Provider form now includes App Type in:

- `src/app/providers/provider-form-dialog.component.ts`
- `src/app/providers/provider-form-dialog.component.html`

When a provider is created or edited, `integrationType` is saved with the provider record.

Model code:

```ts
export interface ProviderCard {
  ...
  integrationType: 'provider_app' | 'aggregator_app' | 'third_party_app';
  ...
}
```

## How to test quickly

1. Open Providers page
2. Open details for a provider with App Type set to 3rd Party App(MAKE SURE TO SET 'APP TYPE FIRST' BEFORE TESTING)
3. Confirm Riders tab is hidden
4. Edit the same provider and change App Type to Aggregator Rider App
5. Reopen details and confirm rider list is visible again
