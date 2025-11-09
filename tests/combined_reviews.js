export async function displayCombinedReviews() {
    try {
        const [humanResponse, aiResponse] = await Promise.all([
            axios.get("http://localhost:8080/Assignment2/api/get_human_reviews.php"),
            axios.get("http://localhost:8080/Assignment2/api/get_ai_reviews.php")
        ]);

        const humanData = humanResponse.data.data;
        const aiData = aiResponse.data.data;
        
        const tableBody = document.getElementById("review-results-body");

        tableBody.innerHTML = '';

        const human = humanData[i];
        const ai = aiData[i];
            
        tableBody.innerHTML += `
            <tr>
                <td>${i + 1}</td>
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
    } catch (error) {
        console.error("Error loading combined reviews:", error);
    }
}