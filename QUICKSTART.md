# Quick Start Guide

Get your Nescka Lead Tracker up and running in 5 minutes!

## 🚀 Option 1: Local Development (Fastest)

Perfect for building features and testing.

### Prerequisites
- Node.js 18+
- Git

### Setup Steps

1. **Clone and Install**:
   ```bash
   git clone https://github.com/nbasinge/my-leads-ai.git
   cd my-leads-ai
   npm install
   ```

2. **Start the App**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   ```
   http://localhost:5173
   ```

✅ **Done!** You're now running the app with mock data.

---

## ☁️ Option 2: Full Stack with AWS (Production-Ready)

For deploying the complete system with n8n automation.

### Prerequisites
- AWS Account with CLI configured
- Supabase account
- ~30 minutes

### Setup Steps

#### 1. Set Up Supabase Database

```bash
# 1. Create project at https://supabase.com
# 2. Copy connection details
# 3. Store in AWS SSM Parameters (see infrastructure/SUPABASE_SETUP.md)
```

Quick SSM setup:
```bash
# Set your Supabase values
export SUPABASE_HOST="db.xxxxxxx.supabase.co"
export SUPABASE_PORT="5432"
export SUPABASE_DB="postgres"
export SUPABASE_USER="postgres"
export SUPABASE_PASSWORD="your-password"

# Create SSM parameters
aws ssm put-parameter --name "/nescka/supabase/host" --value "$SUPABASE_HOST" --type "String"
aws ssm put-parameter --name "/nescka/supabase/port" --value "$SUPABASE_PORT" --type "String"
aws ssm put-parameter --name "/nescka/supabase/database" --value "$SUPABASE_DB" --type "String"
aws ssm put-parameter --name "/nescka/supabase/user" --value "$SUPABASE_USER" --type "String"
aws ssm put-parameter --name "/nescka/supabase/password" --value "$SUPABASE_PASSWORD" --type "SecureString"
```

#### 2. Configure Environment Variables

```bash
# Copy the sample file
cp env.sample .env

# Edit .env with your values
# At minimum, set:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - SUPABASE credentials (from step 1)
```

#### 3. Deploy AWS Infrastructure

```bash
cd infrastructure

# Install CDK dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap

# Deploy n8n on Fargate
cdk deploy NesckaN8nStack

# Note the Load Balancer DNS from output

# Update lib/api-gateway-stack.ts with ALB DNS
# Then deploy API Gateway
cdk deploy NesckaApiGatewayStack
```

#### 4. Configure Amplify (Optional)

```bash
# Via AWS Console:
# 1. Go to AWS Amplify
# 2. Connect your GitHub repo
# 3. Use the amplify.yml config
# 4. Deploy

# Or via CLI:
amplify init
amplify add hosting
amplify publish
```

#### 5. Configure n8n

1. Access n8n at: `http://YOUR-ALB-DNS`
2. Complete the setup wizard
3. Create admin user
4. Build your automation workflows
5. Test webhook endpoint

#### 6. Connect Frontend to Backend

Update your `.env`:
```bash
# Get from API Gateway stack output
VITE_API_ENDPOINT=https://your-api-id.execute-api.us-east-1.amazonaws.com/prod
VITE_N8N_LEADS_WEBHOOK_URL=${VITE_API_ENDPOINT}/webhook/leads
```

Rebuild frontend:
```bash
npm run build
```

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  React Frontend │  ← Amplify Hosting
│   (Vite + TS)   │
└────────┬────────┘
         │ HTTP
         ↓
┌─────────────────┐
│   API Gateway   │  ← AWS API Gateway
│   (Webhooks)    │
└────────┬────────┘
         │ Proxy
         ↓
┌─────────────────┐
│  n8n Fargate    │  ← ECS on Fargate
│  (Automation)   │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│    Supabase     │  ← Managed PostgreSQL
│   (Database)    │
└─────────────────┘
```

---

## 🎯 What's Next?

### For Developers
- [ ] Customize the UI in `src/App.tsx`
- [ ] Add your own lead sources
- [ ] Build n8n workflows for automation
- [ ] Integrate AI features

### For DevOps
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring and alerts
- [ ] Enable auto-scaling
- [ ] Set up backup strategy

### For Business
- [ ] Configure lead scoring rules
- [ ] Set up email templates
- [ ] Build custom reports
- [ ] Train team on n8n workflows

---

## 🆘 Troubleshooting

### Can't access n8n
- Check ALB security groups allow port 80
- Verify Fargate service is running
- Review CloudWatch logs

### Database connection fails
- Verify SSM parameters are set correctly
- Check Supabase connection string
- Ensure SSL is enabled

### API Gateway 502 errors
- Confirm n8n endpoint is correct
- Check ALB target health
- Review API Gateway logs

### Frontend can't connect
- Verify API endpoint in `.env`
- Check CORS settings
- Ensure API Gateway is deployed

---

## 📚 Documentation

- [Frontend README](README.md)
- [AWS Infrastructure](infrastructure/README.md)
- [Deployment Guide](infrastructure/DEPLOYMENT.md)
- [Supabase Setup](infrastructure/SUPABASE_SETUP.md)
- [Environment Variables](env.sample)

---

## 🎉 You're Ready!

Your Nescka Lead Tracker is now running. Start tracking leads and automating workflows!

**Questions?** Open an issue on GitHub or check the docs above.

