import * as cdk from 'aws-cdk-lib';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export interface HitCounterProps {
    downstream: lambda.IFunction;
}

export class HitCounter extends Construct {

    public readonly handler: lambda.Function;
    public readonly table: dynamodb.Table;

    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id);

        this.table = new dynamodb.Table(this, "hits", {
            partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
            removalPolicy: cdk.RemovalPolicy.DESTROY
        });


        this.handler = new nodejs.NodejsFunction(this, 'HelloHandler', {
            runtime: lambda.Runtime.NODEJS_20_X,
            entry: 'lambda/hitcounter.ts',
            handler: 'handler',
            environment: {
                HITS_TABLE_NAME: this.table.tableName,
                DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName
            }
        });

        this.table.grantReadWriteData(this.handler);
        props.downstream.grantInvoke(this.handler);
    }
}