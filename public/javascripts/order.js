$( document ).ready(function() {

    console.log( "ready!" );
    // Focus hack https://stackoverflow.com/questions/24209588/how-to-move-focus-on-next-field-when-enter-is-pressed
	// register jQuery extension
	jQuery.extend(jQuery.expr[':'], {
    	focusable: function (el, index, selector) {
        	return $(el).is('a, button, :input, [tabindex]');
    	}
	});
	
	$(document).on('keypress', 'input,select', function (e) {
    	if (e.which == 13) {
        	e.preventDefault();
        	// Get all focusable elements on the page
        	var $canfocus = $(':focusable');
        	var index = $canfocus.index(this) + 1;
        	if (index >= $canfocus.length) index = 0;
        	$canfocus.eq(index).focus();
    	}
	});

    // Autocomplete function
    $("#search-customers").autocomplete({
    	source: function(req, res) {
			let currentValue = $("form .customer-lookup").val();
    		$.ajax({
    			dataType: "json",
    			type: "get",
    			url: "/api/customer/q/" + currentValue,
    			success: function(data) {
    				res($.map(data, function(item) {
    					return {
    						label: item.label,
    						value: item.value,
    						id: item.id,
    						in_house: item.in_house
    					};
    				}))
    				res(data);
    			}
    		})
    	},
    	select: function (event, ui) {
    		event.preventDefault();
    		console.log(ui.item);
    		$("#search-customers").val(ui.item.label);
    		$("#customer-id").val(ui.item.id);
    		$(".order-details").show();
    		$("#orderNumber-1").focus();
    		// $(".continue").prop("disabled", false);
    	},
    	focus: function(event, ui) {
    		event.preventDefault();
    		$(this).val(ui.item.label);
    		$("#customer-id").val(ui.item.id);
    		$("#exists-in_house").val(ui.item.in_house);    			
    	},
    	minLength: 3,
    	scroll: true
    	// appendTo: "#search-customers" 
    }).data( "ui-autocomplete" )._renderItem = function(ul, item) {
		var $div = $("<div></div>").text(item.label);
		highlightText(this.term, $div);
		return $("<li></li>").append($div).appendTo(ul);
    };
    // For highlighting autocomplete results
	function highlightText(text, $node) {
		var searchText = $.trim(text).toLowerCase(), currentNode = $node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
		while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
			newTextNode = currentNode.splitText(matchIndex);
			currentNode = newTextNode.splitText(searchText.length);
			newSpanNode = document.createElement("span");
			newSpanNode.className = "highlight";
			currentNode.parentNode.insertBefore(newSpanNode, currentNode);
			newSpanNode.appendChild(newTextNode);
		}
	}
	// Form logic
	$("input[type='radio'").click(function() {
		if ($(this).attr('id') === "customerRadio2") {
			$("#search-customers, #customer-id").val("");
			$(".new-customer").show();
			$(".order-details").hide();
			$("#search-customers").prop("disabled", true);
			console.log("Target hit");
		} else if ($(this).attr('id') === "customerRadio1") {
			$(".new-customer").hide();
			$("#search-customers").prop("disabled", false);
			console.log("Target hit");
		};
	});

	$("#customerLastName, #customerFirstName").on("focusout", function() {
		if ($("#customerFirstName").val().length > 0 && $("#customerLastName").val().length > 0) {
			console.log("Enable continue...");
			$(".continue").prop("disabled", false);
		} else {
			$(".continue").prop("disabled", true);			
		};
	});

	$(".continue").on("click", function() {
		$(".order-details").show();
		$(".continue").hide();
	});

	// Handle additional order logic
	let orderIterator = 1;
	$(".add-orders").on("click", function(e) {
		e.preventDefault();
		console.log("e", e);
		console.log(orderIterator);
		if (orderIterator < 9) {
			orderIterator++;
			$("#create-orders").append(orderTemplate(orderIterator));			
		} else {
			alert("Enough with the clicking already...");
		}
	});

	// Submit Logic
	$("#submit-orders").on("click", function(e) {
		e.preventDefault();
		let formData = $("#create-orders").serialize();
		console.log("formData: ", formData);
		let obj = formParse(formData);
		console.log("How many of dem?", obj.count);
		handleSubmit(obj);
	});

	function formParse(data) {
		// First break up the string into an array
		let inputArr = data.split("&");
		console.log(inputArr);
		// Let's Objectify this data
		let inputObj = {
			customer: {},
			data: []
		};
		let count = 0;
		inputArr.map(el => {
			let value;
			let focus = el.split("=");
			focus[1].length > 0 ? value = decodeURIComponent(focus[1]):
				value = '';
			let key = decodeURIComponent(focus[0]);
			if (value !== '') {
				// check our obj count
				let num = key.charAt(key.length - 1);
				if (Number(num) > Number(count)) {
					count = Number(num);
					let newObj = {}
					inputObj.data.push(newObj);
				};
				if (isNaN(Number(num))) {
					inputObj.customer[key] = value;					
				} else {
					inputObj.data[num-1][key.substring(0,key.length - 2)] = value;
				};
			};
		});
		console.log("Obj: ", inputObj);
		inputObj.count = count;
		return inputObj;
	}

	function dataPrep(obj, customerId) {
		let jobs = [];
		let customer;
		// look through form data and provide input where it is missing
		obj.data.forEach(entry => {

			let jobObj = {
				order_number: '',
				_customerId: customerId,
				upc: '',
				po: '',
				qty: null,
				dimensions: {
					dim1: '',
					dim2: ''
				},
				priority: false,
				artwork: '',
				laminate: '',
				notes: ''
			};
			customer = customerId;
			for (let [key, value] of Object.entries(entry)) {
				if (key === 'orderNumber') {
					jobObj.order_number = value;
				} else if (key === 'dim1') {
					jobObj.dimensions.dim1 = value;
				} else if (key === 'dim2') {
					jobObj.dimensions.dim2 = value;
				} else {
					jobObj[key] = value;
				};
			};
			jobs.push(jobObj);
		});
		return { 
			jobs: jobs,
			customer: customer
		};
	};

	// Final checks and form submit
	function handleSubmit(formObj) {
		// Check for data
		console.log("formObj.customer.customerRadio", formObj.customer.customerRadio);
		let transformed = dataPrep(formObj, formObj.customer.customerId);
		let details = transformed.details;
		let jobs = transformed.jobs;
		// Check for new or existing customer to handle those cases
		switch (formObj.customer.customerRadio) {
			// Handle Existing customers
			case "0":
				console.log('formObj.customer["exists-in_house"]', formObj.customer["exists-in_house"]);
				//  Checking if existing customer is In-House
				switch (formObj.customer["exists-in_house"]) {
					case "false":
						// Check for order number
						let numberCheck = true;
						formObj.data.forEach(order => {
							console.log("order ", order.orderNumber);
							if (order.orderNumber === undefined) {
								numberCheck = false;
								alert("girl, who you playing with?  gimme dat order number!");
								return;
							}
						});
						// Continue if order number exists
						if (numberCheck) {
							let transformed = dataPrep(formObj, formObj.customer.customerId);
							// let details = transformed.details;
							let jobs = transformed.jobs;
							console.log("DEBUG: ",transformed);
							// call.postDetails(details)
							// .then(res => {
							// 	console.log("Posted Details: ", res);
							// 	if (res.ops) {
							// 		for (let i = 0; i < res.ops.length; i++) {
							// 			jobs[i].details = res.ops[i]._id;
							// 		};									
							// 	} else {
							// 		jobs[0].details = res[0]._id;
							// 	};
							// 	return jobs;
							// }).then(call.postJobs(jobs))
							call.postJobs(jobs)
							.then(res => {
								console.log("This route is working, but ugly");
								console.log("can we see here? ", res);
							}).catch(err => {
								console.log(err);
							});
						} else {
							// Handle error, return form validation response, honestly probably uneccessary, but come back to it.
						};
						break;
					case "true":
						break;
					case undefined:
						// Handle error conditions
						break;
					default:
						break; 
				}
				// if (formObj["orderNumber-1"] !== "") {
				// 	// continue with submit

				// }
				console.log("Friggin woo");
				break;
			case "1":
				// New Customer, build it out
				let customer = formObj.customer;
				let customerObj = {
					company: customer.company ? customer.company: '',
					contact_first: customer.firstName ? customer.firstName: '',
					contact_last: customer.lastName ? customer.lastName: '',
					email: customer.email ? customer.email: '',
					phone: customer.phone ? customer.phone: '',
					in_house: customer.inHouse ? customer.inHouse: false
				};
				console.log("Frig you ", customerObj);
				call.postCustomer(customerObj)
				.then(res => {
					// prep shit and move on!!!!!!!!!!!!!

				});

				break;
			default:
				break;
		}
	}


    let orderTemplate = function(orderTracker) {
    	let html = "" +
            '<div class="order-details" style="display: block;">' +
                '<div class="form-row">' +
                    '<div class="col-md-12">' +
                        '<span class="muted">Order Information (' + orderTracker + ')</span>' +
                        '<hr />' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-group col-md-3">' +
                        '<label for="orderNumber-' + orderTracker + '">Order #</label>' +
                        '<input type="text" name="orderNumber-' + orderTracker + '" class="form-control" id="orderNumber-' + orderTracker + '" placeholder="#100000000">' +
                    '</div>' +
                    '<div class="form-group col-md-3">' +
                        '<label for="upc-' + orderTracker + '">UPC</label>' +
                        '<input type="text" name="upc-' + orderTracker + '" class="form-control" id="upc-' + orderTracker + '" placeholder="111111111111">' +
                    '</div>' +
                    '<div class="form-group col-md-3">' +
                        '<label for="po-' + orderTracker + '">PO #</label>' +
                        '<input type="text" name="po-' + orderTracker + '" class="form-control" id="po-' + orderTracker + '" placeholder="12345">' +
                    '</div>' +
                    '<div class="form-group col-md-1">' +
                        '<label for="qty-' + orderTracker + '">Quantity</label>' +
                        '<input type="text" name="qty-' + orderTracker + '" class="form-control" id="qty-' + orderTracker + '" placeholder="100">' +
                    '</div>' +
                    '<div class="form-group col-md-2">' +
                        '<label for="priority-' + orderTracker + '">Priority</label>' +
                        '<select class="form-control" name="priority-' + orderTracker + '" id="priority-' + orderTracker + '">' +
                            '<option>Normal</option>' +
                            '<option>Rush</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-group col-md-6">' +
                        '<label for="artwork-' + orderTracker + '">Artwork</label>' +
                        '<input type="text" name="artwork-' + orderTracker + '" class="form-control" id="artwork-' + orderTracker + '">' +
                    '</div>' +
                    '<div class="form-group col-md-2">' +
                        '<label for="height-' + orderTracker + '">Height</label>' +
                        '<input type="text" name="dim1-' + orderTracker + '" class="form-control" id="height-' + orderTracker + '" placeholder="1.15">' +
                    '</div>' +
                    '<div class="form-group col-md-2">' +
                        '<label for="width-' + orderTracker + '">Width</label>' +
                        '<input type="text" name="dim2-' + orderTracker + '" class="form-control" id="width-' + orderTracker + '" placeholder="5.25">' +
                    '</div>' +
                    '<div class="form-group col-md-2">' +
                        '<label for="laminate-' + orderTracker + '">Laminate</label>' +
                        '<select class="form-control" name="laminate-' + orderTracker + '" id="laminate-' + orderTracker + '">' +
                            '<option>Matte</option>' +
                            '<option>High Gloss</option>' +
                        '</select>' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-group col-md-12">' +
                        '<label for="notes-' + orderTracker + '">Notes</label>' +
                        '<textarea class="form-control" name="notes-' + orderTracker + '" id="notes-' + orderTracker + '" rows="2"></textarea> ' +
                    '</div>' +
                '</div>' +
            '</div>';
        return html;
    };

});