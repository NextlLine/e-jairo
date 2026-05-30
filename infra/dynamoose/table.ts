import dynamoose from "./client";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

if (!TABLE_NAME) {
  throw new Error("DYNAMODB_TABLE_NAME not set in environment variables");
}

const AppTableSchema = new dynamoose.Schema(
  {
    PK: {
      type: String,
      hashKey: true,
    },
    SK: {
      type: String,
      rangeKey: true,
    },

    GSI1PK: {
      type: String,
      required: false,
      index: {
        name: "GSI1",
        rangeKey: "GSI1SK",
        project: true,
      },
    },
    GSI1SK: {
      type: String,
      required: false,
    },

    GSI2PK: {
      type: String,
      required: false,
      index: {
        name: "GSI2",
        rangeKey: "GSI2SK",
        project: true,
      },
    },
    GSI2SK: {
      type: String,
      required: false,
    },

    entity: {
      type: String,
      required: true,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);

export const AppTable = dynamoose.model(TABLE_NAME, AppTableSchema, {
  create: false,
  update: false,
  waitForActive: false,
});
