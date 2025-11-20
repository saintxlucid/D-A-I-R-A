# Troubleshooting git push 403 (Permission denied)

This file helps you resolve the common 403 permission error when pushing to GitHub on Windows PowerShell.

## Why it happens
- You don't have permissions on the remote (wrong account or not a collaborator).
- Stored credentials in Windows Credential Manager or Git are stale.
- Using HTTPS remote and credentials are wrong/expired.

## Quick checklist
1. Verify remote URL:

```powershell
git remote -v
```

2. Check that you're logged into the right GitHub account locally (with the GH CLI):

```powershell
gh auth status
```

If not logged in or with wrong account, run:

```powershell
gh auth login
```
```

3. If you want SSH (preferred):
  - Ensure your SSH key is present in the SSH-agent (`ssh-add`), and added to GitHub.
  - Set remote to SSH:

```powershell
git remote set-url origin git@github.com:saintxlucid/D-A-I-R-A.git
```

4. If you prefer HTTPS and PAT token:
  - Create a Personal Access Token (classic or fine-grained) with 'repo' permissions.
  - Use `git remote set-url` with the token — or better, use Git Credential Manager.

5. Re-check remote push:

```powershell
git push origin feat/identity-auth
```

## Additional troubleshooting
- Check your membership/permissions in the repo owner organization.
- If you are using `gh` CLI and push fails for a specific branch, try creating a PR from the gh CLI:

```powershell
gh pr create --base main --head feat/identity-auth --title "feat: identity auth" --body "Open backend auth and cookie flow"
```

## If you still get 403
- Use `gh auth login` to re-authenticate.
- Or, clone the repo with SSH (recommended), then reapply your local branch and push.

---

If you'd like, I can add a helper script to automate these steps for you.
Provide your preferred method: SSH or HTTPS (PAT).
