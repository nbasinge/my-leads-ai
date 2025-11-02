# Nescka Lead Tracker - AWS Infrastructure

AWS CDK infrastructure for deploying Nescka Lead Tracker with n8n automation on AWS Fargate.

## Architecture

- **n8n on Fargate**: Runs n8n automation workflows in a serverless container
- **API Gateway**: Provides a managed API endpoint that proxies to n8n webhooks
- **Application Load Balancer**: Routes traffic to Fargate services
- **VPC**: Isolated network with public and private subnets

## Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed: `npm install -g aws-cdk`

## Setup

1. Install dependencies:
```bash
cd infrastructure
npm install
```

2. Bootstrap CDK in your AWS account (first time only):
```bash
cdk bootstrap
```

3. Deploy the infrastructure:
```bash
npm run deploy
```

Or deploy stacks individually:
```bash
cdk deploy NesckaN8nStack
cdk deploy NesckaApiGatewayStack
```

## Configuration

### Environment Variables

Set these before deployment:

```bash
export CDK_DEFAULT_ACCOUNT=123456789012
export CDK_DEFAULT_REGION=us-east-1
```

### n8n Configuration

Update the n8n Fargate stack (`lib/n8n-fargate-stack.ts`) with:

1. **Database**: Replace the RDS endpoint with your actual Postgres instance
2. **Domain**: For production, set up a custom domain with ACM certificate
3. **Secrets**: Use AWS Secrets Manager for sensitive environment variables

## Deployment

### Initial Deployment

```bash
# Install dependencies
npm install

# Synthesize CloudFormation templates
npm run synth

# Deploy all stacks
npm run deploy

# Or deploy interactively
cdk deploy --all
```

### Update Configuration

After deploying, update the API Gateway stack with the actual n8n ALB endpoint:

1. Get the ALB DNS from the n8n stack output
2. Update `lib/api-gateway-stack.ts` with the actual endpoint
3. Redeploy: `cdk deploy NesckaApiGatewayStack`

## Outputs

After deployment, you'll get:

- **LoadBalancerDNS**: n8n service endpoint
- **ApiEndpoint**: API Gateway base URL
- **WebhookEndpoint**: Complete webhook URL for n8n
- **LeadsEndpoint**: Direct leads processing endpoint

## Cost Optimization

- **Development**: Consider using Spot Fargate instances
- **Production**: Use Reserved Capacity for predictable costs
- **Auto-scaling**: Configure ECS Auto Scaling based on CPU/Memory
- **Monitoring**: Set up CloudWatch alarms for cost anomalies

## Security

- Use VPC endpoints for AWS services
- Enable ALB logging
- Implement WAF rules for API Gateway
- Use Secrets Manager for credentials
- Enable encryption at rest and in transit

## Next Steps

1. Set up RDS Postgres for n8n data persistence
2. Configure HTTPS with ACM certificate
3. Add CloudWatch alarms and dashboards
4. Set up auto-scaling policies
5. Configure backup and disaster recovery

## Cleanup

To destroy all resources:

```bash
cdk destroy --all
```

## Useful Commands

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes and compile
- `npm run test` - Run unit tests
- `cdk synth` - Emit synthesized CloudFormation template
- `cdk deploy` - Deploy stack(s) to AWS
- `cdk diff` - Compare deployed stack with current state
- `cdk destroy` - Destroy all stacks

## Reference

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [n8n Documentation](https://docs.n8n.io/)
- [ECS on Fargate](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html)

