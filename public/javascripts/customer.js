$( document ).ready(function() {

    console.log( "ready!" );

    $("form").on("submit", function(e) {
        // e.preventDefault();
    	handleCustomerPost();
    });

    // $(".table").delegate("tr", "click", function() {
    // 	alert("click");
    // })
    $('button.search-toggle').on('click', () => {
        $('button.add-toggle').removeClass('active');
        $('button.search-toggle').addClass('active');
        $('#customer-filters').fadeIn(1600);
        $('#add-customer-dialog').fadeOut(1600);
        $('#new-customer').fadeOut(1600);
    });

    $('button.add-toggle').on('click', () => {
        $('button.search-toggle').removeClass('active');
        $('button.add-toggle').addClass('active');
        $('#add-customer-dialog').fadeIn(1600);
        $('#new-customer-dialog').fadeIn(1600);
        $('#customer-filters').fadeOut(1600);
    });

    $('#bc-lookup').on('click', async e => {
        let email = $('#lookup-email').val();
        if (email !== '') {
            let customers = await call.getBCCustomer(email);
            console.log("Customer: ", customers);
            renderBCCustomer(customers);

        };      
    });

    async function renderBCCustomer(customerArr) {
        let results = [];
        customerArr.map(customer => {
            if (!isEmpty(customer)) {
                let customerTemplate =
                    '<div class="card">' +
                        '<div class="card-header">' + 
                            customer.source + 
                            '<button type="button" class="close remove-result float-right" aria-label="Close">' +
                                '<span class="clickable" aria-hidden="true">&times;</span>' +
                            '</button>' +
                        '</div>' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">' + customer.company + '</h5>' +
                            '<p class="card-text"><strong>Name: </strong>' + customer.first_name + ' ' + customer.last_name + '</p>' +
                             '<p class="card-text"><strong>Email: </strong>' + customer.email + '</p>' +  
                             '<p class="card-text"><strong>Phone: </strong>' + customer.phone + '</p>' +
                             '<a href="#" class="btn btn-primary add-customer"' +
                                'data-company="' + customer.company + '"' +
                                'data-contact_first="' + customer.first_name + '"' +
                                'data-contact_last="' + customer.last_name + '"' +
                                'data-email="' + customer.email + '"' +
                                'data-phone="' + customer.phone + '"' +
                                'data-id="' + customer.id + '"' +
                                'data-provider="' + customer.source + '"' +
                                '>Add customer</a>' +                             
                        '</div>' +
                    '</div>';
                results.push(customerTemplate);
            }
        });
        let html = results.join();
        $(html).hide().appendTo('#add-customer-dialog').fadeIn(1600);
        $('button.remove-result').on('click', closeListener);
        $('a.add-customer').on('click', addCustomer);
    };

    function closeListener() {
        $(this).closest('.card').fadeOut(1600);
    };

    function addCustomer() {
        console.log($(this).data());
        let dataObj = $(this).data();
        let customerObj = {
            bc: {}
        };
        for (let key in dataObj) {
            if (key === 'id') {
                customerObj['bc'].id = dataObj.id
            } else if (key === 'provider') {
                customerObj['bc'].provider = dataObj.provider
            } else {
                customerObj[key] = dataObj[key];
            }
        };
        console.log("customerObj: ", customerObj);
        call.postCustomer(customerObj);
    };

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
    };

    $('#manual-add').on('click', () => {
        if ($('#lookup-email').val().length >= 4) {
            let email = $('#lookup-email').val();
            $('#customerEmail').val(email);
        };

        $('#new-customer-dialog').fadeOut(1600);
        $('#new-customer').fadeIn(1600);
    })

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

    };


    // UTILITIES
    function isEmpty(obj) {
        return Object.keys(obj).length === 0;
    };

});