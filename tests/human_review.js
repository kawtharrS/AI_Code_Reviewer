export const BASE_URL = "http://localhost:8080/Assignment2/api/";

export async function addReview(x) {
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
            suggestion: suggestion, 
            rule_id: rule, 
            category: category, 
            line_number: line
        });
        
        console.log("Add review response:", response.data);
        
        if (response.data.success) {
            alert("Your Review is Submitted Successfully!");
            document.getElementById("severity-input").value = "";
            document.getElementById("issue-input").value = "";
            document.getElementById("suggestion-input").value = "";
            document.getElementById("rule-input").value = "";
            document.getElementById("category-input").value = "";
            document.getElementById("line-input").value = "";
        } else {
            alert("Failed to submit review. Please try again.");
        }
    } catch (error) {
        console.error("Error adding review:", error);
        alert("Failed to add your review. Try again.");
    }
}