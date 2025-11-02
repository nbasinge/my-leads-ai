# Quick Deployment Guide

## Prerequisites

1. **AWS CLI configured**:
   ```bash
   aws configure
   ```

2. **Node.js 18+ installed**

3. **AWS CDK CLI**:
   ```bash
   npm install -g aws-cdk
   ```

## Step-by-Step Deployment

### 1. Install Infrastructure Dependencies

```bash
cd infrastructure
npm install
```

### 2. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://ACCOUNT-ID/REGION
# Example: cdk bootstrap aws://123456789012/us-east-1
```

### 3. Synthesize Templates (Optional)

Verify the CloudFormation templates look correct:

```bash
npm run synth
```

### 4. Deploy n8n on Fargate

```bash
cdk deploy NesckaN8nStack
```

**Expected outputs:**
- LoadBalancer DNS name (note this down!)
- ECS Service Name

**Wait 5-10 minutes** for the Fargate service to stabilize.

### 5. Update API Gateway with n8n Endpoint

Edit `lib/api-gateway-stack.ts` and replace the placeholder endpoint:

```typescript
const n8nEndpoint = new cdk.CfnParameter(this, 'N8nEndpoint', {
  type: 'String',
  description: 'The endpoint URL for n8n',
  default: 'http://YOUR-ALB-DNS-FROM-STEP-4' // Replace this!
})
```

### 6. Deploy API Gateway

```bash
cdk deploy NesckaApiGatewayStack
```

**Expected outputs:**
- ApiEndpoint (your public API URL)
- WebhookEndpoint (n8n webhook URL)
- LeadsEndpoint (leads processing endpoint)

### 7. Verify Deployment

```bash
# Check n8n is responding
curl http://YOUR-ALB-DNS-ADDRESS

# Check API Gateway
curl https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/webhook
```

## Production Setup Checklist

Before going live, ensure:

- [ ] RDS Postgres database configured and connected to n8n
- [ ] HTTPS/SSL certificate set up for ALB
- [ ] Custom domain configured
- [ ] Secrets Manager set up for credentials
- [ ] CloudWatch alarms configured
- [ ] Auto-scaling policies enabled
- [ ] Security groups tightened
- [ ] WAF rules configured
- [ ] Backup strategy in place

## Connecting to n8n

Once deployed, access n8n at:

```
http://YOUR-ALB-DNS-ADDRESS
```

Initial setup wizard will guide you through:
1. Creating admin user
2. Configuring workflows
3. Setting up webhooks

## Troubleshooting

### Service won't start

```bash
# Check ECS service status
aws ecs describe-services --cluster nescka-n8n-cluster --services NesckaN8nStack-N8nService...

# Check CloudWatch logs
aws logs tail /ecs/nescka-n8n --follow
```

### Can't reach n8n

1. Check security groups allow traffic on port 80/5678
2. Verify target group health checks
3. Check ALB target registration
4. Review CloudWatch logs for errors

### API Gateway 502 errors

1. Verify n8n endpoint is correct
2. Check ALB health
3. Review API Gateway logs
4. Ensure VPC connectivity

## Cost Estimation

**Development environment (~$50-100/month)**:
- Fargate: ~$40/month (1 task, 2GB RAM)
- ALB: ~$25/month
- EFS: ~$10/month
- NAT Gateway: ~$35/month
- API Gateway: Pay per use (~$1/month for dev)

**Production environment (~$200-500/month)**:
- Add RDS: ~$100-200/month
- Higher Fargate capacity
- Reserved capacity for savings

## Cleanup

To destroy all resources:

```bash
# Destroy stacks (order matters due to dependencies)
cdk destroy NesckaApiGatewayStack
cdk destroy NesckaN8nStack

# Or destroy everything
cdk destroy --all
```

## Next Steps

1. Set up GitHub Actions for CI/CD
2. Configure Amplify for frontend hosting
3. Connect frontend to API Gateway
4. Build n8n workflows for lead processing
5. Set up monitoring and alerting

