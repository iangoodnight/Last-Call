$( document ).ready(function() {

	const laminateOptions = ['Matte', 'High-gloss'];
	const machineOptions = ['Metas', 'Plotter'];
	let statusOptions = [];
	(async function filterStatuses() {
		await call.getStatuses()
			.then(res => {
				console.log("REs: ", res);		
				res.map(status => {
					console.log('Status: ', status);
					statusOptions.push(status.status);
				});
			});
	})();
    // Create onChange event bound to contenteditable.
    $('body').on('focus', '[contenteditable]', function() {
        const $this = $(this);
        $this.data('before', $this.html());
    }).on('blur keyup paste input', '[contenteditable]', function() {
        const $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        };
    });
    // Select all contenteditable onFocus
    function selectElementContents(el) {
        let range = document.createRange();
        range.selectNodeContents(el);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
    // Define Enter key behavior within contenteditable
    $('span.edit').on('keydown', e => {
        if (e.keyCode == 13 && !e.ctrlKey) {
            $(e.target).blur();
            $(e.target).attr('contenteditable', 'false');
            $(e.target).css('background-color', 'inherit');
            $(e.target).closest('div.row').css('background-color', '#fff');
            $('#customer-email-link').bind('click');    
        }
    });
    // Handle Save buttons (display)
    $('table.nested span.edit').on('change', e => {
        $(e.target).addClass('new');
        let table = $(e.target).closest('table');
        $(table).find('button.save-order').fadeIn(600);
    });
    $('div.card-body span.edit').on('change', e => {
        $(e.target).addClass('new');
        $('button.save-on-change').fadeIn(600);
    });
    // Handle updates to customer information
    $('button.save-on-change').on('click', () => {
        let customerUpdate = {};
        $('#customer-info span.new').each((index, el) => {
            let key = $( el ).data('key');
            let val = $( el ).text().trim();
            customerUpdate[key] = val;
        });
        let id = $('#customer-info').data('id');
        call.updateCustomer(customerUpdate, id);
        location.reload();
    });
    // Handle updates to orders
    $('table.nested').on('click', 'button.save-order', function(e) {
    	let orderElement = $(this).closest('table');
    	let orderId = orderElement.data('id');
    	let orderDetails = {};
    	$(orderElement).find('span.new').each(function(index, el) {
    		let key = $( el ).closest('tr').data('key');
    		let val = $( el ).text().trim();
    		orderDetails[key] = val;
    	})
    	console.log(orderDetails);
    })
    // Handle magnifying glass onClick (Display order details)
    $('.open-order').on('click', (e) => {
        let target = e.target;
        let row = $(target).closest('tr.order-results');
        let id = row.data('id');
        $('#' + id).toggle(600);
        if (!row.hasClass('toggled')) {
            row.addClass('toggled');
            row.children('td.order-details-header').css('visibility', 'hidden');
            row.children('td.order-number').css({
                'font-weight': 'bolder',
                'font-size': '1rem'
            });
        } else {
            row.removeClass('toggled');
            row.children('td.order-details-header').css('visibility', 'visible');
            row.children('td.order-number').css({
                'font-weight': 'normal',
                'font-size': 'inherit'
            });
        }
        console.log(id);
    });
    // Keep state updated with values
    // To DO: Extend this functionality.
    $('tr.select').on('change', 'select.temporary-input', (e) => {
        let newValue = $(e.target).val();
        $(e.target).closest('td').find('span.edit').text(newValue);
        $(e.target).closest('td').find('span.edit').addClass('new');
        let table = $(e.target).closest('table');
        $(table).find('button.save-order').fadeIn(600);
    });
    // Build Select inputs where contenteditable is a PITA
    function buildSelect(target, optionsArr) {
    	let options = ['<select class="temporary-input">'];
    	let current = $(target).text().trim();
    	let defaultOption;
    	current === '' ? defaultOption = '<option value="">Select</option>'
    		: defaultOption = '<option value="' + current + '">' + current + '</option>';
    	options.push(defaultOption);
    	optionsArr.forEach(option => {
    		let html;
    		option !== current ? html = '<option value="' + option + '">' + option + '</option>'
    			: html ='';
    		options.push(html);
    	});
    	options.push('</select>');
    	let el = options.join('');
    	return el;
    };
    // Handles textarea magic
    $('#notes-area').on('keyup', e => {
        let note = $('#notes-area').val();
        $('#notes').text(note);
        $('#notes').addClass('new');
        $('button.save-on-change').fadeIn(600);
    });
    $('tr textarea').on('keyup', function(e) {
    	let text = $(this).val();
    	let edit = $(this).closest('td').find('span.edit');
    	$(edit).addClass('new');
    	$(edit).text(text);
        let table = $(e.target).closest('table');
        $(table).find('button.save-order').fadeIn(600);
    });
    // Handler for "pencil" click on a future select input
    function selectHandler(row, target, selectElement) {
    	if ($(row).find('select.temporary-input').length === 0) {
            $(target).hide();
            $(target).closest('td').append(selectElement);    		
    	} else {
    		console.log("Fallback...");
        	$(target).hide();
        	$(target).closest('td').find('select').show(); 		
    	}
    };
    //
    // Needs Refactoring
    //

    // Handle Order Edits through customer profile
    $('table.nested tbody tr td i.fa-pencil-alt').on('click', e => {
        console.log("Edit order...");
        let spans = $('table span.edit');
        spanDecorator(spans);
        $('select.temporary-input').hide();
        $('span.input-swap').show();
        $(spans).removeClass('selectAll'); 
        let row = $(e.target).closest('tr');
        let target = $(row).find('span.edit');
        let selectElement;
        switch ($(row).data('key')) {
        	// Handle any special cases in the "Order" form
            case 'laminate':
                selectElement = buildSelect(target, laminateOptions);
                selectHandler(row, target, selectElement);
                break;
            case 'machine':
                selectElement = buildSelect(target, machineOptions);
                selectHandler(row, target, selectElement);
            	break;
            case 'status':
                selectElement = buildSelect(target, statusOptions);
                selectHandler(row, target, selectElement);                
            	break;
            case 'notes':
            	$(target).hide();
            	let text = $(target).text().trim();
            	let textArea = $(target).closest('tr').find('textarea');
            	$(textArea).val(text);
            	$(textArea).show();
            	break;
            default:
                $(target).addClass('selectAll');
                $(target).css('background-color', '#fff');
                $(target).attr('contenteditable', 'true');
                $(target).focus().select();
                requestAnimationFrame(() => {
                    selectElementContents(document.querySelector('span.edit.selectAll'));
                });
                break;
        };

    });

    $('#customer-info i.fa-pencil-alt').on('click', e => {
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
            $(edit).fadeOut(500);
            $('div.notes-entry').fadeIn(500);
            $('#notes-area').focus();
            $('div.notes-entry textarea').val('');
            $('div.notes-entry textarea').val(currentNotes);
        };
    });

    function spanDecorator(spans, noteToggle) {
    	// if (noteToggle && noteTogggle !== false) {
    	// 	$('textarea').hide();    		
    	// };
    	$(spans).show();
        $(spans).attr('contenteditable', 'false');
        $(spans).css('background-color', 'inherit');    	
    };
    //
    // Maybe we need to clean this up.  Seems to add some confusion to customer edit form
    //
    $('body').mousedown(e => {
        console.log('Body event');
        let target = $(e.target);
        let spans;
        if (target.closest('div.card div.row').length === 0 ) {
        	console.log("Customer");
            spans = $('div.card span.edit');
            let rows = $(spans).closest('div.row');
            $(rows).css('background-color', '#fff');
            spanDecorator(spans);
            $('span#notes').text($('div.notes-entry div textarea').val());
            $('div.notes-entry').fadeOut(600);
            $('span#notes').fadeIn(600);
            $('#customer-email-link').bind('click');
			console.log(toggle);
        };
        if (target.closest('table.nested').length === 0) {
            spans = $('table span.edit');
            spanDecorator(spans);
            $('.temporary-input').hide(); 
            $('span.input-swap').show(); 
            console.log(toggle);              
        };
    });
});
