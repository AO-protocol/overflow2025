import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

dotenv.config();

const {
  FACILITATOR_URL,
  ADDRESS,
  NETWORK,
  ENDPOINT_PATH,
  PRIVATE_KEY
} = process.env;

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for Fargate service
    const vpc = new ec2.Vpc(this, 'X402Vpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECR repository reference (assuming it already exists)
    const backendRepo = ecr.Repository.fromRepositoryName(
      this,
      'BackendRepo',
      'x402-backend-api'
    );

    // Create ECS cluster
    const cluster = new ecs.Cluster(this, 'X402Cluster', {
      vpc,
      clusterName: 'x402-cluster',
    });

    // Create Fargate service for backend API
    const backendService = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'BackendService',
      {
        cluster,
        serviceName: 'x402-backend-api',
        cpu: 512,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromEcrRepository(backendRepo, 'latest'),
          containerPort: 4021,
          environment: {
            PORT: '4021',
            NODE_ENV: 'production',
            // Add other environment variables as needed
            FACILITATOR_URL: FACILITATOR_URL || 'https://facilitator.x402.io',
            ADDRESS: ADDRESS || '0x1234567890123456789012345678901234567890',
            NETWORK: NETWORK || 'base-sepolia',
          },
          logDriver: ecs.LogDrivers.awsLogs({
            streamPrefix: 'x402-backend',
            logGroup: new logs.LogGroup(this, 'BackendLogGroup', {
              logGroupName: '/aws/ecs/x402-backend',
              retention: logs.RetentionDays.ONE_WEEK,
              removalPolicy: cdk.RemovalPolicy.DESTROY,
            }),
          }),
        },
        publicLoadBalancer: true,
        assignPublicIp: true,
        healthCheckGracePeriod: cdk.Duration.seconds(300),
      }
    );

    // Configure health check for the target group
    backendService.targetGroup.configureHealthCheck({
      path: '/health',
      healthyHttpCodes: '200',
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
    });

    // Create Lambda function for MCP server
    const mcpLambdaFunction = new lambda.Function(
      this,
      'MCPServerFunction',
      {
        runtime: lambda.Runtime.NODEJS_22_X,
        code: lambda.Code.fromAsset(join(__dirname, '../../mcp'), {
          bundling: {
            image: lambda.Runtime.NODEJS_22_X.bundlingImage,
            command: [
              'bash', '-c', [
                'npm install --production',
                'npm run build',
                'cp -r dist/* /asset-output/',
                'cp -r node_modules /asset-output/',
                'cp package.json /asset-output/'
              ].join(' && ')
            ],
            local: {
              tryBundle(outputDir: string) {
                try {
                  const sourceDir = join(__dirname, '../../mcp');
                  
                  // Install production dependencies
                  execSync('npm install --production', { cwd: sourceDir, stdio: 'inherit' });
                  
                  // Build the project
                  execSync('npm run build', { cwd: sourceDir, stdio: 'inherit' });
                  
                  // Copy dist files
                  execSync(`cp -r ${sourceDir}/dist/* ${outputDir}/`, { stdio: 'inherit' });
                  
                  // Copy node_modules
                  execSync(`cp -r ${sourceDir}/node_modules ${outputDir}/`, { stdio: 'inherit' });
                  
                  // Copy package.json
                  execSync(`cp ${sourceDir}/package.json ${outputDir}/`, { stdio: 'inherit' });
                  
                  return true;
                } catch (error) {
                  console.error('Local bundling failed:', error);
                  return false;
                }
              }
            }
          }
        }),
        handler: 'lambda-server.handler',
        environment: {
          ENDPOINT_PATH: ENDPOINT_PATH || '/download',
          PRIVATE_KEY: PRIVATE_KEY || '',
          RESOURCE_SERVER_URL: `http://${backendService.loadBalancer.loadBalancerDnsName}`
        },
        timeout: cdk.Duration.minutes(5),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
      }
    );

    // Create Function URL for the MCP server
    const mcpFunctionUrl = mcpLambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowCredentials: true,
        allowedHeaders: ['*'],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedOrigins: ['*'],
        maxAge: cdk.Duration.seconds(86400),
      },
    });

    // Output the URLs
    new cdk.CfnOutput(this, 'BackendApiUrl', {
      value: `http://${backendService.loadBalancer.loadBalancerDnsName}`,
      description: 'Backend API Load Balancer URL',
    });

    new cdk.CfnOutput(this, 'MCPServerUrl', {
      value: mcpFunctionUrl.url,
      description: 'MCP Server Function URL',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      description: 'VPC ID',
    });
  }
}
