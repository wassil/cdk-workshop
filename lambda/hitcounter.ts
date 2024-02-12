import {DynamoDB, Lambda} from 'aws-sdk';

exports.handler = async function(event: any) {
    console.log("request: ", JSON.stringify(event, undefined, 2));
    const dynamo = new DynamoDB();
    const lambda = new Lambda();

    await dynamo.updateItem({
        TableName: process.env.HITS_TABLE_NAME as string,
        Key: { path: { S: event.path } },
        UpdateExpression: 'ADD hits :incr',
        ExpressionAttributeValues: { ':incr': { N: '1' } }
    }).promise();

    const resp = await lambda.invoke({
        FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME as string,
        Payload: JSON.stringify(event)
      }).promise();

    console.log('downstream response:', JSON.stringify(resp, undefined, 2));

    // return response back to upstream caller
    return JSON.parse(resp.Payload as string);
}