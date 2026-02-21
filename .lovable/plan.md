

# Fix Build Error and Complete Community Enhancements

## 1. Fix TS2589 Build Error

**File:** `src/pages/dashboard/coach/CoachCommunityDetail.tsx` (line 425)

The `digital_products` table has a deeply recursive type in the auto-generated types file. Fix by casting the query result with an explicit type:

```typescript
const { data, error } = await supabase
  .from("digital_products")
  .select("id, title, price, currency")
  .eq("coach_id", coachProfileId!)
  .eq("status", "published")
  .returns<{ id: string; title: string; price: number; currency: string }[]>();
```

## 2. Add Missing Translation Keys

**Files:** `src/i18n/locales/en/coach.json`, `src/i18n/locales/pl/coach.json`

Add the following keys inside the existing `community` object:

| Key | EN |
|-----|-----|
| `membersTab` | Members |
| `settings` | Settings |
| `inviteMembers` | Invite Members |
| `inviteMembersDesc` | Share invite links or send email invitations |
| `createInviteLink` | Create Invite Link |
| `maxUses` | Max Uses |
| `grantFreeAccess` | Free Access |
| `inviteByEmail` | Invite by Email |
| `emailPlaceholder` | Enter email address |
| `sendInvite` | Send |
| `inviteSent` | Invite sent! |
| `inviteFailed` | Failed to send invite |
| `activeInvites` | Active Invites |
| `noInvites` | No active invites |
| `freeAccess` | Free |
| `uses` | uses |
| `linkCopied` | Link copied! |
| `resources` | Resources |
| `resourcesDesc` | Link packages and products for community members |
| `linkedPackages` | Linked Packages |
| `noLinkedPackages` | No packages linked yet |
| `linkPackage` | Select a package... |
| `freeForMembers` | Free for members |
| `paidAccess` | Paid |
| `linkedProducts` | Linked Products |
| `noLinkedProducts` | No products linked yet |
| `linkProduct` | Select a product... |
| `memberRemoved` | Member removed |
| `roleUpdated` | Role updated |
| `previewImage` | Preview Image URL |
| `previewImagePlaceholder` | https://example.com/image.jpg |

Polish translations will mirror the English with appropriate translations.

## 3. Client-side: Add Resources Tab and Restricted Video

**File:** `src/pages/dashboard/client/ClientCommunityDetail.tsx`

- Add a **Resources** tab showing linked packages and products with "Free for members" badges
- Update `LessonViewer` to pass `restricted={true}` to `VideoEmbed` for classroom lessons (keeps feed videos standard)
- Show lesson `preview_image_url` as thumbnail in the module listing

**File:** `src/i18n/locales/en/client.json`, `src/i18n/locales/pl/client.json`

Add client-side community translation keys:
- `community.resources`, `community.freeForMembers`, `community.viewPackage`, `community.viewProduct`

## 4. Classroom Lesson Editor: Preview Image and Embed Mode

**File:** `src/pages/dashboard/coach/CoachCommunityDetail.tsx`

In the "Add Lesson" dialog, add:
- Preview Image URL input field
- Pass `preview_image_url` to `useCreateLesson`
- Pass `restricted={true}` to `VideoEmbed` in the classroom context

## Files Changed

| File | Change |
|------|--------|
| `src/pages/dashboard/coach/CoachCommunityDetail.tsx` | Fix TS2589 with `.returns<>()`, add preview image field to lesson dialog, restricted video in classroom |
| `src/pages/dashboard/client/ClientCommunityDetail.tsx` | Add Resources tab, restricted video in lessons, preview image thumbnails |
| `src/i18n/locales/en/coach.json` | Add ~25 community management translation keys |
| `src/i18n/locales/pl/coach.json` | Same in Polish |
| `src/i18n/locales/en/client.json` | Add client-side community resource keys |
| `src/i18n/locales/pl/client.json` | Same in Polish |

No database changes needed -- schema was already created in the previous step.
