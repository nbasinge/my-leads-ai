# n8n Workflows

This directory contains n8n workflow definitions that can be imported into your n8n instance.

## Available Workflows

### `example-leads-processor.json`
A sample workflow for processing incoming leads:

1. **Webhook** - Receives lead data from external sources
2. **Insert Lead** - Saves to Supabase database
3. **AI Analysis** - Analyzes lead quality (optional, requires OpenAI)
4. **Notify Dashboard** - Updates frontend (optional)

## Loading Workflows

### Option 1: Import via UI (Recommended for Testing)
1. Access n8n UI at your ALB DNS
2. Click "Workflows" → "Import from File"
3. Select the JSON file
4. Configure credentials
5. Activate the workflow

### Option 2: Load via API (Automated)
```bash
# Get workflow ID after deployment
WORKFLOW_ID=$(cat workflows/example-leads-processor.json | jq -r '.id')

# Import via n8n API
curl -X POST \
  http://YOUR-ALB-DNS/api/v1/workflows \
  -H 'Content-Type: application/json' \
  -H 'X-N8N-API-KEY: your-api-key' \
  -d @workflows/example-leads-processor.json
```

### Option 3: Load on Startup (Most Reliable)
Set environment variable in your Fargate task:
```typescript
N8N_WORKFLOW_DIR: '/home/node/.n8n/workflows'
```

Then mount your workflows as a Docker volume or EFS mount.

## Customization

Edit the JSON files to:
- Change node configurations
- Add/remove nodes
- Update credentials
- Modify data transformations

## Version Control

All workflows here are version controlled, so you can:
- Track changes with Git
- Roll back to previous versions
- Deploy specific versions to environments
- Review changes in PRs

## Production Deployment

For production, consider:
1. **Workflow validation**: Test locally first
2. **Credential management**: Use SSM/Secrets Manager
3. **Monitoring**: Set up CloudWatch alerts
4. **Backup**: Export workflows regularly
5. **CI/CD**: Automate workflow deployment

## Next Steps

1. Start with the example workflow
2. Customize for your needs
3. Add more workflows as needed
4. Set up automated deployment
5. Monitor and iterate

