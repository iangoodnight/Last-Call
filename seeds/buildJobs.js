const axios = require('axios');

const artworkSentences = [
	'Some artwork here',
	'A real artwork string',
	'Art is in the eye',
	'Artful dodger',
	'There has got to be a better way',
	'Databases suck',
	'M R Ducks',
	'M R not Ducks',
	'O S A R',
	'L I B, I S A R Ducks!',
	'One more just to see',
	'Fallback'
];

const statusIds = [
	"5ecec9c1fe9fa1604e607952",
	"5ececa20fe9fa1604e607986",
	"5ececaa2fe9fa1604e6079c1",
	"5ececabffe9fa1604e6079cf",
	"5ececad4fe9fa1604e6079d7",
	"5ececae4fe9fa1604e6079d9",
	"5ececaf9fe9fa1604e6079e7",
	"5ececb24fe9fa1604e6079ff",
	"5ececb71fe9fa1604e607a20",
	"5ececb7ffe9fa1604e607a28",
	"5ececba4fe9fa1604e607a2c",
	"5ececbb4fe9fa1604e607a3a",
	"5ed6a80afe9fa1604e679ee6"
];

const iterations = process.argv[2];

console.log(`Iterations: ${iterations}`);

// const customers = customerController.findAll();
async function main() {
	let ids = await getAllActive();
	let end = iterations || 1;
	try {
		for (let i = 0; i < end; i++) {
			let aJob = await buildJob(ids);
			let id = aJob.customer;
			await postJob(aJob, id);
		};		
	} catch (error) {
		console.log(error.message);
	};
	console.log('Jobs complete');

};

async function getAllActive() {
	let customers = await axios.get('http://127.0.0.1:3001/api/customer');
	let customerIds = [];
	customers.data.forEach(customer => {
		customerIds.push(customer._id);
	});
	return customerIds;
};

function buildJob(ids) {
	let seed = Math.ceil(Math.random() * 10);
	let seed2 = Math.ceil(Math.random() * 2);
	let coinToss = Math.ceil(Math.random() * 2);
	coinToss === 1 ? coinToss = -1*seed2 : coinToss = seed2;
	let random = seed + seed2;
	random < 0 ? random = 0: false;
	let artwork = artworkSentences[random];
	let customer = ids[random + seed2];
	let dimensions = {
		dim1: 1,
		dim2: 1
	};
	let laminate = 'High gloss';
	let notes = 'No notes, please.';
	let open = true;
	let order_number = 1000 + (seed + 1) + (Math.ceil((seed*17)/3)*100 - seed2 + Math.ceil(seed2/seed) * 2 + Math.ceil(Math.PI * seed));
	let priority = true;
	let qty = seed * 100;
	let status = statusIds[seed];
	return new jobs(artwork, customer, dimensions, laminate, notes, open, order_number, priority, qty, status);
};

function checkSeed(times) {
	if (times > 0) {
		while (times > 0) {
			buildJob();
			times--;
		};
	};
};

function jobs(artwork, customer, dimensions, laminate, notes, open, order_number, priority, qty, status) {
	this.artwork = artwork;
	this.customer = customer;
	this.dimensions = dimensions;
	this.laminate = laminate;
	this.notes = notes;
	this.open = open;
	this.order_number = order_number;
	this.priority = priority;
	this.qty = qty;
	this.status = status;
};

// Tomorrow.  Check out job seeding.

async function postJob(jobData, id) {
	let url = `http://127.0.0.1:3001/api/job/${id}`;
	console.log(jobData);
	let data = JSON.parse(JSON.stringify(jobData));
	try {
		await axios({
			headers: {
	  			'Access-Control-Allow-Origin': '*',
	  			'Content-Type': 'application/json',
			},
			method: 'post',
			url: url,
			data: data
		});		
	} catch (error) {
		console.log(error.message );
	};
};

main();
