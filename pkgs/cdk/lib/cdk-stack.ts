import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import type { Construct } from "constructs";
import * as dotenv from "dotenv";
import { execSync } from "node:child_process";
import * as fs from "node:fs";
import { join } from "node:path";

dotenv.config();

const { FACILITATOR_URL, ADDRESS, NETWORK, ENDPOINT_PATH, PRIVATE_KEY } =
  process.env;

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create VPC for Fargate service
    const vpc = new ec2.Vpc(this, "X402Vpc", {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECR repository reference (assuming it already exists)
    const backendRepo = ecr.Repository.fromRepositoryName(
      this,
      "BackendRepo",
      "x402-backend-api"
    );

    // Create ECS cluster
    const cluster = new ecs.Cluster(this, "X402Cluster", {
      vpc,
      clusterName: "x402-cluster",
    });

    // Create Fargate service for backend API
    const backendService =
      new ecsPatterns.ApplicationLoadBalancedFargateService(
        this,
        "BackendService",
        {
          cluster,
          serviceName: "x402-backend-api",
          cpu: 512,
          memoryLimitMiB: 1024,
          desiredCount: 1,
          taskImageOptions: {
            image: ecs.ContainerImage.fromEcrRepository(backendRepo, "latest"),
            containerPort: 4021,
            environment: {
              PORT: "4021",
              NODE_ENV: "production",
              // Add other environment variables as needed
              FACILITATOR_URL: FACILITATOR_URL || "https://facilitator.x402.io",
              ADDRESS: ADDRESS || "0x1234567890123456789012345678901234567890",
              NETWORK: NETWORK || "base-sepolia",
            },
            logDriver: ecs.LogDrivers.awsLogs({
              streamPrefix: "x402-backend",
              logGroup: new logs.LogGroup(this, "BackendLogGroup", {
                logGroupName: "/aws/ecs/x402-backend",
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
      path: "/health",
      healthyHttpCodes: "200",
      interval: cdk.Duration.seconds(30),
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 5,
    });

    // Create Lambda function for MCP server
    const mcpLambdaFunction = new lambda.Function(this, "MCPServerFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(join(__dirname, "../../mcp"), {
        bundling: {
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: ["echo", "Docker bundling disabled"],  // Dummy command
          local: {
            tryBundle(outputDir: string) {
              try {
                const sourceDir = join(__dirname, "../../mcp");

                // Build the project first
                execSync("npm run build", { 
                  cwd: sourceDir, 
                  stdio: "inherit" 
                });

                // Copy built dist files
                execSync(`cp -r ${sourceDir}/dist/* ${outputDir}/`, {
                  stdio: "inherit",
                });

                // Copy minimal package.json (only production dependencies)
                const packageJsonPath = join(sourceDir, "package.json");
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
                const prodPackageJson = {
                  name: packageJson.name,
                  version: packageJson.version,
                  dependencies: packageJson.dependencies,
                  main: packageJson.main || "lambda-server.js"
                };
                
                fs.writeFileSync(
                  join(outputDir, "package.json"), 
                  JSON.stringify(prodPackageJson, null, 2)
                );

                // Install only production dependencies in output directory
                execSync("npm install --production --no-package-lock", {
                  cwd: outputDir,
                  stdio: "inherit",
                });

                return true;
              } catch (error) {
                console.error("Local bundling failed:", error);
                return false;
              }
            },
          },
        },
      }),
      handler: "run.sh",
      environment: {
        ENDPOINT_PATH: ENDPOINT_PATH || "/download",
        PRIVATE_KEY: PRIVATE_KEY || "",
        RESOURCE_SERVER_URL: `http://${backendService.loadBalancer.loadBalancerDnsName}`,
      },
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      architecture: lambda.Architecture.X86_64,
    });

    // Create Function URL for the MCP server
    const mcpFunctionUrl = mcpLambdaFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowCredentials: true,
        allowedHeaders: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedOrigins: ["*"],
        maxAge: cdk.Duration.seconds(86400),
      },
    });

    // Output the URLs
    new cdk.CfnOutput(this, "BackendApiUrl", {
      value: `http://${backendService.loadBalancer.loadBalancerDnsName}`,
      description: "Backend API Load Balancer URL",
    });

    new cdk.CfnOutput(this, "MCPServerUrl", {
      value: mcpFunctionUrl.url,
      description: "MCP Server Function URL",
    });

    new cdk.CfnOutput(this, "VpcId", {
      value: vpc.vpcId,
      description: "VPC ID",
    });
  }
}
