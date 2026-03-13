# Provider Billing: 14-Day Date Range (Logic)

Logic changes for the 14-day billing window. The range is always 14 days inclusive; we derive the other bound from whichever date the user sets, and clamp so the window never extends past today.

---

## File: `provider-detail-dialog.component.ts`

**State (lines 35–36)**

`biweeklyStartDate` and `biweeklyEndDate` hold both ends of the range. We no longer derive the range from a single moving end date.

```ts
biweeklyStartDate!: Date;
biweeklyEndDate!: Date;
```

**Initialization (line 55)**

In `ngOnInit`, set the default to the latest 14-day window ending today, then sync billing state.

```ts
this.setBiweeklyRangeFromEnd(this.endOfDay(new Date()));
this.syncBillingState();
```

**Max dates (154–162)**

`maxBiweeklyStartDate`: today minus 13 days (start of day). Any start later would make the 14-day window end in the future. `maxBiweeklyEndDate`: end of today.

```ts
get maxBiweeklyStartDate(): Date {
  const maxStartDate = this.startOfDay(new Date());
  maxStartDate.setDate(maxStartDate.getDate() - 13);
  return maxStartDate;
}

get maxBiweeklyEndDate(): Date {
  return this.endOfDay(new Date());
}
```

**Change handlers (172–196)**

Normalize to start/end of day, clamp to the max dates, update the range, then sync.

```ts
onBiweeklyStartDateChange(value: Date | null): void {
  if (!value) {
    return;
  }

  const normalizedStartDate = this.startOfDay(value);
  const maxStartDate = this.maxBiweeklyStartDate;
  this.setBiweeklyRangeFromStart(
    normalizedStartDate.getTime() > maxStartDate.getTime() ? maxStartDate : normalizedStartDate,
  );
  this.syncBillingState();
}

onBiweeklyEndDateChange(value: Date | null): void {
  if (!value) {
    return;
  }

  const normalizedEndDate = this.endOfDay(value);
  const maxEndDate = this.maxBiweeklyEndDate;
  this.setBiweeklyRangeFromEnd(
    normalizedEndDate.getTime() > maxEndDate.getTime() ? maxEndDate : normalizedEndDate,
  );
  this.syncBillingState();
}
```

**Current range (212–220)**

For biweekly mode, return the two stored dates (normalized). Monthly mode is unchanged.

```ts
private get currentRange(): DateRange {
  if (this.periodType === 'monthly') {
    return this.selectedMonthOption?.range ?? this.buildCurrentMonthRange();
  }

  return {
    start: this.startOfDay(new Date(this.biweeklyStartDate)),
    end: this.endOfDay(new Date(this.biweeklyEndDate)),
  };
}
```

**14-day rule (312–333)**

Start + 13 days = end, or end − 13 days = start. If setting from start would push end past today, fall back to the range ending today.

```ts
private setBiweeklyRangeFromStart(startDate: Date): void {
  const nextStartDate = this.startOfDay(startDate);
  const nextEndDate = this.endOfDay(new Date(nextStartDate));
  nextEndDate.setDate(nextEndDate.getDate() + 13);

  if (nextEndDate.getTime() > this.maxBiweeklyEndDate.getTime()) {
    this.setBiweeklyRangeFromEnd(this.maxBiweeklyEndDate);
    return;
  }

  this.biweeklyStartDate = nextStartDate;
  this.biweeklyEndDate = nextEndDate;
}

private setBiweeklyRangeFromEnd(endDate: Date): void {
  const nextEndDate = this.endOfDay(endDate);
  const nextStartDate = this.startOfDay(new Date(nextEndDate));
  nextStartDate.setDate(nextStartDate.getDate() - 13);

  this.biweeklyStartDate = nextStartDate;
  this.biweeklyEndDate = nextEndDate;
}
```

**Helpers (335–344)**

Existing `startOfDay` and `endOfDay` keep range bounds normalized so filtering is consistent.

```ts
private startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

private endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}
```

---

## Flow

When the user changes start or end, we update the other bound to keep 14 days inclusive. If that would push the range past today, we clamp to the last valid window. After any change we run `syncBillingState()` so completed deliveries and the stored sales invoice total are for the new range.

---

## Possible improvements (logic)

- Extract the 14-day range math into a shared util or service if other features need the same windowing.
- Unit tests for `setBiweeklyRangeFromStart`, `setBiweeklyRangeFromEnd`, clamping, and default init.
- Persist the last selected 14-day range per provider (e.g. by provider id) so the dialog can reopen with that range instead of always "ending today."
