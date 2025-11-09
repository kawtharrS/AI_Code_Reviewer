import Ajv from 'https://esm.sh/ajv';

const mini_schema = {
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "severity",
      "file",
      "issue",
      "suggestion"
    ],
    "properties": {
      "severity": {
        "type": "string",
        "enum": ["high", "medium", "low"]
      },
      "file": {
        "type": "string",
        "description": "Filename where the issue was found"
      },
      "issue": {
        "type": "string",
        "description": "Description of the code issue",
        "minLength": 1
      },
      "suggestion": {
        "type": "string",
        "description": "Specific suggestion to fix the issue",
        "minLength": 1
      }
    },
    "additionalProperties": false
  },
  "minItems": 0
}

const extended_schema = {
  "type": "array",
  "items": {
    "type": "object",
    "required": [
      "severity",
      "file",
      "issue",
      "suggestion"
    ],
    "properties": {
      "severity": {
        "type": "string",
        "enum": ["high", "medium", "low"]
      },
      "file": {
        "type": "string",
        "description": "Filename where the issue was found"
      },
      "issue": {
        "type": "string",
        "description": "Description of the code issue",
        "minLength": 1
      },
      "suggestion": {
        "type": "string",
        "description": "Specific suggestion to fix the issue",
        "minLength": 1
      },
      "line": {
        "type": "integer",
        "minimum": 1,
        "description": "Optional line number where issue occurs"
      },
      "rule_id": {
        "type": "string",
        "description": "Optional unique identifier for the rule violated"
      },
      "category": {
        "type": "string",
        "enum": ["security", "performance", "readability", "maintainability", "best-practice", "bug-risk"]
      }
    },
    "additionalProperties": false
  },
  "minItems": 0
}

export async function validateSchema(data) {
  const ajv = new Ajv();
  
  console.log("Attempting validation with extended schema...");
  const validExtended = ajv.validate(extended_schema, data);
  
  if (validExtended) {
    console.log("Validated with extended schema");
    return { 
      valid: true, 
      schemaType: 'extended',
      data: data 
    };
  }
  
  console.log("Extended schema failed, trying minimal schema...");
  
  const ajvMinimal = new Ajv();
  const validMinimal = ajvMinimal.validate(mini_schema, data);
  
  if (validMinimal) {
    console.log("Validated with minimal schema");
    return { 
      valid: true, 
      schemaType: 'minimal',
      data: data 
    };
  }
  
  console.log("Both schemas failed");
  return { 
    valid: false, 
    errors: {
      extended: ajv.errors,
      minimal: ajvMinimal.errors
    }
  };
}
