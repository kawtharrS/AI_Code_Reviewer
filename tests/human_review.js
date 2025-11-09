export const BASE_URL = "http://localhost:8080/Assignment2/api/";

export async function getReviews() {
    try {
        console.log("Fetching reviews from:", BASE_URL + "get_human_reviews.php");
        const url = BASE_URL + "get_human_reviews.php";
        const response = await axios.get(url);
        const success = response.data.success; 
        const data = response.data.data;
        
        if (success) {
            console.log("Reviews data received:", data);
            const tableBody = document.getElementById("review-results-body");
            
            if (data && data.length > 0) {
                tableBody.innerHTML = data.map(review => `
                    <tr>
                        <td></td>
                        <td></td>
                        <td>
                            <div>
                                <div">
                                    <span severity-${review.severity || 'medium'}">${review.severity || 'N/A'}</span>
                                    ${review.category ? `<span class="category">${review.category}</span>` : ''}
                                    ${review.rule_id ? `<span class="rule-id">${review.rule_id}</span>` : ''}
                                    ${review.line_number ? `<span class="line-number">Line ${review.line_number}</span>` : ''}
                                </div>
                                <div><strong>Issue:</strong> ${review.issue_title || ''}</div>
                                <div><strong>Suggestion:</strong> ${review.suggestion || ''}</div>
                            </div>
                        </td>
                    </tr>
                `).join('');
            } else {
                tableBody.innerHTML = "<tr><td colspan='3'>No reviews found</td></tr>";
            }
        } else {
            console.error("API error:", response.data.error || "Unknown error");
        }
    } catch (error) {
        console.error("ERROR fetching reviews:", error);
        const tableBody = document.getElementById("review-results-body");
        tableBody.innerHTML = "<tr><td colspan='3'>Error loading reviews</td></tr>";
    }
}

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
            getReviews();
        } else {
            alert("Failed to submit review. Please try again.");
        }
    } catch (error) {
        console.error("Error adding review:", error);
        alert("Failed to add your review. Try again.");
    }
}