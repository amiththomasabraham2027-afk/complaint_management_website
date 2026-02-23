# GitHub Actions Secrets Setup Guide

This guide explains how to configure GitHub Secrets for automated Docker deployment to AWS EC2.

## Prerequisites

- GitHub repository access
- `Complaint_manage.pem` key file
- AWS EC2 instance details (IP, username)
- Database credentials
- Generated secret keys

## Step 1: Extract SSH Private Key

The GitHub Actions workflow needs your SSH private key to deploy to EC2.

### Windows (PowerShell)

```powershell
# Read key content
$keyContent = Get-Content -Raw "Complaint_manage.pem"

# Copy to clipboard
$keyContent | Set-Clipboard

# Paste into GitHub secrets value field
Write-Host "SSH key copied to clipboard!"
```

### macOS

```bash
# Copy to clipboard
cat Complaint_manage.pem | pbcopy

echo "SSH key copied to clipboard!"
```

### Linux

```bash
# Copy to clipboard (requires xclip)
cat Complaint_manage.pem | xclip -selection clipboard

echo "SSH key copied to clipboard!"
```

## Step 2: Generate Secure Keys

Generate strong secrets for JWT and NextAuth:

### Windows (PowerShell)

```powershell
function Generate-SecureKey {
    $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    return [System.Convert]::ToBase64String($bytes)
}

$jwtSecret = Generate-SecureKey
$nextAuthSecret = Generate-SecureKey

Write-Host "JWT_SECRET: $jwtSecret"
Write-Host "NEXTAUTH_SECRET: $nextAuthSecret"
```

### macOS/Linux (Bash)

```bash
echo "JWT_SECRET: $(openssl rand -base64 32)"
echo "NEXTAUTH_SECRET: $(openssl rand -base64 32)"
```

## Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

Add the following secrets:

### Required Secrets

#### 1. SSH_PRIVATE_KEY
- **Key:** `SSH_PRIVATE_KEY`
- **Value:** Contents of `Complaint_manage.pem` (from Step 1)

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1alqEWftiJrjABx2MwdecP2Ff9sqzjr9Z+xW/oxfvX3dkibh
...
-----END RSA PRIVATE KEY-----
```

#### 2. SERVER_HOST
- **Key:** `SERVER_HOST`
- **Value:** Your EC2 instance IP (e.g., `13.200.254.173`)

#### 3. SERVER_USER
- **Key:** `SERVER_USER`
- **Value:** SSH user (usually `ubuntu`)

#### 4. MONGODB_URI
- **Key:** `MONGODB_URI`
- **Value:** MongoDB connection string

**Development:**
```
mongodb://admin:password123@mongodb:27017/resolvex?authSource=admin
```

**Production (Secure):**
```
mongodb://admin:SECURE_PASSWORD@mongodb:27017/resolvex?authSource=admin
```

#### 5. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** Generated secret key from Step 2 (min 32 chars)

#### 6. NEXTAUTH_SECRET
- **Key:** `NEXTAUTH_SECRET`
- **Value:** Generated secret key from Step 2 (min 32 chars)

## Step 4: Verify Secrets

List all repository secrets:

```bash
gh secret list
```

Output should show:
```
JWT_SECRET          (no value shown for security)
MONGODB_URI         (no value shown for security)
NEXTAUTH_SECRET     (no value shown for security)
SERVER_HOST         13.200.254.173
SERVER_USER         ubuntu
SSH_PRIVATE_KEY     (no value shown for security)
```

## Step 5: Test Deployment

1. Make a commit to `main` branch:

```bash
git add .
git commit -m "chore: setup Docker deployment with GitHub Actions"
git push origin main
```

2. Go to **Actions** tab in GitHub
3. Watch the workflow execute
4. It should:
   - ✅ Build Docker image
   - ✅ Run tests
   - ✅ Deploy to EC2

## Secret Rotation Schedule

For security, rotate secrets periodically:

### Monthly
- Regenerate `JWT_SECRET`
- Regenerate `NEXTAUTH_SECRET`

### Quarterly
- Rotate `MONGODB_URI` and database password
- Consider creating new SSH key pair

### When Compromised
- Immediately regenerate all secrets
- Revoke old SSH key from EC2
- Update GitHub Actions secrets

## Security Best Practices

### ❌ DON'T

- Share secrets in code, issues, or pull requests
- Use test/development secrets in production
- Store secrets in `.env` files (commit to git)
- Use weak secrets (less than 32 characters)
- Reuse the same secret across services

### ✅ DO

- Use strong random secrets (32+ chars)
- Rotate secrets regularly (monthly/quarterly)
- Use different secrets for each environment
- Store database passwords separately
- Restrict secret scope (only GitHub package access when possible)
- Review GitHub Actions logs for secret exposure

## Troubleshooting

### "Authentication failed" in deployment

1. Verify `SSH_PRIVATE_KEY` is copied correctly (including BEGIN/END lines)
2. Verify `SERVER_HOST` and `SERVER_USER` are correct
3. Ensure EC2 security group allows SSH (port 22)
4. Check EC2 key pair matches the provided `.pem` file

### "Failed to build Docker image"

1. Check workflow logs for build errors
2. Verify `Dockerfile` syntax
3. Check `docker-compose.prod.yml` configuration
4. Ensure all environment variables are set

### "Cannot connect to MongoDB"

1. Verify `MONGODB_URI` format is correct
2. Ensure MongoDB container is running (`docker ps`)
3. Check MongoDB password hasn't expired
4. Verify firewall allows MongoDB port (27017)

### "Repository not found" in deployment

1. Verify GitHub API token has repo access
2. Check repository name in workflow is correct
3. Ensure `.github/workflows/docker-deploy.yml` exists

## Testing Without Full Deployment

To test secrets configuration without deploying:

1. Create a test secret:
```bash
gh secret set TEST_SECRET -b "test-value"
```

2. Create a test workflow (`.github/workflows/test-secrets.yml`):
```yaml
name: Test Secrets
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Verify secrets exist
        run: |
          [ ! -z "${{ secrets.SSH_PRIVATE_KEY }}" ] && echo "✓ SSH_PRIVATE_KEY"
          [ ! -z "${{ secrets.SERVER_HOST }}" ] && echo "✓ SERVER_HOST"
          [ ! -z "${{ secrets.SERVER_USER }}" ] && echo "✓ SERVER_USER"
          [ ! -z "${{ secrets.MONGODB_URI }}" ] && echo "✓ MONGODB_URI"
          [ ! -z "${{ secrets.JWT_SECRET }}" ] && echo "✓ JWT_SECRET"
          [ ! -z "${{ secrets.NEXTAUTH_SECRET }}" ] && echo "✓ NEXTAUTH_SECRET"
```

3. Verify all secrets show ✓ in workflow output

## Next Steps

After setting up secrets:

1. ✅ Deploy with `./deploy.sh` or GitHub Actions
2. ✅ Monitor logs at GitHub Actions tab
3. ✅ Can access app at `http://SERVER_HOST:3000`
4. ✅ Set up SSL certificate for HTTPS
5. ✅ Configure domain name (Route 53)

## Additional Resources

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [OpenSSL Guide](https://www.openssl.org/docs/)
