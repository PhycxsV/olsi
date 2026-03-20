# Provider rate CSV import

This feature is on the Accreditation page.

It is import-only.

When a CSV file is valid, it replaces all existing imported provider rate rows.

If the file has any error, nothing is replaced.

## CSV columns

Use this exact header order:

provider name,vehicle type,charging type,rate

## Validation rules

- Header must match exactly
- All 4 columns are required in every row
- Provider name must exist in Accreditation provider list
- Vehicle type must match allowed values
- Charging type must match allowed values
- Rate must be a number and must be 0 or higher
- Duplicate rows are not allowed for the same provider + vehicle type + charging type

## Main code locations

- UI and import logic:
  - `src/app/accreditation/accreditation.component.html`
  - `src/app/accreditation/accreditation.component.ts`
  - `src/app/accreditation/accreditation.component.scss`

- Rate model:
  - `src/app/core/models/provider-rate.model.ts`

- In-memory storage service:
  - `src/app/core/services/provider-rate.service.ts`

## Notes

- This is different from the existing Export CSV buttons in other pages.
- This import currently stores data in memory (frontend only).
