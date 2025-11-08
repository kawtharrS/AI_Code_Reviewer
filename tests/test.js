import Ajv from 'https://esm.sh/ajv';
const schema = {
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
const API_URL= "http://localhost:8080/Assignment2/api/review.php";
async function getResponse(){
    try{
        console.log("Fetching the response from:", API_URL);
        const response = await axios.get(API_URL);
        console.log(response);

        const contType = response.headers['content-type'];
        if(contType  && contType.includes('application/json'))
            console.log("is JSON");
        else 
            console.log("NOT a JSON")

        if(Array.isArray(response.data))
        {
            console.log("is array");
            console.log(response.data)
        }
        else{
            console.log("is not an array")
        }

        const ajv = new Ajv();
        const data= response.data;
        const valid = ajv.validate(schema, data);
        if (!valid) console.error(ajv.errors);
        else console.log("Validation successful!");

    }
    catch (error){
        console.error(error);
    }
}
document.addEventListener("DOMContentLoaded", function(){
    getResponse();
    document.getElementById("score-id").addEventListener("click", addResponse);
});

async function addResponse(x)
{
    x.preventDefault();
    console.log("hi")
    try{
        const code = document.getElementById("player-name").value.trim();
        const response = await axios.post(API_URL,{code} );
        console.log(response.data);
        }
    catch(error){
        console.error("Error")
    }
}