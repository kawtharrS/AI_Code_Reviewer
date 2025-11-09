import Ajv from 'https://esm.sh/ajv';
import { getReviews, addReview } from './human_review.js'; 

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

const API_URL = "http://localhost:8080/Assignment2/api/review.php";

async function getResponse() {
    try {
        console.log("Fetching the response from:", API_URL);
        const response = await axios.get(API_URL);
        console.log(response);

        const contType = response.headers['content-type'];
        if (contType && contType.includes('application/json'))
            console.log("is JSON");
        else 
            console.log("NOT a JSON");

        if (Array.isArray(response.data)) {
            console.log("is array");
            console.log(response.data);
        } else {
            console.log("is not an array");
        }

        const ajv = new Ajv();
        const data = response.data;
        const valid = ajv.validate(schema, data);
        if (!valid) console.error(ajv.errors);
        else console.log("Validation successful!");
    } catch (error) {
        console.error(error);
    }
}

async function addResponse(x) {
    x.preventDefault();
    clearReviewResults();
    console.log("hi");
    try {
        const code = document.getElementById("code-input").value.trim(); 
        const response = await axios.post(API_URL, { code } );
        console.log(response.data);
        displayReviewResults(response.data);
    } catch(error) {
        console.error("Error");
        const aiRev = document.getElementById("ai-review-results"); 
        aiRev.innerHTML = "<p>Error getting review results. Please try again.</p>";
    }
}

function clearReviewResults() {
    const aiRev = document.getElementById("ai-review-results"); 
    aiRev.innerHTML = ""; 
}

function displayReviewResults(reviews) {
    const aiRev = document.getElementById("ai-review-results"); 
        
    if (!reviews || reviews.length === 0) {
        aiRev.innerHTML = "<p>No code review issues found.</p>";
        return;
    }

    const html = reviews.map(review => `
        <div>
            <h3><strong>File: </strong>${review.file}</h3>
            <p><strong>Severity:</strong> <span>${review.severity}</span></p>
            <p><strong>Issue:</strong> ${review.issue}</p>
            <p><strong>Suggestion:</strong> ${review.suggestion}</p>
            ${review.line ? `<p><strong>Line:</strong> ${review.line}</p>` : ''}
            ${review.rule_id ? `<p><strong>Rule ID:</strong> ${review.rule_id}</p>` : ''}
            ${review.category ? `<p><strong>Category:</strong> ${review.category}</p>` : ''}
        </div>
        <hr>
    `).join('');

    aiRev.innerHTML = html;
}

// SINGLE DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded");
    
    // Human review functionality
    getReviews();
    const submitReviewBtn = document.getElementById("submit-review");
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener("click", addReview);
    }
    
    // Code review functionality
    const submitCodeBtn = document.getElementById("submit-code");
    if (submitCodeBtn) {
        submitCodeBtn.addEventListener("click", addResponse);
    }
});