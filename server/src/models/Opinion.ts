
import { Schema, model, Types } from "mongoose";

const opinionSchema = new Schema(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },

    content: {
      text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },
    },

    location: {
      displayName: {
        type: String,
        required: true,
        maxlength: 300,
      },

      normalizedName: {
        type: String,
        required: true,
        maxlength: 300,
      },

      countryCode: {
        type: String,
        maxlength: 2,
      },

      region: {
        type: String,
        maxlength: 150,
      },

      city: {
        type: String,
        maxlength: 150,
      },

      osmType: {
        type: String,
        required: true,
        maxlength: 20,
      },

      osmId: {
        type: String,
        required: true,
        maxlength: 40,
      },

      geo: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
          default: "Point",
        },

        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: (coordinates: number[]) =>
              Array.isArray(coordinates) &&
              coordinates.length === 2 &&
              coordinates.every(Number.isFinite) &&
              coordinates[0] >= -180 &&
              coordinates[0] <= 180 &&
              coordinates[1] >= -90 &&
              coordinates[1] <= 90,
            message: "Invalid GeoJSON coordinates",
          },
        },
      },
    },

    status: {
      type: String,
      enum: ["published", "hidden", "deleted"],
      default: "published",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

opinionSchema.index({
  status: 1,
  createdAt: -1,
  _id: -1,
});

opinionSchema.index({
  authorId: 1,
  createdAt: -1,
  _id: -1,
});

opinionSchema.index({
  "location.normalizedName": 1,
  status: 1,
  createdAt: -1,
  _id: -1,
});

opinionSchema.index({
  "location.geo": "2dsphere",
});

export interface OpinionDocument {
  _id: Types.ObjectId;
  authorId: Types.ObjectId;
  content: { text: string };
  location: {
    displayName: string;
    normalizedName: string;
    countryCode?: string;
    region?: string;
    city?: string;
    osmType: string;
    osmId: string;
    geo: {
      type: "Point";
      coordinates: [number, number];
    };
  };
  status: "published" | "hidden" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

export const OpinionModel = model(
  "Opinion",
  opinionSchema
);
