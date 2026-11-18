# Local data (development only)

`store.json` and `uploads/` are created automatically when `DATA_BACKEND=local`.
They are git-ignored. Run `npm run data:reset` to restore the seed data.
Production must use Supabase — see the project README.
