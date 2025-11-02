import * as cdk from 'aws-cdk-lib'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export class ApiGatewayStack extends cdk.Stack {
  public readonly api: apigateway.RestApi

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'NesckaApi', {
      restApiName: 'Nescka Lead Tracker API',
      description: 'API Gateway for Nescka Lead Tracker n8n integration',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key']
      }
    })

    // Get the n8n Load Balancer DNS from context or parameter
    // In production, you'd pass this from the Fargate stack
    const n8nEndpoint = new cdk.CfnParameter(this, 'N8nEndpoint', {
      type: 'String',
      description: 'The endpoint URL for n8n (Load Balancer DNS)',
      default: 'http://nescka-n8n-alb-xxxxx.us-east-1.elb.amazonaws.com' // Will be replaced
    })

    // Create integration for n8n webhooks
    const n8nIntegration = new apigateway.HttpIntegration(
      `${n8nEndpoint.valueAsString}/{proxy}`,
      {
        httpMethod: 'ANY',
        options: {
          requestParameters: {
            'integration.request.path.proxy': 'method.request.path.proxy'
          }
        }
      }
    )

    // Create the webhook proxy resource
    const webhookResource = this.api.root.addResource('webhook')
    webhookResource.addProxy({
      defaultIntegration: n8nIntegration,
      anyMethod: true
    })

    // Create a specific resource for lead processing
    const leadsResource = webhookResource.addResource('leads')
    leadsResource.addMethod('POST', n8nIntegration, {
      apiKeyRequired: false, // Set to true for production
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL
          }
        }
      ]
    })

    // Add CORS to all methods
    this.addCorsOptions(webhookResource)

    // Create usage plan and API key for rate limiting
    const plan = this.api.addUsagePlan('UsagePlan', {
      name: 'NesckaUsagePlan',
      throttle: {
        rateLimit: 100,
        burstLimit: 50
      },
      quota: {
        limit: 10000,
        period: apigateway.Period.MONTH
      }
    })

    const key = this.api.addApiKey('ApiKey', {
      apiKeyName: 'NesckaApiKey'
    })

    plan.addApiKey(key)
    plan.addApiStage({
      stage: this.api.deploymentStage
    })

    // Output the API endpoint
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: this.api.url,
      description: 'API Gateway endpoint URL'
    })

    new cdk.CfnOutput(this, 'WebhookEndpoint', {
      value: `${this.api.url}webhook`,
      description: 'n8n webhook endpoint URL'
    })

    new cdk.CfnOutput(this, 'LeadsEndpoint', {
      value: `${this.api.url}webhook/leads`,
      description: 'Leads processing endpoint URL'
    })
  }

  private addCorsOptions(apiResource: apigateway.IResource) {
    apiResource.addMethod('OPTIONS', new apigateway.MockIntegration({
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'"
        }
      }],
      requestTemplates: { 'application/json': '{"statusCode": 200}' }
    }), {
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true
        }
      }]
    })
  }
}

