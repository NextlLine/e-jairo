#!/usr/bin/env node
const { DynamoDBClient, ScanCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const TableName = process.env.DYNAMODB_TABLE_NAME;
const REGION = process.env.AWS_REGION || 'us-east-1';

if (!TableName) {
  console.error('DYNAMODB_TABLE_NAME env var is required');
  process.exit(1);
}

const client = new DynamoDBClient({ region: REGION });

(async function backfill() {
  console.log('Starting backfill for documents GSI...');

  let ExclusiveStartKey = undefined;
  let scanned = 0;
  do {
    const params = {
      TableName,
      FilterExpression: '#e = :doc',
      ExpressionAttributeNames: { '#e': 'entity' },
      ExpressionAttributeValues: { ':doc': { S: 'DOCUMENT' } },
      ExclusiveStartKey,
      Limit: 100,
    };

    const res = await client.send(new ScanCommand(params));

    for (const item of res.Items || []) {
      scanned++;
      const pk = item.PK.S;
      const sk = item.SK.S;
      const createdAt = item.createdAt && item.createdAt.S ? item.createdAt.S : new Date().toISOString();
      const name = item.name && item.name.S ? item.name.S : '';

      const nameNormalized = name
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

      const updateParams = {
        TableName,
        Key: { PK: { S: pk }, SK: { S: sk } },
        UpdateExpression: 'SET GSI2PK = :gpk, GSI2SK = :gsk, nameNormalized = :nn',
        ExpressionAttributeValues: {
          ':gpk': { S: 'ENTITY#DOCUMENT' },
          ':gsk': { S: createdAt },
          ':nn': { S: nameNormalized },
        },
      };

      await client.send(new UpdateItemCommand(updateParams));
      process.stdout.write('.');
    }

    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  console.log('\nBackfill complete. Scanned items: ' + scanned);
})();
