module.exports = getDate;

function getDate() {
	var today = new Date();
	const options = {
	    weekday: "long",
	    day: "numeric",
	    month: "long"
	}
	var day = today.toLocaleDateString("en-US",options);
    return day;
}