## Power BI Embed – Production Checklist

Purpose: Enable secure embedding of a Power BI report inside the Enterprise Dashboard at `app.northpathstrategies.org` using a service principal (app‑owns‑data).

### 1. Tenant Allow‑List / Admin Portal Settings
1. Sign in as a Power BI Service Administrator.
2. Open Power BI Admin Portal → Tenant settings.
3. Under Developer settings:
   - Enable: Service principal access to Power BI APIs.
   - Specify security group (recommended) that contains the Azure AD app’s service principal.
4. Under Export and sharing settings (optional hardening):
   - Confirm embed content settings align with org policy.
5. Domain allow‑list: Add `app.northpathstrategies.org` to any corporate allow‑list / CSP (if enforced by an outbound proxy or Azure Front Door WAF rules). Power BI itself does not require a domain allow‑list entry, but many org security baselines do—document the addition.

### 2. Azure AD App (Service Principal) Configuration
Create (or reuse) an Azure AD application registration.
Required values to capture:
| Item | Example |
|------|---------|
| Application (client) ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| Directory (tenant) ID | `yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy` |
| Client Secret | (store in secret manager) |

API Permissions (Microsoft APIs):
- Add delegated & application permission: Power BI Service → `Tenant.Read.All` (optional), and **Application** permission `Dataset.Read.All` (minimum) or broader if needed (e.g. `Report.Read.All`).
- Grant admin consent.

### 3. Redirect URIs (If Using Auth Code Flow Later)
For service‑principal token acquisition via client credentials no redirect is required. If you later support interactive fallback for admins, add:
```
https://app.northpathstrategies.org/api/powerbi/oauth/callback
https://app.northpathstrategies.org/enterprise/dashboard
```
Keep platform type = Web.

### 4. Workspace Access
1. In Power BI Service, open target workspace.
2. Add the Azure AD security group (preferred) or the service principal directly as **Member** or **Contributor** (Viewer sufficient for pure embed; Contributor needed for dataset refresh mgmt).
3. Note the Workspace (Group) ID from the URL: `https://app.powerbi.com/groups/{WORKSPACE_ID}/...`.
4. Open the target report; copy the Report ID from the URL: `.../reports/{REPORT_ID}/ReportSection`.

### 5. Environment Variables
Add to deployment environment (`.env` / platform secrets):
```
POWERBI_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
POWERBI_CLIENT_SECRET=***
POWERBI_TENANT_ID=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
POWERBI_WORKSPACE_ID={WORKSPACE_ID}
POWERBI_REPORT_ID={REPORT_ID}
POWERBI_SCOPE=https://analysis.windows.net/powerbi/api/.default
POWERBI_AUTHORITY=https://login.microsoftonline.com/${POWERBI_TENANT_ID}
```

### 6. Backend Embed Token Endpoint (Example Spec)
Create an endpoint (e.g. `POST /api/powerbi/embed-token`) that:
1. Exchanges client credentials for an Azure AD access token: POST to `${POWERBI_AUTHORITY}/oauth2/v2.0/token` with form data:
   - `grant_type=client_credentials`
   - `client_id=${POWERBI_CLIENT_ID}`
   - `client_secret=${POWERBI_CLIENT_SECRET}`
   - `scope=${POWERBI_SCOPE}`
2. Calls Power BI REST API to generate an embed token:
   - `POST https://api.powerbi.com/v1.0/myorg/GenerateToken` with JSON body:
     ```json
     {
       "reports": [{ "id": "${POWERBI_REPORT_ID}", "groupId": "${POWERBI_WORKSPACE_ID}" }],
       "datasets": [{ "id": "{DATASET_ID}" }],
       "targetWorkspaces": [{ "id": "${POWERBI_WORKSPACE_ID}" }]
     }
     ```
   - Authorization: `Bearer <AAD access token>`
3. Return JSON to client:
   ```json
   { "embedToken": "...", "reportId": "...", "workspaceId": "..." }
   ```

### 7. Test cURL (Embed Token Endpoint)
After implementing the endpoint (replace placeholders):
```bash
curl -X POST https://app.northpathstrategies.org/api/powerbi/embed-token \
  -H 'Authorization: Bearer <SESSION_OR_APP_TOKEN_IF_REQUIRED>' \
  -H 'Content-Type: application/json' \
  -d '{ "reportId": "'$POWERBI_REPORT_ID'" }'
```
Expected 200 JSON with `embedToken` and IDs.

### 8. Front-End Integration (Enterprise Dashboard)
1. Fetch embed token client side after auth.
2. Use Power BI JS SDK (`powerbi-client`) to embed: container div + config `{ type:'report', tokenType: models.TokenType.Embed, accessToken: embedToken, id: reportId, embedUrl }`.
3. Refresh token before expiry (usually 60 min) or re-request.

### 9. Security Notes
- Never expose `POWERBI_CLIENT_SECRET` to browser.
- Limit service principal permissions to least privilege.
- Cache embed tokens briefly (optional) server-side; enforce user authorization mapping before issuing.

### 10. Operational Verification
| Check | Command / Action | Result |
|-------|------------------|--------|
| AAD token fetch | Client credentials POST | 200 + access_token |
| Workspace access | List reports API | Report appears |
| Embed token | GenerateToken API | 200 + token |
| Front-end render | Load dashboard | Report iframe renders |

Done.
