const API_URL= "http://localhost:8080/Assignment2/api/review.php";
getResponse()
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
    }
    catch (error){
        console.error(error);
    }
}