import Ajv from 'https://esm.sh/ajv';
import {addReview } from './human_review.js'; 
import {displayCombinedReviews} from './combined_reviews.js'


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

let latestAIReview = null;

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded");
    
    displayCombinedReviews();
    
    const submitReviewBtn = document.getElementById("submit-review");
    submitReviewBtn.addEventListener("click", function(e) {
        addReview(e).then(() => {
            displayCombinedReviews(); 
        });
    });
    
    const submitCodeBtn = document.getElementById("submit-code");
    if (submitCodeBtn) {
        submitCodeBtn.addEventListener("click", addResponse);
    }
});

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
        console.error("Error in getResponse:", error);
    }
}

async function addResponse(x) {
    x.preventDefault();
    clearReviewResults();
    console.log("Submitting code for review...");
    
    try {
        const code = document.getElementById("code-input").value.trim();
        
        if (!code) {
            document.getElementById("ai-review-results").innerHTML = 
                "<p>Please enter some code to review.</p>";
            return;
        }
        
        document.getElementById("ai-review-results").innerHTML = 
            "<p>Analyzing code...</p>";
        
        const response = await axios.post(API_URL, 
            { code },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Review response:", response.data);
        
        if (response.data && response.data.length > 0) {
            latestAIReview = response.data[0]; 
        }
        
        displayReviewResults(response.data);

    } catch(error) {
        console.error("Error in addResponse:", error);
        console.error("Error details:", error.response?.data || error.message);
    }
}

function clearReviewResults() {
    const aiRev = document.getElementById("ai-review-results"); 
    aiRev.innerHTML = "";
    latestAIReview = null; 
}

function displayReviewResults(reviews) {
    const review = reviews[0];
    const html = `
        <div class="review-item">
            <h3><strong>File:</strong> ${review.file}</h3>
            <h3><strong>Severity:</strong> <span class="severity-${review.severity}">${review.severity}</span></h3>
            <h3><strong>Issue:</strong> ${review.issue}</h3>
            <h3><strong>Suggestion:</strong> ${review.suggestion}</h3>
            ${review.rule_id ? `<h3><strong>Rule Id:</strong> ${review.rule_id}</h3>` : ''}
            ${review.category ? `<h3><strong>Category:</strong> ${review.category}</h3>` : ''}                ${review.line ? `<h3><strong>Line:</strong> ${review.line}</h3>` : ''}
        </div>
        <div style="margin-top: 20px;">
            <button id="save-ai-review-btn" class="btn btn-primary">Save AI Review to Database</button>            </div>
        `;
        document.getElementById("ai-review-results").innerHTML = html;
        
        const saveBtn = document.getElementById("save-ai-review-btn");
        if (saveBtn) {
            saveBtn.addEventListener("click", saveAIReviewToDB);
        }
}

async function saveAIReviewToDB(e) {
    e.preventDefault();
    
    try {
        const BASE_URL = "http://localhost:8080/Assignment2/api/";
        const url = BASE_URL + "add_ai_review.php";
        
        const reviewToSave = latestAIReview;
        
        const response = await axios.post(url, {
            severity: reviewToSave.severity,
            issue_title: reviewToSave.issue,
            suggestion: reviewToSave.suggestion,
            rule_id: reviewToSave.rule_id || '',
            category: reviewToSave.category || '',
            line_number: reviewToSave.line || ''
        });
        
        console.log("Save AI review response:", response.data);
        
        if (response.data.success) {
            alert("AI Review saved to database successfully!");
            displayCombinedReviews(); 
        } else {
            alert("Failed to save AI review: " + (response.data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error saving AI review:", error);
        alert("Failed to save AI review. Try again.");
    }
}

