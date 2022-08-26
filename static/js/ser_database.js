// api url
const api_url =
	"https://employeedetails.free.beeceptor.com/my/api/path";

// Defining async function
async function getapi(url) {
	
	// Storing response
	const response = await fetch(url);
	
	// Storing data in form of JSON
	var data = await response.json();
	console.log(data);
	if (response) {
		hideloader();
	}
	show(data);
}
// Calling that async function
getapi(api_url);

// Function to hide the loader
function hideloader() {
	document.getElementById('loading').style.display = 'none';
}
// Function to define innerHTML for HTML table
function show(data) {
	let tab =
		``;
	
	// Loop to access all rows
	for (let r of data.list) {
		tab += `<tr>
	<td>${r.sequence_id} </td>
	<td>${r.ser_result}</td>
	<td>${r.not_prank}</td>
	<td>${r.prank}</td>		
	<td>${r.main_audio}</td>		
</tr>`;
	}
	// Setting innerHTML as tab variable
	document.getElementById("emotiondata").innerHTML = tab;
}
