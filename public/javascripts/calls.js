const call = {
	//
	// CREATE
	//
	postJobs: function (data, customer) {
		let url;
		let jobsObj = JSON.stringify({ jobs: data });
		// Distingush between our two endpoints
		console.log(jobsObj);
		if (data.length > 1) {
			url = '/api/job/m';
		} else {
			url = 'api/job' + customer;
		};	
		return $.ajax({
			method: 'POST',
			url: url,
			data: jobsObj,
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
	},
	//
	// READ
	//
	// BC Data
	getBCCustomer: async data => {
		console.log("Fetching data from BigCommerce...");
		let url = encodeURI('api/bc?email=' + data);
		try {
			let response = await $.ajax({
				method: 'GET',
				url: url
			});
			return response;			
		} catch (error) {
			console.log(error);
		}

	}
};