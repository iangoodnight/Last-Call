$( document ).ready(function() {

    console.log( "ready!" );

    //  To do: Clear out redundant calls on #notes

    $('body').on('focus', '[contenteditable]', function() {
        const $this = $(this);
        $this.data('before', $this.html());
    }).on('blur keyup paste input', '[contenteditable]', function() {
        const $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
    });

    $("form").on("submit", function(e) {
    	handleCustomerPost();
    });

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

    $('#find-customer').keyup(e => {
        let target = $(e.target).data('id');
        console.log(target);
        if (e.keyCode == 13 && target) {
            $('#find-customer').attr('disabled', 'disabled');
            let url = '/customers/' + target;
            $(location).attr('href', url);
        };
    });

    $('i.fa-pencil-alt').on('click', e => {
        let spans = $('span.edit');
        $(spans).removeClass('selectAll');
        let rows = $(spans).closest('div.row');
        let target = $(e.target).closest('div.row');
        let edit = $(target).find('span.edit');
        $(rows).css('background-color', '#fff');
        $(spans).attr('contenteditable', 'false');
        $('#customer-email-link').unbind('click');
        if (!$(target).hasClass('notes')) {
            $('span#notes').text($('div.notes-entry div textarea').val());
            $('div.notes-entry').fadeOut(500);
            $('span#notes').fadeIn(1600);            
            $(target).css({
                'background-color': '#f8f9fa'
            });
            $(edit).css({
                'background-color': '#fff'
            });
            $(edit).attr('contenteditable','true');
            $(edit).addClass('selectAll');
            $(edit).focus().select();
            requestAnimationFrame(() => {
                selectElementContents(document.querySelector('span.edit.selectAll'));
            });            
        } else {
            let currentNotes = $(edit).text();
            console.log(currentNotes);
            // $('div.notes-entry textarea').val(currentNotes);
            $(edit).fadeOut(500);
            $('div.notes-entry').fadeIn(500);
            $('#notes-area').focus();
            $('div.notes-entry textarea').val('');
            $('div.notes-entry textarea').val(currentNotes);
        }

        console.log(target);
    });

    $('span.edit').on('change', e => {
        console.log("Shit is changing!");
        $(e.target).addClass('new');
        $('button.save-on-change').fadeIn(800);
    });

    $('#notes-area').on('keyup', e => {
        let note = $('#notes-area').val();
        $('#notes').text(note);
        console.log(note);
        $('#notes').addClass('new');
        $('button.save-on-change').fadeIn(800);
        console.log("here we gooooooo!");
    })

    // Select all conteneditable onFocus
    function selectElementContents(el) {
        let range = document.createRange();
        range.selectNodeContents(el);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    $('span.edit').on('keydown', e => {
        if (e.keyCode == 13 && !e.ctrlKey) {
            $(e.target).blur();
            $(e.target).attr('contenteditable', 'false');
            $(e.target).closest('div.row').css('background-color', '#fff');
            $('#customer-email-link').bind('click');    
        }
    });

    //
    // Maybe we need to clean this up.  Seems to add some confusion to customer edit form
    //
    $('body').mouseup(e => {
        if ($(e.target).closest('div.card div.row').length === 0) {
            let spans = $('span.edit');
            let rows = $(spans).closest('div.row');
            $(rows).css('background-color', '#fff');
            $(spans).attr('contenteditable', 'false');
            $('span#notes').text($('div.notes-entry div textarea').val());
            $('div.notes-entry').fadeOut(500);
            $('span#notes').fadeIn(1600);
            $('#customer-email-link').bind('click');    
        };
    })

    $('table tr.results').on('dblclick', (e) => {
        let target = $(e.target).parent().data('id');
        let url = '/customers/' + target;
        $(location).attr('href', url);
    });

    $('button.save-on-change').on('click', () => {
        let customerUpdate = {};
        $('span.new').each((index, el) => {
            let key = $( el ).data('key');
            let val = $( el ).text().trim();
            customerUpdate[key] = val;
            console.log('key: ', key, '\nval: ', val);
        });
        let id = $('#customer-info').data('id');
        call.updateCustomer(customerUpdate, id);
        console.log("Customer Update: ", customerUpdate);
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