export async function displayCombinedReviews() {
  try {
    const humanRes = await axios.get("http://localhost:8080/Assignment2/api/get_human_reviews.php");
    const aiRes = await axios.get("http://localhost:8080/Assignment2/api/get_ai_reviews.php");  

    const humanReviews = humanRes.data.data;
    const aiReviews = aiRes.data.data;

    const tableBody = document.getElementById("review-results-body");
    tableBody.innerHTML = "";

    const combinedReviews = [];

    aiReviews.forEach(ai => {
      combinedReviews.push({ filename: ai.filename, ai, human: null });
    });

    humanReviews.forEach(human => {
      const match = combinedReviews.find(r => r.filename === human.filename && r.human === null);
      if (match) {
        match.human = human;
      } else {
        combinedReviews.push({ filename: human.filename, ai: null, human });
      }
    });

    if (combinedReviews.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="3">No reviews found</td></tr>`;
      return;
    }

    combinedReviews.forEach(row => {
      tableBody.innerHTML += `
        <tr>
          <td>${row.filename}</td>
          <td>${row.ai ? `
            <div class="review-card">
              <span class="severity-badge ${row.ai.severity}">${row.ai.severity}</span>
              <p><strong>Issue:</strong> ${row.ai.issue_title}</p>
              <p><strong>Suggestion:</strong> ${row.ai.suggestion}</p>
            </div>` : "No review"}
          </td>
          <td>${row.human ? `
            <div class="review-card">
              <span class="severity-badge ${row.human.severity}">${row.human.severity}</span>
              <p><strong>Issue:</strong> ${row.human.issue_title}</p>
              <p><strong>Suggestion:</strong> ${row.human.suggestion}</p>
            </div>` : "No review"}
          </td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Failed to load reviews:", err);
  }
}
