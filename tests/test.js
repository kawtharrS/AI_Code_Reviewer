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
    document.getElementById("submit-code").addEventListener("click", addResponse);
});

async function addResponse(x)
{
    x.preventDefault();
    clearReviewResults();
    console.log("hi")
    try{
        const code = document.getElementById("code-input").value.trim(); 
        const response = await axios.post(API_URL,{code} );
        console.log(response.data);
        
        displayReviewResults(response.data);
        }
    catch(error){
        console.error("Error")
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


const BASE_URL = "http://localhost:8080/Assignment2/api/";

document.addEventListener("DOMContentLoaded", function(){
    console.log("DOM loaded");
    getReviews();
    document.getElementById("submit-review").addEventListener("click", addReview);
})
async function getReviews() {
    try {
        console.log("Fetching reviews from:", BASE_URL + "get_human_review.php"); // Fixed: added 's'
        const url = BASE_URL + "get_human_review.php"; // Fixed: added 's'
        const response = await axios.get(url);
        const success = response.data.success; 
        const data = response.data.data;
        
        if (success) {
            console.log("Reviews data received:", data);
            const tableBody = document.getElementById("review-results-body");
            
            if (data && data.length > 0) {
                tableBody.innerHTML = data.map(review => `
                    <tr>
                        <td>${review.severity || ''}</td>
                        <td>${review.issue_title || ''}</td>
                        <td>${review.suggestion || ''}</td>
                        <td>${review.rule_id || ''}</td>
                        <td>${review.category || ''}</td>
                        <td>${review.line_number || ''}</td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = "<tr><td colspan='6'>No reviews found</td></tr>";
            }
            
        } else {
            console.error("API error:", response.data.error || "Unknown error");
        }
    } catch (error) {
        console.error("ERROR fetching reviews:", error);
        const tableBody = document.getElementById("review-results-body");
        tableBody.innerHTML = "<tr><td colspan='6'>Error loading reviews</td></tr>";
    }
}
async function addReview(x)
{
    x.preventDefault();
    
    try {
        const severity = document.getElementById("severity-input").value.trim();
        const issue = document.getElementById("issue-input").value.trim();
        const suggestion = document.getElementById("suggestion-input").value.trim();
        const rule = document.getElementById("rule-input").value.trim();
        const category = document.getElementById("category-input").value.trim();
        const line = document.getElementById("line-input").value.trim();

        
        const url = BASE_URL + "add_human_review.php";
        const response = await axios.post(url, {
            severity: severity, 
            issue_title: issue, 
            suggestion:suggestion, 
            rule_id: rule, 
            category: category, 
            line_number: line
        });
        
        console.log("Add review response:", response.data);
        
        
        if (response.data.success) {
            alert("Your Review is Submitted Successfully!");
            document.getElementById("severity-input").value="";
            document.getElementById("issue-input").value="";
            document.getElementById("suggestion-input").value="";
            document.getElementById("rule-input").value="";
            document.getElementById("category-input").value="";
            document.getElementById("line-input").value="";
            getReviews();
        } else {
            alert("Failed to submit review. Please try again.");
        }
        
    } catch (error) {
        console.error("Error adding review:", error);
        alert("Failed to add your review. Try again.");
    }
}
