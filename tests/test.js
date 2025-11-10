import {addReview } from './human_review.js'; 
import {displayCombinedReviews} from './combined_reviews.js'
import {validateSchema} from './validate_schema.js'

const API_URL = "http://localhost:8080/Assignment2/backend/public/review.php";

let latestAIReview = null;
let filename = "";
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded");
    
    displayCombinedReviews();
    
    const submitReviewBtn = document.getElementById("submit-review");
    submitReviewBtn.addEventListener("click", async function(e) {
        e.preventDefault();

        try {
            await addReview(e, filename);

            if (latestAIReview) {
                await saveAIReviewToDB(e);
            }

            displayCombinedReviews();

            alert("Human and AI reviews saved successfully!");
        } catch (error) {
            console.error("Error saving reviews:", error);
            alert("Failed to save reviews. Try again.");
        }
    });

    
    const submitCodeBtn = document.getElementById("submit-code");
    if (submitCodeBtn) {
        submitCodeBtn.addEventListener("click", addResponse);
    }
    document.getElementById("code-input").addEventListener("change", function () {
    const file = this.files[0];
    const fileNameLabel = document.getElementById("file-name");

    if (file) {
        fileNameLabel.textContent = file.name;
    } else {
        fileNameLabel.textContent = "No file selected";
    }
});

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

        const validationResult = await validateSchema(response.data);
        if (!validationResult.valid) {
            console.error("Validation failed for both schemas");
        } else {
            console.log("Validation successful with", validationResult.schemaType, "schema!");
        }
    } catch (error) {
        console.error("Error in getResponse:", error);
    }
}

async function addResponse(x) {
    x.preventDefault();
    clearReviewResults();
    console.log("Submitting code for review...");
    
    try {
        const codeInput = document.getElementById("code-input");
        
        if (!codeInput || !codeInput.files || codeInput.files.length === 0) {
            document.getElementById("ai-review-results").innerHTML = 
                "<p>Please select a file to review.</p>";
            return;
        }
        
        const file = codeInput.files[0];
        
        const fileContent = await readFileAsText(file);
        
        if (!fileContent) {
            document.getElementById("ai-review-results").innerHTML = 
                "<p>Unable to read file content.</p>";
            return;
        }
        
        document.getElementById("ai-review-results").innerHTML = 
            "<p>Analyzing code...</p>";
        
        const response = await axios.post(API_URL, 
            { 
                code: fileContent,
                file: file.name,
                language: getLanguageFromFilename(file.name)
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Review response:", response.data);

        if (!response.data || typeof response.data !== 'object') {
            throw new Error("Invalid response format from server");
        }

        let reviewData = null;
        if (response.data.review && Array.isArray(response.data.review)) {
            reviewData = response.data.review;
        } else if (response.data.data && Array.isArray(response.data.data)) {
            reviewData = response.data.data;
        } else if (Array.isArray(response.data)) {
            reviewData = response.data;
        } else if (response.data.data && response.data.data.review && Array.isArray(response.data.data.review)) {
            reviewData = response.data.data.review;
        }

        if (!Array.isArray(reviewData)) {
            console.error('Unexpected response structure, full response:', response.data);
            throw new Error("Unexpected response structure");
        }

        console.log("Review data:", reviewData);
        
        const validationResult = await validateSchema(reviewData);
        
        if (!validationResult.valid) {
            alert("Error: Invalid response format from server. The response doesn't match any expected schema.");
            console.error("Validation errors:", validationResult.errors);
            document.getElementById("ai-review-results").innerHTML = 
                "<p>Failed to analyze code. Please try again.</p>";
            return;
        }
        
        if (reviewData && reviewData.length > 0) {
            latestAIReview = reviewData[0];
            filename = reviewData[0].file;
            console.log("Stored filename:", filename);
        }
        
        displayReviewResults(reviewData);

    } catch(error) {
        console.error("Error in addResponse:", error);
        document.getElementById("ai-review-results").innerHTML = 
            `<p>Error: ${error.message}</p>`;
    }
}

function readFileAsText(file) {
    // a promise is special object that represents a value that will be available i the future
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

function getLanguageFromFilename(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'cs': 'csharp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'swift': 'swift',
        'kt': 'kotlin'
    };
    return langMap[ext] || 'unknown';
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
            ${review.category ? `<h3><strong>Category:</strong> ${review.category}</h3>` : ''}                
            ${review.line ? `<h3><strong>Line:</strong> ${review.line}</h3>` : ''}
        </div>
        

    `;
    const container = document.getElementById("ai-review-results"); 
    container.innerHTML = html;
}

async function saveAIReviewToDB(e) {
    e.preventDefault();
    
    try {
        const BASE_URL = "http://localhost:8080/Assignment2/api/";
        const url = BASE_URL + "add_ai_review.php";
        
        const reviewToSave = latestAIReview;
        
        const response = await axios.post(url, {
            filename: filename,
            severity: reviewToSave.severity,
            issue_title: reviewToSave.issue,
            suggestion: reviewToSave.suggestion,
            rule_id: reviewToSave.rule_id || '',
            category: reviewToSave.category || '',
            line_number: reviewToSave.line || ''
        });
        
        console.log("Save AI review response:", response.data);
        
        if (response.data.success) {
            displayCombinedReviews(); 
        } else {
            alert("Failed to save AI review: " + (response.data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Error saving AI review:", error);
        alert("Failed to save AI review. Try again.");
    }
}