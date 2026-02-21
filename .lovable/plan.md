

# Fix Missing Translation Keys in Group Classes Form

## Root Cause

Same duplicate-key issue as before: both `en/coach.json` and `pl/coach.json` have **two** top-level `"groupClasses"` keys. The second one (containing only `pageTitle` and `pageDescription`) overwrites the first one (containing all the form labels), so the form displays raw key strings like `groupClasses.form.eventType`.

## Fix

### 1. Merge duplicate `groupClasses` blocks in `en/coach.json`

The first block (line 1231) has all the existing keys. The second block (line 1858) has only `pageTitle` and `pageDescription`. The fix:
- Add `pageTitle` and `pageDescription` into the first `groupClasses` block
- Add a new `form` sub-object with all the missing form keys: `eventType`, `eventFormat`, `recurring`, `recurringDesc`, `onlineLink`, `classTitle`, `classTitlePlaceholder`, `descriptionPlaceholder`, `schedulePlaceholder`, `locationPlaceholder`, `whoIsThisFor`, `whoIsThisForPlaceholder`, `startDate`, `endDate`, `maxParticipantsPlaceholder`, `waitlistOpen`, `waitlistOpenDesc`, `active`, `activeDesc`, `price`
- Remove the second duplicate `groupClasses` block entirely

### 2. Same merge in `pl/coach.json`

Identical fix with Polish translations.

## Keys to Add

Under `groupClasses.form`:
| Key | EN | PL |
|-----|----|----|
| `eventType` | Event Type | Typ wydarzenia |
| `eventFormat` | Format | Format |
| `recurring` | Recurring | Cykliczne |
| `recurringDesc` | This is a regularly scheduled class | To regularnie planowane zajecia |
| `onlineLink` | Online Link | Link online |
| `classTitle` | Class Title | Tytul zajec |
| `classTitlePlaceholder` | e.g., Morning HIIT Class | np. Poranny HIIT |
| `descriptionPlaceholder` | Describe what the class involves... | Opisz czego dotycza zajecia... |
| `schedulePlaceholder` | e.g., Mon/Wed/Fri 7:00 AM | np. Pon/Sr/Pt 7:00 |
| `locationPlaceholder` | e.g., Central Park, NYC | np. Park Centralny |
| `whoIsThisFor` | Who is this for? | Dla kogo? |
| `whoIsThisForPlaceholder` | e.g., All fitness levels welcome | np. Wszystkie poziomy |
| `startDate` | Start Date | Data rozpoczecia |
| `endDate` | End Date | Data zakonczenia |
| `maxParticipantsPlaceholder` | Leave empty for unlimited | Pozostaw puste dla nieograniczonej |
| `waitlistOpen` | Waitlist Open | Lista oczekujacych |
| `waitlistOpenDesc` | Allow clients to join the waitlist | Pozwol klientom dolaczac do listy |
| `active` | Active | Aktywne |
| `activeDesc` | Show this class on your profile | Pokaz te zajecia na profilu |
| `price` | Price | Cena |

## Files Changed

| File | Change |
|------|--------|
| `src/i18n/locales/en/coach.json` | Merge `pageTitle`, `pageDescription`, and `form` keys into first `groupClasses` block; remove duplicate second block |
| `src/i18n/locales/pl/coach.json` | Same merge with Polish translations |

No database changes. No new files.
