const call = {
	postJobs: function (data) {
		let url;
		let jobsObj = JSON.stringify({ jobs: data });
		// Distingush between our two endpoints
		if (data.length > 1) {
			url = '/api/job/m';
		} else {
			url = 'api/job';
		};	
		return $.ajax({
			method: 'POST',
			url: url,
			data: jobsObj,
			dataType: "json",
			contentType: "application/json"
		});
	},
	postDetails: function (data) {
		let url;
		let detailsObj = JSON.stringify({ details: data });
		// Distingush between our two endpoints
		if (data.length > 1) {
			url = '/api/detail/m';
		} else {
			url = 'api/detail';
		};	
		return $.ajax({
			method: 'POST',
			url: url,
			data: detailsObj,
			dataType: "json",
			contentType: "application/json"
		});
	},
	postCustomer: function (data) {
		let customerObj = JSON.stringify({ customer: data });
		return $.ajax({
			method: 'POST',
			url: 'api/customer',
			data: customerObj,
			dataType: "json",
			contentType: "application/json"
		});
	}
};