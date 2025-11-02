# Supabase Database Setup for n8n

This guide explains how to configure Supabase PostgreSQL database for n8n on Fargate.

## Why Supabase?

- **Serverless**: No infrastructure to manage
- **Cost-effective**: Free tier available, pay-as-you-go scaling
- **Modern**: Built on PostgreSQL with great developer experience
- **Easy**: No RDS maintenance, automatic backups included
- **Fast**: Global CDN and edge functions

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose a name: `nescka-n8n-db`
5. Set a strong database password (save this!)
6. Choose a region (recommend same as AWS deployment)
7. Click "Create new project"

**Wait 1-2 minutes** for the project to be provisioned.

### 2. Get Connection Details

From your Supabase dashboard:

1. Go to **Settings** → **Database**
2. Find the **Connection string** section
3. Select **Connection string** → **URI**
4. Copy the connection string

It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxx.supabase.co:5432/postgres
```

From this, extract:
- **Host**: `db.xxxxxxx.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `[YOUR-PASSWORD]`

### 3. Create n8n Database (Optional)

You can use the default `postgres` database or create a dedicated one:

```sql
-- Connect via Supabase SQL Editor
CREATE DATABASE n8n;

-- Or just use the default postgres database
```

### 4. Store Secrets in AWS Systems Manager

You need to create SSM parameters for the Supabase connection:

```bash
# Set your Supabase credentials
export SUPABASE_HOST="db.xxxxxxx.supabase.co"
export SUPABASE_PORT="5432"
export SUPABASE_DB="postgres"
export SUPABASE_USER="postgres"
export SUPABASE_PASSWORD="your-secure-password"

# Create SSM parameters
aws ssm put-parameter \
  --name "/nescka/supabase/host" \
  --value "$SUPABASE_HOST" \
  --type "String" \
  --description "Supabase database host"

aws ssm put-parameter \
  --name "/nescka/supabase/port" \
  --value "$SUPABASE_PORT" \
  --type "String" \
  --description "Supabase database port"

aws ssm put-parameter \
  --name "/nescka/supabase/database" \
  --value "$SUPABASE_DB" \
  --type "String" \
  --description "Supabase database name"

aws ssm put-parameter \
  --name "/nescka/supabase/user" \
  --value "$SUPABASE_USER" \
  --type "String" \
  --description "Supabase database user"

aws ssm put-parameter \
  --name "/nescka/supabase/password" \
  --value "$SUPABASE_PASSWORD" \
  --type "SecureString" \
  --description "Supabase database password" \
  --with-decryption
```

### 5. Update ECS Task Role

The CDK will automatically grant permissions, but verify the task role has:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters",
        "ssm:GetParameter",
        "ssm:GetParameterHistory"
      ],
      "Resource": "arn:aws:ssm:*:*:parameter/nescka/supabase/*"
    }
  ]
}
```

### 6. Configure Connection Pooling (Recommended)

Supabase uses connection pooling. Update your SSM parameter to use the pooler:

```bash
# Connection pooler port is 6543
aws ssm put-parameter \
  --name "/nescka/supabase/port" \
  --value "6543" \
  --overwrite

# Update host to use pooler
aws ssm put-parameter \
  --name "/nescka/supabase/host" \
  --value "db.xxxxxxx.supabase.co" \
  --overwrite
```

**Note**: Use the pooler (`:6543`) for Serverless/Edge functions, or direct connection (`:5432`) for VPC connections.

### 7. Test Connection Locally (Optional)

Test n8n connection before deploying:

```bash
docker run -it --rm \
  -e DB_TYPE=postgresdb \
  -e DB_POSTGRESDB_HOST=db.xxxxxxx.supabase.co \
  -e DB_POSTGRESDB_PORT=5432 \
  -e DB_POSTGRESDB_DATABASE=postgres \
  -e DB_POSTGRESDB_USER=postgres \
  -e DB_POSTGRESDB_PASSWORD=your-password \
  -p 5678:5678 \
  n8nio/n8n
```

Visit `http://localhost:5678` to verify it works.

### 8. Deploy Fargate Stack

```bash
cd infrastructure
cdk deploy NesckaN8nStack
```

n8n will automatically connect to Supabase on startup.

## Security Best Practices

1. **Use Supabase Vault** for sensitive data
2. **Enable Row Level Security** for production
3. **Rotate passwords** regularly
4. **Use connection pooling** to limit connections
5. **Monitor** connection limits (free tier: 4 connections)
6. **Set up backups** (Supabase handles this automatically)

## Connection Limits

**Free Tier**:
- 500MB database
- 2GB bandwidth
- 4 direct connections
- Unlimited pooler connections

**Pro Tier** ($25/month):
- 8GB database
- 50GB bandwidth
- 60 direct connections
- Unlimited pooler connections

## Troubleshooting

### Connection Timeout

Check security groups allow outbound traffic to port 5432/6543.

### Too Many Connections

Use the pooler on port 6543 instead of direct port 5432.

### SSL Required

Add environment variable:
```typescript
environment: {
  DB_POSTGRESDB_SSL: 'true'
}
```

### Test from Fargate

SSH into Fargate task and test:
```bash
aws ecs execute-command \
  --cluster nescka-n8n-cluster \
  --task TASK_ID \
  --container N8nContainer \
  --interactive \
  --command "/bin/bash"

# Inside container
psql -h db.xxxxxxx.supabase.co -U postgres -d postgres
```

## Migration from RDS

If you're migrating from RDS:

1. Export data from RDS
2. Import to Supabase
3. Update SSM parameters
4. Redeploy Fargate service
5. Verify connection

## Cost Comparison

**Supabase Free** vs **RDS Free**:
- Both offer free tiers
- Supabase: No management overhead
- RDS: More control, but you manage everything
- Supabase Pro: $25/month vs RDS ~$15-40/month

**Winner**: Supabase for rapid development and zero ops!

