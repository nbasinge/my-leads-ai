#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { N8nFargateStack } from '../lib/n8n-fargate-stack'
import { ApiGatewayStack } from '../lib/api-gateway-stack'

const app = new cdk.App()

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
}

// Create the n8n Fargate stack
const n8nStack = new N8nFargateStack(app, 'NesckaN8nStack', {
  env,
  description: 'Nescka Lead Tracker - n8n on Fargate infrastructure'
})

// Create the API Gateway stack
const apiStack = new ApiGatewayStack(app, 'NesckaApiGatewayStack', {
  env,
  description: 'Nescka Lead Tracker - API Gateway for n8n webhooks'
})

// Output the API endpoint for easy reference
apiStack.addDependency(n8nStack)

