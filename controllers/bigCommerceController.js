const axios = require('axios');

module.exports = {
	//
	// READ
	//
	// Find BC Customers by Email
	getCustomerByEmail: async (req, res, next) => {
		console.log("Hitting bigCommerceController.getCustomerByEmail...");
		console.log("Req.query: ", req.query);
		if (req.query.email && req.query.email !== '') {
			console.log("Has email");
			try {
				const bulkUrl = encodeURI('https://api.bigcommerce.com/stores/' + process.env.BULK_STORE_HASH + '/v3/customers?email:in=' + req.query.email);
				const lbnUrl = encodeURI('https://api.bigcommerce.com/stores/' + process.env.LBN_STORE_HASH + '/v3/customers?email:in=' + req.query.email);

				const bulkResponse = await axios.get(bulkUrl, {
					headers: {
						'accept': 'application/json',
						'content-type': 'application/json',
						'x-auth-client': process.env.BULK_X_CLIENT,
						'x-auth-token': process.env.BULK_X_TOKEN						
					}
				});
				const lbnResponse = await axios.get(lbnUrl, {
					headers: {
						'accept': 'application/json',
						'content-type': 'application/json',
						'x-auth-client': process.env.LBN_X_CLIENT,
						'x-auth-token': process.env.LBN_X_TOKEN						
					}
				});

				const responseCollection = await Promise.allSettled([bulkResponse, lbnResponse])
					.then((values) => {
						const results = values.map(v => {
							const pointer = v.value.request.path.split('/')[2];
							// const pointer = v.value.request.path;
							console.log('Pointer: ', pointer);
							// console.log("v: ", v);
							let data = {};
							if (v.status === 'fulfilled') {
								if (v.value.data.data.length > 0) {
									data = v.value.data.data[0];
									pointer === process.env.BULK_STORE_HASH ? data.source = 'Bulk Apothecary' :
										pointer === process.env.LBN_STORE_HASH ? data.source = 'Lip Balm Now' :
											data.source = '';
								}
								// data = v.value;
								return data;
							}
							return `REJECTED: ${v.reason.message}`;
						});
						return results;
					})
					.catch(errors => {
						console.log(errors);
					})

				console.log(responseCollection);
				res.json(responseCollection);
			} catch (error) {
				console.log(error);
			}

		} else {
			console.log("No email!");
			res.json({"response": "no results returned"});
		}
	}
};