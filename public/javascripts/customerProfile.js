$( document ).ready(function() {
	//
	// Globals
	//
	// Select options for onClick population
	const laminateOptions = ['Matte', 'High-gloss'];
	const machineOptions = ['Metas', 'Plotter'];
	// Populated by filterStatuses()
	let statusOptions = [];
	//
	// Functions
	//
	// IIFE to populate statusOptions
	(async function filterStatuses() {
		await call.getStatuses()
			.then(res => {		
				res.map(status => {
					statusOptions.push(status.status);
				});
			});
		let statusList = [];
		statusOptions.forEach(status => {
			let openLink = '<a class="dropdown-item status" href="#">';
			let closeLink = '</a>';
			statusList.push(openLink, status, closeLink);
		});
		let html = statusList.join('');
		$('#dropdown-statuses').html(html);
	})();
    // Select all contenteditable onFocus
    function selectElementContents(el) {
        let range = document.createRange();
        range.selectNodeContents(el);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };
    // Set all inputs back to their default
    function resetInputs() {
    	// Logic for customer form
    	let rows = $('div.card div.row');
    	let spans = $('span.edit');
    	rows.removeClass('target');
    	spans.removeClass('selectAll');
    	spans.attr('contenteditable', 'false');
        $('#customer-email-link').bind('click'); 
    	$('div.notes-entry').fadeOut(600);
    	$('#notes').fadeIn(600);
    	// Logic for order form
        $('select.temporary-input').hide();
        $('span.input-swap').show();
    	$('tr.notes textarea').hide();
    	$('tr.notes span.edit').show();
    	$('table.nested, div.card').removeClass('editing');
    };
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
    // Handler for "pencil" click on a future select input
    function selectHandler(row, target, selectElement) {
    	if ($(row).find('select.temporary-input').length === 0) {
            $(target).hide();
            $(target).closest('td').append(selectElement);    		
    	} else {
        	$(target).hide();
        	$(target).closest('td').find('select').show(); 		
    	}
    };
    // Handle toolbar display
    function displayToolbar(save = false, status = false) {
    	let saveButtons = $('.save');
 		$('#toolbar').fadeIn(600);
 		saveButtons.attr('disabled', true);
 		saveButtons.addClass('disabled');
 		save ? enableSaveAll() : false; 
 		status ? enableChangeStatus() : false;   	
    };
    // Hide toolbar if necessary
    function hideToolbar() {
    	let saveButtons = $('.save');
 		$('#toolbar').fadeOut(600);
 		saveButtons.attr('disabled', false);
 		saveButtons.removeClass('disabled');
 		enableSaveAll(false); 
 		enableChangeStatus(false);   	
    };
    // Unlock the save all button from the toolbar
    function enableSaveAll(toggle = true) {
    	let toolbarSave = $('#save-all');
    	if (toggle) {
 			toolbarSave.attr('disabled', false);
 			toolbarSave.removeClass('disabled');    		
    	} else {
  			toolbarSave.attr('disabled', true);
 			toolbarSave.addClass('disabled');   		
    	};
    };
    // Unlock the status change dropdown from the toolbar
    function enableChangeStatus(toggle = true) {
    	let statusChange = $('#statusChange');
    	if (toggle) {
 			statusChange.attr('disabled', false);
 			statusChange.removeClass('disabled');    		
    	} else {
 			statusChange.attr('disabled', true);
 			statusChange.addClass('disabled');
    	};
    };
    function countSaveButtons() {
    	let visibleSaveButtons = $('.save:visible');
    	let check;
    	visibleSaveButtons.length > 1 ? check = true: check = false;
    	return check;   	
    };
    //
    // Event Handlers
    //
    // Create onChange event bound to contenteditable and textareas.
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
    // Reset input when clicking outside of form
    $('body').mousedown(e => {
        let target = $(e.target);
        if (target.closest('.editing').length === 0 ) {
        	resetInputs();
        };
    });
    // Hide and show toolbar based on body language
    $('body, textarea').on('change', function(e) {
    	let count = countSaveButtons();
		count ? displayToolbar(true): false;
    });
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
    	});
    });
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
        };
    });
    // Keep state updated with values
    $('tr.select').on('change', 'select.temporary-input', (e) => {
        let newValue = $(e.target).val();
        $(e.target).closest('td').find('span.edit').text(newValue);
        $(e.target).closest('td').find('span.edit').addClass('new');
        let table = $(e.target).closest('table');
        $(table).find('button.save-order').fadeIn(600);
    });
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
    // Handle Order Edits through customer profile
    $('table.nested tbody tr td i.fa-pencil-alt').on('click', e => {
        resetInputs(); 
        let row = $(e.target).closest('tr');
        let target = $(row).find('span.edit');
        let selectElement;
        $(target).closest('table.nested').addClass('editing');
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
            	$(textArea, target).toggle();
            	break;
            default:
                $(target).addClass('selectAll');
                $(target).attr('contenteditable', 'true');
                $(target).focus().select();
                requestAnimationFrame(() => {
                    selectElementContents(document.querySelector('span.edit.selectAll'));
                });
                break;
        };
    });
    // Handle customer edits
    $('#customer-info i.fa-pencil-alt').on('click', e => {
    	resetInputs();
        let target = $(e.target).closest('div.row');
        let edit = $(target).find('span.edit');
        $('#customer-email-link').unbind('click');
        $('div.card').addClass('editing');
        if (!$(target).hasClass('notes')) {
            $('span#notes').text($('div.notes-entry div textarea').val());         
            $(target).addClass('target');
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
    // To Do:
    // Save All
    // Select All
    // Bulk Edits
    // Save orders
    $('#order-select-all').on('change', function(e) {
    	if (this.checked) {
    		$('input[type="checkbox"]').prop('checked', true);
    		displayToolbar(false, true);
    	} else {
    		let count = countSaveButtons();
    		count ? true: hideToolbar();
    		$('input[type=checkbox]').prop('checked', false);
    	};
    });
});
