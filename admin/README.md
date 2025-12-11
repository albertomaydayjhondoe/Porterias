# Admin Panel - Setup Guide

This document explains how to set up and use the admin panel for managing comic strips in the Porterias repository.

## Prerequisites

- Node.js installed (v18 or higher recommended)
- Write access to the `albertomaydayjhondoe/Porterias` repository
- A GitHub Personal Access Token with repository permissions

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give your token a descriptive name (e.g., "Porterias Admin")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

### 2. Configure the Token

#### For Local Development:

Create a `.env` file in the project root (if it doesn't exist) and add:

```bash
ADMIN_GH_TOKEN=your_github_token_here
```

**Important:** The `.env` file should already be in `.gitignore` to prevent accidentally committing your token.

#### For GitHub Actions (CI/CD):

1. Go to the repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `ADMIN_GH_TOKEN`
4. Value: Paste your GitHub token
5. Click "Add secret"

**Note:** The current admin panel at `/admin` uses Supabase authentication. The ADMIN_GH_TOKEN is primarily for use with the command-line script and future GitHub API integrations.

## Usage

### Using the Command-Line Script

The `scripts/admin.mjs` script allows you to manage strips from the command line:

#### Add a new strip:

```bash
node scripts/admin.mjs add --title "Strip Title" --image "strip-021.png" --date "2025-12-11"
```

**Note:** After running this command:
1. Copy your image file to `public/strips/strip-021.png`
2. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Add new strip: Strip Title"
   git push
   ```

#### List all strips:

```bash
node scripts/admin.mjs list
```

#### Remove a strip:

```bash
node scripts/admin.mjs remove --id "strip-id-here"
```

#### Get help:

```bash
node scripts/admin.mjs help
```

### Using the Web Admin Panel

The web admin panel is available at `/admin` and uses Supabase authentication. To access it:

1. Navigate to `/admin` on the live site
2. Log in with your Supabase credentials (configured separately)
3. The panel allows you to manage strips through the Supabase backend

For direct GitHub integration and automated commits, use the command-line script described above.

## Security Notes

### ⚠️ Important Security Considerations:

1. **Never commit your GitHub token to the repository**
   - Always use environment variables or GitHub Secrets
   - The `.env` file is gitignored for this reason

2. **Token Permissions**
   - Use a token with minimal required permissions
   - Consider creating a dedicated token just for the admin panel
   - Regularly rotate your tokens

3. **Web Admin Access**
   - The web admin panel requires authentication
   - Tokens are stored in session storage (cleared on browser close)
   - Consider implementing additional authentication layers for production

## File Structure

```
Porterias/
├── admin/
│   └── README.md           # This file
├── public/
│   ├── data/
│   │   └── strips.json     # Comic strips data
│   └── strips/             # Comic strip images
│       ├── strip-001.png
│       ├── strip-002.png
│       └── ...
├── scripts/
│   ├── admin.mjs           # Command-line admin tool
│   └── merge-strips.js     # Script to merge/deduplicate strips
└── src/
    ├── pages/
    │   └── Admin.tsx       # Web admin panel
    └── services/
        └── data.ts         # Data loading service
```

## Troubleshooting

### "Authentication failed" error

- Verify your token is correct and hasn't expired
- Check that the token has the correct permissions (`repo` scope)
- Ensure the token is properly set in your environment

### Changes not appearing on the site

- Verify the changes were committed and pushed to GitHub
- Wait for GitHub Pages to rebuild (can take a few minutes)
- Clear your browser cache

### "Cannot read strips.json" error

- Ensure `public/data/strips.json` exists
- Run `node scripts/merge-strips.js` to regenerate the file
- Check file permissions

## Data Format

The `public/data/strips.json` file follows this structure:

```json
{
  "strips": [
    {
      "id": "unique-id",
      "title": "Strip Title",
      "image_url": "/Porterias/strips/strip-001.png",
      "publish_date": "2025-12-10",
      "media_type": "image"
    }
  ]
}
```

## Support

For issues or questions, please open an issue on the GitHub repository.
