export async function displayCombinedReviews() {
    try {
        const [humanResponse, aiResponse] = await Promise.all([
            axios.get("http://localhost:8080/Assignment2/api/get_human_reviews.php"),
            axios.get("http://localhost:8080/Assignment2/api/get_ai_reviews.php")
        ]);

        const humanData = humanResponse.data.data;
        const aiData = aiResponse.data.data;
        const maxLength = Math.max(humanData.length, aiData.length);
        
        const tableBody = document.getElementById("review-results-body");
        
        if (maxLength === 0) {
            tableBody.innerHTML = "<tr><td colspan='3'>No reviews found</td></tr>";
            return;
        }

        tableBody.innerHTML = '';
        for (let i = 0; i < maxLength; i++) {
            const human = humanData[i];
            const ai = aiData[i];
            
            tableBody.innerHTML += `
                <tr>
                    <td>${ai.filename}</td>
                    <td>${ai ? `
                        <div>
                            <span class="severity-${ai.severity}"><strong>${ai.severity}</strong></span>
                            <div><strong>Issue:</strong> ${ai.issue_title}</div>
                            <div><strong>Suggestion:</strong> ${ai.suggestion}</div>
                        </div>
                    ` : 'No review'}</td>
                    <td>${human ? `
                        <div>
                            <span class="severity-${human.severity}"><strong>${human.severity}</strong></span>
                            <div><strong>Issue:</strong> ${human.issue_title}</div>
                            <div><strong>Suggestion:</strong> ${human.suggestion}</div>
                        </div>
                    ` : 'No review'}</td>
                </tr>
            `;
        }
    } catch (error) {
        console.error("Error loading combined reviews:", error);
    }
}