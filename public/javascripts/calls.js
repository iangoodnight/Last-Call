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
			let filteredResponse = response.filter(obj => Object.keys(obj).length !== 0);
			return filteredResponse;			
		} catch (error) {
			console.log('We knocked, but BigC ain\'t answering...\n', error.message);
		}

	},
	// Statuses
	getStatuses: async () => {
		console.log('Fetching active statuses...');
		let url = '/api/status';
		try {
			let response = await $.ajax({
				method: 'GET',
				url: url
			});

		return response;
		} catch (error) {
			console.log(error);
		}
	},
	//
	// UPDATE
	//
	updateCustomer: async (data, id) => {
		console.log("Updating customer...");
		console.log(window.location.origin);
		// let url = window.location.origin + '/api/customer/' + id;
		let url = '/api/customer/' + id;

		try {
			// console.log("Inside URL: ", url);
			let response = await $.ajax({
				method: 'PUT',
				url: url,
				data: data
			});

			return response;
		} catch (error) {
			console.log(error);
		}
		// console.log("URL: ", url);
	}
};