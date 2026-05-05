# TODO

## Deployment
- [ ] Deploy backend (FastAPI) to Fly.io
  - Run `fly launch --name aha-api --dockerfile apps/api/Dockerfile --no-deploy` to generate `fly.toml`
  - Set secrets: `DATABASE_URL`, `ADMIN_SECRET`, `CORS_ORIGINS`
  - Add GitHub Actions workflow for API (path-filtered to `apps/api/**`) using `flyctl deploy`
  - Set `NEXT_PUBLIC_API_URL` in Vercel project env vars to the Fly.io app URL
  - Add `FLY_API_TOKEN` as a GitHub secret
- [ ] Als een gebruiker wil ik een report kunnen zien
- [ ] Als gebruiker wil ik databronnen kunnen koppelen
- [ ] Als wil ik documenten kunnen toevoegen
- [ ] Als gebruiker wil dat databronnen en documenten worden geanalizeerd en tot rapport elementen worden verwerkt
- [ ] Als gebruiker wil ik analyzes kunnen inzien
- [ ] Als gebruiker wil ik met een agent kunnen chatten
- [ ] Als gebruiker wil ik een rapport kunnen genereren via chat
- [ ] Als gebruiker wil ik een rapport kunnen editen via chat