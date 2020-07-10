$( document ).ready(function() {
	//
	// Globals
	//
	// Select options for onClick population
	const laminateOptions = ['Matte', 'High-gloss'];
	const machineOptions = ['Metas', 'Plotter'];
	// Populated by filterStatuses()
	let statusOptions = [];
	let statusIds = {};
	//
	// Functions
	//
	// IIFE to populate statusOptions
	(async function filterStatuses() {
		await call.getStatuses()
			.then(res => {		
				res.map(status => {
					statusOptions.push(status.status);
					statusIds[status.status] = status._id;
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
        $('select.temporary-input, div.temporary-input').hide();
        $('span.input-swap').show();
    	$('tr.notes textarea').hide();
    	$('tr.notes span.edit').show();
    	$('table.nested, div.card').removeClass('editing');
    };
    // Build Select inputs where contenteditable is a PITA
    function buildSelect(target, optionsArr) {
    	let options = ['<select class="temporary-input form-control form-control-sm">'];
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
    // Buildinput for artwork edits
    function buildArtWorkInput(target, order) {
    	let title = $(target).text().trim();
    	let href = $(target).attr('href');
    	href === undefined ? href = '': false;
    	let el = `	<div class="temporary-input artwork-edits">
    					<div class="form-group row">
    						<label for="${order}-art-title" class="col-sm-1 col-form-label col-form-label-sm">Title</label>
    						<div class="col-sm-11">
    							<input type="text" class="form-control form-control-sm" name="artwork-title" value="${title}" id="${order}-art-title">
    						</div>
    					</div>
    					<div class="form-group row">
    						<label for="${order}-art-link" class="col-sm-1 col-form-label col-form-label-sm">Link</label>
    						<div class="col-sm-11">
    							<input type="text" class="form-control form-control-sm" name="artwork-link" value="${href}" id="${order}-art-link">
    			  			</div>
    			  		</div>
    			  	</div>`;
    	console.log(`title: ${title}, target: ${href}`);
    	return el;
    };
    // Regex for extracting numbers from text string
    function matchNumbers(target) {
    	let re = new RegExp('\d*.?\d*', 'g');
    	let targetString = $(target).text().trim();
    	let matches = [];
    	if (targetString !== '') {
    		matches = [...targetString.matchAll(/\d+.?\d*/g)];
    	} else {
    		matches = [[],[]];
    	};
    	return matches;   	
    };
    // Build input for dimensions edits
    function buildDimensionsInput(target) {
    	let matches = matchNumbers(target);
    	let el = `	<div class="temporary-input dimension-edits">
    					<div class="form-row">
    						<div class="col-sm-2">
    							<input type="text" value="${matches[0][0]}" class="form-control form-control-sm">
    						</div>
    						<div class="col-sm-1 filler text-center">
    							<span style="width: 100%;"><i class="fa fa-times text-center" aria-hidden="true"></i></span>
    						</div>
    						<div class="col-sm-2">
    							<input type="text" value="${matches[1][0]}" class="form-control form-control-sm">
    						</div>
    					</div>
    				</div>`;
    	return el;
    };
    // Build UPC and Quantity inputs
    function buildInputs(target, type) {
    	let className;
    	let value = target.text().trim();
    	type === 'number' ? className = 'qty-edits' : 'simple-edits';
    	let el = `	<div class="temporary-input ${className}">
    					<div class="form-row">
    						<input type=${type} value="${value}" class="form-control form-control-sm simple-input">
    					</div>
    				</div>`;
    	return el;
    };
    // Input Handler
    function inputHandler(row, target, inputElement) {
    	if ($(row).find('div.temporary-input').length === 0) {
            $(target).hide();
            $(target).closest('td').append(inputElement);    		
    	} else {
        	$(target).hide();
        	$(target).closest('td').find('div.temporary-input').show();
        	$(target).closest('td').find('input').first().focus();		
    	};  	
    };
    // Handler for "pencil" click on a future select input
    function selectHandler(row, target, selectElement) {
    	if ($(row).find('select.temporary-input').length === 0) {
            $(target).hide();
            $(target).closest('td').append(selectElement);    		
    	} else {
        	$(target).hide();
        	$(target).closest('td').find('select').show().focus(); 		
    	};
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
    // Test for "saveAll" conditions
    function countSaveButtons() {
    	let visibleSaveButtons = $('.save:visible');
    	let check;
    	visibleSaveButtons.length > 1 ? check = true: check = false;
    	return check;   	
    };
    // Reset status changes
    function resetStasuses(checkBox) {
    	checkBox.forEach(line => {
    		let id = $(line).closest('tr').data('id');
    		let statusSpan = $('#' + id).find('td.status span.edit.replaced');
    		let originalStatus = statusSpan.text().trim();
    		$(line).closest('tr').find('td.status').text(originalStatus);
    		$(line).closest('tr').removeClass('new');
    		statusSpan.removeClass('replaced'); 		
    	});
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
    $('button.save-on-change').on('click', (e) => {
        let customerUpdate = {};
        $('#customer-info span.new').each((index, el) => {
            let key = $( el ).data('key');
            let val = $( el ).text().trim();
            customerUpdate[key] = val;
        });
        let id = $('#customer-info').data('id');
        call.updateCustomer(customerUpdate, id);
        $(e.target).fadeOut(600);
    });
    // Handle updates to orders
    $('table.nested').on('click', 'button.save-order', function(e) {
    	let orderElement = $(this).closest('table');
    	let orderId = orderElement.data('id');
    	let orderDetails = {};
    	$(orderElement).find('span.new').each(function(index, el) {
    		let key = $( el ).closest('tr').data('key');
    		let val = $( el ).text().trim();
    		if (key !== 'dimensions') {
    			if (key === 'status') {
    				orderDetails[key] = statusIds[val];
    			} else {
    				orderDetails[key] = val; 
    			};  			
    		} else {
    			let matchDimensions = matchNumbers(el);
    			let dimensions = {
    				dim1 : matchDimensions[0][0],
    				dim2 : matchDimensions[1][0]
    			};
    			orderDetails['dimensions'] = dimensions;
    		};
    		if (key === 'artwork') {
    			let href = $(el).find('a.art-link').attr('href');
    			orderDetails['artworkHref'] = href;
    		};
    	});
    	call.updateOrder(orderDetails, orderId);
    	resetInputs();
    	$(this).fadeOut(600);
    });
    // Handle magnifying glass onClick (Display order details)
    $('.open-order').on('click', (e) => {
        let target = e.target;
        let row = $(target).closest('tr.order-results');
        let id = row.data('id');
        $('#' + id).toggle(600);
        if (!row.hasClass('toggled')) {
            row.addClass('toggled');
            row.children('td.order-details-header').css('font-size', '0rem');
            row.children('td.order-number').css({
                'font-weight': 'bolder',
                'font-size': '1rem'
            });
        } else {
            row.removeClass('toggled');
            row.children('td.order-details-header').css('font-size', 'inherit');
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
    // Keep artwork changes updated
    $('table.nested').on('keyup', 'div.artwork-edits input', function(e) {
    	let artworkSpan = $(this).closest('td').find('span.edit a.art-link');
    	let edit = $(this).val().trim();
        let table = $(this).closest('table');
    	if ( $(this).attr('name') === 'artwork-title' ) {
    		artworkSpan.text(edit);
    	};
    	if ( $(this).attr('name') === 'artwork-link' ) {
    		artworkSpan.attr('href', edit);
    	};
    	artworkSpan.closest('span.edit').addClass('new');
        $(table).find('button.save-order').fadeIn(600);   	
    });
    // Keep UPC and Qty changes updated (this can probably be refactored/combined with some other handlers)
    $('table.nested').on('keyup', 'input.simple-input', function(e) {
    	let span = $(this).closest('tr').find('span.edit');
    	let edit = $(this).val().trim();
        let table = $(e.target).closest('table');
    	span.text(edit);
    	span.addClass('new');
        $(table).find('button.save-order').fadeIn(600);
    });
    // Keep dimension changes updated
    $('table.nested').on('keyup', 'div.dimension-edits input', function(e) {
    	let myDimensions = [];
    	let text;
        let table = $(this).closest('table');
    	let dimSpan = $(this).closest('td').find('span.edit');
    	let dims = $(this).closest('div.form-row').find('input');
    	$(dims).each(function() {
    		myDimensions.push($(this).val()*1);
    	});
    	text = `${myDimensions[0]}" x ${myDimensions[1]}"`;
    	dimSpan.text(text);
    	dimSpan.addClass('new');
    	console.log(myDimensions);
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
        let order = $(target).closest('table.nested').data('order_number');
        $(target).closest('table.nested').addClass('editing');
        switch ($(row).data('key')) {
        	// Handle any special cases in the "Order" form
        	case 'artwork':
        		inputElement = buildArtWorkInput(target, order);
        		inputHandler(row, target, inputElement);
        		console.log("Phewwww!");
        		break;
        	case 'dimensions':
        		inputElement = buildDimensionsInput(target);
        		inputHandler(row, target, inputElement);
        		break;
            case 'laminate':
                selectElement = buildSelect(target, laminateOptions);
                selectHandler(row, target, selectElement);
                break;
            case 'machine':
                selectElement = buildSelect(target, machineOptions);
                selectHandler(row, target, selectElement);
            	break;
            case 'qty':
            	inputElement = buildInputs(target, 'number');
            	inputHandler(row, target, inputElement);
            	break;
            case 'upc':
            	inputElement = buildInputs(target, 'text');
            	inputHandler(row, target, inputElement);
            	break;
            case 'status':
                selectElement = buildSelect(target, statusOptions);
                selectHandler(row, target, selectElement);                
            	break;
            case 'outsourced_company':
             	inputElement = buildInputs(target, 'text');
            	inputHandler(row, target, inputElement);
            	break;
            case 'po':
            	inputElement = buildInputs(target, 'text');
            	inputHandler(row, target, inputElement);
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
    // Show toolbar on check/ hide on uncheck
    $('input[type="checkbox"]:not(:first)').on('change', function(e) {
    	if (this.checked) {
    		displayToolbar(false, true);
    	} else {
    		let count = countSaveButtons();
    		resetStasuses([this]);
    		if ($('input[type="checkbox"]:checked').length === 0 && !count) {
    			hideToolbar();
    		};
    	};
    })
    // Select Handler for bulk status edits
    $('#dropdown-statuses').on('click', 'a', function(e) {
    	let selected = $('input[type="checkbox"]:checked:not(#order-select-all)');
    	let statusHeaders = selected.closest('tr').find('td.status');
    	let headerRow = selected.closest('tr');
    	let newStatus = $(this).text().trim();
    	let statusId = statusIds[newStatus];
    	let rowIds = [];
    	headerRow.each(function() {
    		rowIds.push($(this).data('id'));
    	});
    	rowIds.forEach(id => {
    		let statusSpan = $('#' + id).find('td.status span.edit');
    		statusSpan.attr('data-status', newStatus);
    		statusSpan.addClass('replaced');
    	});
    	headerRow.addClass('new');
    	statusHeaders.text(newStatus);
    	$('#statusChange').attr('data-statusid', statusId);
    	enableSaveAll();
    });
    // To Do:
    // Save All
    // Save orders
    $('#order-select-all').on('change', function(e) {
    	if (this.checked) {
    		$('input[type="checkbox"]').prop('checked', true);
    		displayToolbar(false, true);
    	} else {
    		let count = countSaveButtons();
    		let checkBoxes = $('input[type=checkbox]:not(:first)');
    		resetStasuses([checkBoxes]);
    		count ? true: hideToolbar();
    		checkBoxes.prop('checked', false);
    	};
    });
    // Save All logic
    $('#save-all').on('click', function(e) {
    	let alteredRows = $('tr.order-results.new');
    	let status = $('#statusChange').data('statusid');
    	let changes = new Array();
    	alteredRows.each(function() {
    		let statusText = $(this).find('td.status').text();
    		let orderId = $(this).data('id');
    		$('#' + orderId).find('td.status span.edit').text(statusText);
    		$('#' + orderId).find('td.status span.edit').removeClass('replaced');
    		changes.push(orderId);
    	});
    	let updates = new Data(changes, status);
    	findAndSave();
    	call.updateManyOrders(updates);
    	let boxes = $('input[type="checkbox"]:not(:first)');
    	// resetStasuses([boxes]);
    });

    function findAndSave() {
    	console.log($('.save:visible').length);
    	$('.save:visible').attr('disabled', false);
    	$('.save:visible').each(function() {
    		$(this).click();
    	});
    };
    //
    // CONSTRUCTORS
    //
    function Data(ids, status) {
    	this.ids = ids;
    	this.status = status; 
    };
});
