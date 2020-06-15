$( document ).ready(function() {

    console.log( "ready!" );
    // initPage();

    $("form").on("submit", function(e) {
    	handleCustomerPost();
    });

    // $(".table").delegate("tr", "click", function() {
    // 	alert("click");
    // })

    // function initPage() {
    // 	$("#customer-list").empty();
    // 	$.get("/api/customer").then(data => {
    // 		if (data && data.length) {
    // 			console.log("GET response: ", data);
    // 			displayCustomers(data);
    // 		}
    // 	})
    // }

    function addJobListener() {
    	$(".add-job").on("click", function() {
    		var id = $(this).data('id');
    		console.log("Inside the button: ", $(this).data('id'));
    		$.ajax({
    			method: "POST",
    			url: "/api/job",
    			data: {
    				order_number: Math.floor(Math.random()*100),
    				_customerId: id
    			}
    		})
    	})
    }

    // function displayCustomers(customers) {
    // 	var resultsTable = ["<table class='table'>",
    // 						"<thead>",
    // 							"<tr>",
    // 								"<th scope='col'>#</th>",
    // 								"<th scope='col'>Company</th>",
    // 								"<th scope='col'>Contact</th>",
    // 								"<th scope='col'>Phone</th>",
    // 								"<th scope='col'>Email</th>",
    // 							"</tr>",
    // 						"</thead>",
    // 						"<tbody>"]
    // 	customers.map((customer, i) => {
    // 		var number = i + 1;
    // 		var el = "<tr class='results' data-id=" + customer._id +"><th scope='col'>" +
    // 					number +
    // 					"</th>" +
    // 					"<td contentEditable='true'>" +
    // 					customer.company +
    // 					"</td>" +
    // 					"<td>" +
    // 					customer.contact_first + " " + customer.contact_last +
    // 					"</td>" +
    // 					"<td>" + 
    // 					customer.phone +
    // 					"</td>" +
    // 					"<td>" +
    // 					customer.email +
    // 					"</td>" +
    // 					"</tr>";
    // 		console.log("el ", el);
    // 		resultsTable.push(el);
    // 	});
    // 	resultsTable.push("</tbody></table>");
    // 	console.log(resultsTable);
    // 	$("#customer-list").html(resultsTable.join(""));
    // 	$(".table").delegate("tr", "click", function(e) {
    // 		$('.add-job').remove();
    // 		$(this).append("<button class='add-job btn' data-id='" + $(this).data('id') + "''>Add Job</button>");
    // 		console.log($(this).data('id'));
    // 		addJobListener();
    // 	});
    // }

    function handleCustomerPost() {

    	console.log("Posting customer...");

    	var customerObject = {
    		company: $("#companyName").val(),
    		contact_first: $("#customerFirstName").val(),
    		contact_last: $("#customerLastName").val(),
    		email: $("#customerEmail").val(),
    		phone: $("#customerPhone").val(),
    		in_house: $("#inHouse").val() > 0 ? true: false,
    		author: null
    	};
        // I changed the method slightly, come back and clean this up.
        var newObj = JSON.stringify({ customer: customerObject })

    	console.log("Customer Data: ", customerObject);

    	$.ajax({
    		method: "POST",
    		url: "/api/customer",
    		data: newObj,
            dataType: "json",
            contentType: "application/json"
    	}).then(function(data) {

    		console.log("Posted Data: ", data);

    	})

    }

});