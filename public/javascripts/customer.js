$( document ).ready(function() {
    // To Do:
    // Clean up templating involved in BC customer lookup.  Should be handlebars all the way down.
    // Refactor manual add to reflect changes to calls.js
    // Test fade in/ fade outs for UI sensibility

    // Search functions
    // Switches form mode from "Add" to "Search"
    $('button.search-toggle').on('click', () => {
        $('button.add-toggle').removeClass('active');
        $('button.search-toggle').addClass('active');
        $('#customer-filters').fadeIn(600);
        $('#add-customer-dialog').fadeOut(600);
        $('#new-customer').fadeOut(600);
    });
    // Navigates to customer profile page from search results
    $('#find-customer').keyup(e => {
        let target = $(e.target).data('id');
        console.log(target);
        if (e.keyCode == 13 && target) {
            $('#find-customer').attr('disabled', 'disabled');
            let url = '/customers/' + target;
            $(location).attr('href', url);
        };
    });
    // Navigates to profile page from table results
    $('table tr.results').on('dblclick', (e) => {
        let target = $(e.target).parent().data('id');
        let url = '/customers/' + target;
        $(location).attr('href', url);
    });
    // Switches form mode from "Search" to "Add"
    $('button.add-toggle').on('click', () => {
        $('button.search-toggle').removeClass('active');
        $('button.add-toggle').addClass('active');
        $('#add-customer-dialog').fadeIn(600);
        $('#new-customer-dialog').fadeIn(600);
        $('#customer-filters').fadeOut(600);
    });
    // Look up customer data from bigCommerce
    $('#bc-lookup').on('click', async e => {
        let email = $('#lookup-email').val();
        if (email !== '') {
            let customers = await call.getBCCustomer(email);
            console.log(customers);
            renderBCCustomer(customers);
        };      
    });
    // Display BigCommerce customer results

    async function renderBCCustomer(customerArr) {
        let results = [];
        customerArr.map(customer => {
            if (!utils.isEmpty(customer)) {
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
        $(html).hide().appendTo('#add-customer-dialog').fadeIn(600);
        $('button.remove-result').on('click', closeListener);
        $('a.add-customer').on('click', addCustomer);
    };
    // Hide Helper Cards
    function closeListener() {
        $(this).closest('.card').fadeOut(600);
    };
    // Switch to manual add, carry over email if applicable
    $('#manual-add').on('click', () => {
        if ($('#lookup-email').val().length >= 4) {
            let email = $('#lookup-email').val();
            $('#customerEmail').val(email);
        };
        $('#new-customer-dialog').fadeOut(600);
        $('#new-customer').fadeIn(600);
    });
    // Handle new customer creation (Manual Add)
    $("form").on("submit", function(e) {
        handleCustomerPost();
    });
    // From Manual add
    function handleCustomerPost() {
        let customerObject = {
            company: $("#companyName").val(),
            contact_first: $("#customerFirstName").val(),
            contact_last: $("#customerLastName").val(),
            email: $("#customerEmail").val(),
            phone: $("#customerPhone").val(),
            in_house: $("#inHouse").val() > 0 ? true: false,
            author: null
        };
        // I changed the method slightly, come back and clean this up.
        let newObj = JSON.stringify({ customer: customerObject });
        $.ajax({
            method: "POST",
            url: "/api/customer",
            data: newObj,
            dataType: "json",
            contentType: "application/json"
        }).then(function(data) {
            console.log("Posted Data: ", data);
        });
    };
    // Handle new customer creation (BC Lookup)
    // From lookup
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
        console.log("customerObj", customerObj);
        call.postCustomer(customerObj);
    };
});