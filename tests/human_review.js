const BASE_URL = "http://localhost:8080/Assignment2/api/";

document.addEventListener("DOMContentLoaded", function(){
    console.log("DOM loaded");
    getReviews();
    document.getElementById("submit-review").addEventListener("click", addReview);
})

async function getReview()
{
    try {
        console.log("Fetching reviews from:", BASE_URL + "get_human_reviews.php");
        const url = BASE_URL + "get_human_reviews.php";
        const response = await axios.get(url);
        const success = response.data.success; 
        const data = response.data.data;
        
        if (success) {
            console.log("Reviews data received:", data);
            const tableBody = document.getElementById("review-results-body");
            
            tableBody.innerHTML = "hi";
            
            
        } else {
            console.error("API error:", response.data.error);
        }
    } catch (error) {
        console.error("ERROR fetching reviews:", error);

    }
}
async function addReview()
{
    x.preventDefault();
    
    try {
        const severity = document.getElementById("severity-input").value.trim();
        const issue = document.getELementById("issue-input").value.trim();
        const suggestion = document.getElementById("suggestion-input").value.trim();
        const rule = document.getELementById("rule-input").value.trim();
        const category = document.getElementById("category-input").value.trim();
        const line = document.getELementById("line-input").value.trim();

        
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
            document.getELementById("issue-input").value="";
            document.getElementById("suggestion-input").value="";
            document.getELementById("rule-input").value="";
            document.getElementById("category-input").value="";
            document.getELementById("line-input").value="";
            getScores();
        } else {
            alert("Failed to submit review. Please try again.");
        }
        
    } catch (error) {
        console.error("Error adding review:", error);
        alert("Failed to add your review. Try again.");
    }
}
