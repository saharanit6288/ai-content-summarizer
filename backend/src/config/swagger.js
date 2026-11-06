import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",

    info: {
      title: "AI Content Summarizer API",
      version: "1.0.0",
      description:
        "API documentation for the AI Content Summarizer application.",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token.",
        },
      },

      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },

        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
        },

        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              format: "password",
              example: "Password123!",
            },
          },
        },

        TextSummaryRequest: {
          type: "object",
          required: ["inputText"],
          properties: {
            inputText: {
              type: "string",
              minLength: 100,
              maxLength: 100000,
              example:
                "This is sample content that contains enough text for the summarization API.",
            },
            wordLimit: {
              type: "integer",
              minimum: 50,
              maximum: 500,
              default: 150,
              example: 100,
            },
          },
        },

        UrlSummaryRequest: {
          type: "object",
          required: ["url"],
          properties: {
            url: {
              type: "string",
              format: "uri",
              example: "https://example.com/article",
            },
            wordLimit: {
              type: "integer",
              minimum: 50,
              maximum: 500,
              default: 150,
              example: 150,
            },
          },
        },

        SummaryResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            summaryText: {
              type: "string",
              example: "This is the generated summary.",
            },
          },
        },
      },
    },

    paths: {
      "/api/health": {
        get: {
          tags: ["Health"],
          summary: "Check API health",
          responses: {
            200: {
              description: "API is running",
            },
          },
        },
      },

      "/api/db-health": {
        get: {
          tags: ["Health"],
          summary: "Check database connection",
          responses: {
            200: {
              description: "Database connection successful",
            },
            500: {
              description: "Database connection failed",
            },
          },
        },
      },

      "/api/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/RegisterRequest",
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Invalid input" },
            409: { description: "Email already registered" },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login and obtain JWT token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            400: { description: "Invalid input" },
            401: { description: "Invalid credentials" },
          },
        },
      },

      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get current authenticated user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User details returned" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/summaries": {
        post: {
          tags: ["Summaries"],
          summary: "Generate summary from text",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TextSummaryRequest",
                },
              },
            },
          },
          responses: {
            200: {
              description: "Summary generated successfully",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SummaryResponse",
                  },
                },
              },
            },
            400: { description: "Invalid input" },
            401: { description: "Unauthorized" },
          },
        },

        get: {
          tags: ["Summaries"],
          summary: "Get summary history",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              schema: { type: "integer", default: 1 },
            },
            {
              name: "limit",
              in: "query",
              schema: {
                type: "integer",
                minimum: 1,
                maximum: 50,
                default: 10,
              },
            },
            {
              name: "sourceType",
              in: "query",
              schema: {
                type: "string",
                enum: ["TEXT", "URL", "PDF", "DOCX"],
              },
            },
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["COMPLETED", "FAILED"],
              },
            },
          ],
          responses: {
            200: { description: "Summary history returned" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/summaries/stats": {
        get: {
          tags: ["Summaries"],
          summary: "Get dashboard statistics",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Dashboard statistics returned" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/summaries/from-url": {
        post: {
          tags: ["Summaries"],
          summary: "Generate summary from website URL",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UrlSummaryRequest",
                },
              },
            },
          },
          responses: {
            200: { description: "Website summary generated" },
            400: { description: "Invalid URL or input" },
            401: { description: "Unauthorized" },
          },
        },
      },

      "/api/summaries/from-file": {
        post: {
          tags: ["Summaries"],
          summary: "Generate summary from PDF or DOCX",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: {
                    file: {
                      type: "string",
                      format: "binary",
                    },
                    wordLimit: {
                      type: "integer",
                      minimum: 50,
                      maximum: 500,
                      default: 150,
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Document summary generated" },
            400: { description: "Invalid document" },
            401: { description: "Unauthorized" },
            413: { description: "File exceeds upload limit" },
          },
        },
      },

      "/api/summaries/{id}": {
        get: {
          tags: ["Summaries"],
          summary: "Get summary details",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Summary details returned" },
            401: { description: "Unauthorized" },
            404: { description: "Summary not found" },
          },
        },

        delete: {
          tags: ["Summaries"],
          summary: "Delete a summary",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Summary deleted successfully" },
            401: { description: "Unauthorized" },
            404: { description: "Summary not found" },
          },
        },
      },
    },
  },

  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;