import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as efs from 'aws-cdk-lib/aws-efs'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

export class N8nFargateStack extends cdk.Stack {
  public readonly service: ecs.FargateService
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create VPC for the infrastructure
    const vpc = new ec2.Vpc(this, 'N8nVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        }
      ]
    })

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'N8nCluster', {
      vpc,
      clusterName: 'nescka-n8n-cluster',
      containerInsights: true
    })

    // Create ALB
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, 'N8nLoadBalancer', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'nescka-n8n-alb'
    })

    // Create Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'N8nTargetGroup', {
      vpc,
      port: 5678,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: {
        enabled: true,
        path: '/healthz',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30)
      }
    })

    // Add listener
    this.loadBalancer.addListener('N8nListener', {
      port: 80,
      defaultTargetGroups: [targetGroup]
    })

    // Create Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'N8nTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024
    })

    // Create CloudWatch Log Group
    const logGroup = new logs.LogGroup(this, 'N8nLogGroup', {
      logGroupName: '/ecs/nescka-n8n',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // Create Log Driver
    const logDriver = new ecs.AwsLogDriver({
      streamPrefix: 'n8n',
      logGroup
    })

    // Add n8n container
    const n8nContainer = taskDefinition.addContainer('N8nContainer', {
      image: ecs.ContainerImage.fromRegistry('n8nio/n8n'),
      logging: logDriver,
      environment: {
        N8N_HOST: this.loadBalancer.loadBalancerDnsName,
        N8N_PROTOCOL: 'http',
        N8N_PORT: '5678',
        N8N_METRICS: 'true',
        EXECUTIONS_PROCESS: 'main',
        DB_TYPE: 'postgresdb',
        DB_POSTGRESDB_HOST: 'nescka-n8n-db.cluster-xxxxx.us-east-1.rds.amazonaws.com', // TODO: Replace with actual RDS endpoint
        DB_POSTGRESDB_PORT: '5432',
        DB_POSTGRESDB_DATABASE: 'n8n',
        DB_POSTGRESDB_USER: 'n8n_admin',
        WEBHOOK_URL: `http://${this.loadBalancer.loadBalancerDnsName}/webhook`
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:5678/healthz || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3
      }
    })

    // Map container port
    n8nContainer.addPortMappings({
      containerPort: 5678,
      protocol: ecs.Protocol.TCP
    })

    // Create Fargate Service
    this.service = new ecs.FargateService(this, 'N8nService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      }
    })

    // Attach service to target group
    this.service.attachToApplicationTargetGroup(targetGroup)

    // Create EFS for persistent storage (optional but recommended)
    const fileSystem = new efs.FileSystem(this, 'N8nFileSystem', {
      vpc,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      encrypted: true,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING
    })

    // Grant ECS access to EFS
    fileSystem.grant(this.service.taskDefinition.taskRole, 'elasticfilesystem:DescribeMountTargets')

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: this.loadBalancer.loadBalancerDnsName,
      description: 'DNS name of the load balancer'
    })

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: this.service.serviceName,
      description: 'ECS Service Name'
    })

    // Note: For production, you'd want to:
    // 1. Set up RDS Postgres for persistent data storage
    // 2. Use Application Load Balancer with HTTPS (ACM certificate)
    // 3. Configure auto-scaling
    // 4. Set up CloudWatch alarms
    // 5. Configure backup and disaster recovery
  }
}

