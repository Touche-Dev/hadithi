<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Front-end only CRM; the backend is an existing external Express + MySQL API. Never add Supabase/Lovable Cloud or a database — the client owns the backend.
- All HTTP goes through the single axios client `src/api/client.js` (baseURL from `VITE_API_URL`); why: one place for auth header and 401 handling.
- Admin calls go through `src/api/admin.js`; fake data lives only in `src/api/mock.js` so it can be swapped for real `/api/admin/*` routes.
- App data is loaded into the Redux store (`src/store/store.js`) on entry and reloaded after every mutation via `useMutate`; why: spec requires a refreshed reference store.
- JWT is kept in memory only (Redux + client.js), never in localStorage; why: spec security rule.
- Authenticated pages live under the pathless `_crm` layout, which guards auth, handles 8h inactivity logout and renders the shell.
- Enum values (statuses, genres, workshops) are constants in `src/lib/labels.ts` mirroring the DB enums; never free text.
- File uploads go through `uploadFile` in `src/api/admin.js` (POST /api/admin/uploads) and the `FileUpload` component; format/size rules live in `src/lib/upload.ts`; why: one validated upload path for manuscripts and event images.
