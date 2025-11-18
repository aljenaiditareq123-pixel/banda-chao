# Domain Diagnosis — banda-chao.app

This report analyzes the public DNS of `banda-chao.app` and outlines the steps to make it valid for Vercel.

> Note: Automated DNS queries from the current environment returned `NXDOMAIN` (no authoritative DNS found). This typically means one of the following:
> - The domain is not registered (or expired), or
> - The domain is registered but has no nameservers set (or nameservers not yet propagated), or
> - There is a temporary DNS resolution issue between our resolver and the authoritative servers.
> 
> Despite this, `www.banda-chao.app` appears to be a live Vercel project from your screenshots, which suggests DNS exists somewhere. The most likely explanation is that the apex (`banda-chao.app`) is not configured or nameservers/records are incomplete. Follow the steps below to confirm and fix.

---

## 1) Registrar & Nameservers (where the DNS is hosted)

Please check your domain registrar dashboard (e.g., Namecheap, GoDaddy, Google Domains, Porkbun, Cloudflare, etc.) and verify the NS (nameserver) configuration:

- If using **Vercel DNS**, the NS should look like: `dns1.p04.nsone.net`, `dns2.p04.nsone.net`, `dns3.p04.nsone.net`, `dns4.p04.nsone.net`.
- If using **Cloudflare**, NS looks like: `xxxx.ns.cloudflare.com` and `yyyy.ns.cloudflare.com`.
- If using **Namecheap**, NS often looks like: `dns1.registrar-servers.com`, `dns2.registrar-servers.com`.
- If using **GoDaddy**, NS looks like: `nsXX.domaincontrol.com`.
- Otherwise, identify the DNS host from the NS you see.

> Action: Write down the active nameservers and keep them consistent with the platform where you will manage DNS records.

---

## 2) Current DNS Records (expected for Vercel)

For Vercel to accept the domain, you need:

- Apex (root) domain `banda-chao.app`:
  - `A @ 76.76.21.21`
- Subdomain `www.banda-chao.app`:
  - `CNAME www cname.vercel-dns.com`
- (Optional) TXT verification record shown in Vercel (if prompted):
  - `_vercel-dns-verify=<value>`

> If using **Cloudflare**, turn OFF proxy (Grey Cloud) for `www` and apex so Vercel can verify ownership (orange-cloud proxying can block verification and cause “Invalid Configuration”).

---

## 3) What’s likely missing now

Based on `NXDOMAIN` from automated checks and the screenshots:

- The apex domain `banda-chao.app` likely has no A record or no working nameservers.
- `www.banda-chao.app` might be configured but not the apex, or DNS is split between providers.

---

## 4) Exact steps to fix (per provider)

### A) If you use **Vercel DNS**
1. In your registrar, set nameservers to **Vercel’s** NS (from Vercel Domains tab).
2. In Vercel (Project → Domains), add both:
   - `banda-chao.app`
   - `www.banda-chao.app`
3. Vercel will suggest/apply the needed records automatically (`A @ 76.76.21.21`, `CNAME www`).
4. If asked for TXT verification, add it as shown.
5. Wait for propagation and click “Refresh” in Vercel → Domains.

### B) If you use **Cloudflare**
1. DNS tab:
   - Add `A` record:
     - Name: `@`
     - IPv4 address: `76.76.21.21`
     - Proxy status: **DNS only** (Grey Cloud)
   - Add `CNAME`:
     - Name: `www`
     - Target: `cname.vercel-dns.com`
     - Proxy status: **DNS only**
   - If Vercel shows TXT verification, add: `_vercel-dns-verify` with the exact value.
2. Purge Cloudflare cache is not necessary for DNS; just wait for DNS propagation.
3. In Vercel → Domains, click “Refresh”. Invalid Configuration should disappear.

### C) If you use **Namecheap / GoDaddy / Google Domains / Porkbun**
1. Go to DNS Management for `banda-chao.app`:
   - Add A record: `@` → `76.76.21.21`
   - Add CNAME: `www` → `cname.vercel-dns.com`
   - Add TXT verification if Vercel provides it.
2. Save changes. Wait for DNS propagation.
3. In Vercel → Domains, click “Refresh”.

---

## 5) Final verification
1. `dig +short NS banda-chao.app` should return the expected nameservers.
2. `dig +short A banda-chao.app` should return `76.76.21.21`.
3. `dig +short CNAME www.banda-chao.app` should return `cname.vercel-dns.com`.
4. In Vercel → Domains, `banda-chao.app` and `www.banda-chao.app` should be “Valid”.
5. Visit `https://www.banda-chao.app/` and confirm it resolves. If apex is configured to redirect to `www`, confirm the redirect.

---

## Notes / Unusual Findings
- Automated queries returned `NXDOMAIN` for `banda-chao.app` at the time of analysis. This suggests either the nameservers are not set or DNS propagation hasn’t finished. Given your screenshot showing a live Vercel project at `www.banda-chao.app`, the apex likely needs an A record (or the nameservers must be corrected).


