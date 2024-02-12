import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const hello = new nodejs.NodejsFunction(this, 'HelloHandler', {
      runtime: Runtime.NODEJS_20_X,
      entry: 'lambda/hello.ts',
      handler: 'handler',
    });

    const helloHitcounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello
    });

    const hellogw = new apigw.LambdaRestApi(this, "Endpoint", {
      handler: helloHitcounter.handler
    });

    new TableViewer(this, 'ViewHitCounter', {
      sortBy: 'hits',
      title: 'Hello Hits',
      table: helloHitcounter.table
    });
  }
}
