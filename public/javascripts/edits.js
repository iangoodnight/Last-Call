// GLOBALS
var displayIcons = document.querySelectorAll('i.fa-search');
var editIcons = document.querySelectorAll('i.fa-pencil-alt');
var orderInputs = document.querySelectorAll('td.hidden-input input.edit-order');
var orderSelects = document.querySelectorAll('td.hidden-input select.edit-order');
var textAreaNotes = document.querySelectorAll('td.hidden-input textarea.edit-order');
var checkBoxes = document.querySelectorAll('input[type="checkbox"]:not(#master-check)');
var saveBtns = document.querySelectorAll('button.save-details');
var toolbar = document.querySelector('#toolbar');
var bulkStatusSelect = document.querySelector('#dropdown-statuses');
var sm = new StatusMachine();

// Initialize status machine for use later
sm.init();
// Populate map
var statusMap = sm.hash();

// FUNCTIONS

function showEditPane(e) {
	let editRow = e.target.closest('tr');
	let editId = editRow.dataset.id;
	let editTable = document.querySelector(`[data-order='${editId}']`);
	let displayRow = editTable.closest('tr.hidden-details');
	let check = displayRow.querySelector('td.details-table').classList.contains('edited');
	if (!check) {
		toggle(displayRow, 'table-row');
		toggleClass(editRow, 'toggled');
	};
};

function hide(el) {
    el.style.display = 'none';
};

function show(el, value) {
    el.style.display = value;
};

function toggle(el, value) {
    let display = (window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle).display;
    if (display == 'none') el.style.display = value;
    else el.style.display = 'none';
};

function checkSaveAll() {
	let buttons = Array.from(saveBtns).filter(btn => getComputedStyle(btn, null).display !== 'none');
	return buttons;
}

function toggleClass(el, className) {
	if (el.classList.contains(className)) {
		el.classList.remove(className);
	} else {
		el.classList.add(className);
	};
};

function passControlToSaveAll() {
	checkSaveAll().forEach(btn => {
		btn.disabled = true;
	});
	enableSaveAll();
};

function saveAllRules() {
	if (checkSaveAll().length > 1) {
		show(toolbar);
		passControlToSaveAll();
	};
};

function changeStatus(checkbox, status) {
	let parent = checkbox.closest('tr.results');
	let orderId = parent.dataset.id;
	let detailsTable = document.querySelector(`table[data-order='${orderId}']`);
	let container = detailsTable.closest('td.details-table');
	let headerStatus = parent.querySelector('td.table-status');
	let tableStatusRow = detailsTable.querySelector('tr[data-key="status"]');
	let tableStatusDetail = tableStatusRow.querySelector('td.status');
	headerStatus.innerText = status;
	tableStatusDetail.innerText = status;
	tableStatusRow.classList.add('new');
	container.classList.add('edited');
};

function bulkEdit(status) {
	checkBoxes.forEach(box => {
		// Handle the changes
		changeStatus(box, status);
	});
};

// ADD HANDLER

function switchInput(e) {
	let ref = e.target;
	let row = ref.closest('tr');
	let td = row.querySelector('td.edit');
	let input = row.querySelector('td.hidden-input');
	let table = row.closest('table');
	let inputs = table.querySelectorAll('td.hidden-input');
	let displays = table.querySelectorAll('td.edit');
	if (td.style.display === 'none') {
		toggle(td, 'table-cell');
		toggle(input, 'table-cell');
		return;		
	};
	displays.forEach(field => {
		show(field, 'table-cell');
	});
	inputs.forEach(one => {
		hide(one);
	});
	toggle(td, 'table-cell');
	toggle(input, 'table-cell');
};

function handleSelects(e) {
	let select = e.target;
	let name = select.name;
	let val = select.value;
	let row = select.closest('tr');
	let td = row.querySelector('td.edit');
	let headerId = select.closest('table').dataset.order;
	let header = select.closest('table.orders').querySelector(`tr[data-id='${headerId}']`);
	let headerDetail = header.querySelector(`td.table-${name}`);
	let btn = select.closest('tr.hidden-details').querySelector('button.save-details');
	let container = select.closest('td.details-table');
	td.innerText = val;
	if (headerDetail !== null) {
		headerDetail.innerText = val;
	};
	row.classList.add('new');
	container.classList.add('edited');
	show(btn, 'block');
	saveAllRules();
};

function handleTextArea(e) {
	let textarea = e.target;
	let val = textarea.value;
	let row = textarea.closest('tr');
	let td = row.querySelector('td.edit');
	let btn = textarea.closest('tr.hidden-details').querySelector('button.save-details');
	let container = textarea.closest('td.details-table');
	td.innerText = val;
	row.classList.add('new');
	container.classList.add('edited');
	show(btn, 'block');
	saveAllRules();
};

function handleInputs(e) {
	let input = e.target;
	let name = input.name;
	let val = input.value;
	let row = input.closest('tr');
	let td = row.querySelector('td.edit');
	let headerId = input.closest('table').dataset.order;
	let header = input.closest('table.orders').querySelector(`tr[data-id='${headerId}']`);
	let headerDetail = header.querySelector(`td.table-${name}`);
	let btn = input.closest('tr.hidden-details').querySelector('button.save-details');
	let container = input.closest('td.details-table');
	let text = td.innerText;
	let re = /\d\.*\d?/g;
	let matches;
	let formatted;
	switch (name) {
		case 'artworkHref':
			break;
		case 'dim1':
			matches = Array.from(text.matchAll(re));
			matches[0][0] = val;
			formatted = `${matches[0][0]}" x ${matches[1][0]}"`;
			td.innerText = formatted;
			header.querySelector('td.table-dimensions').innerText = formatted;
			break;
		case 'dim2':
			matches = Array.from(text.matchAll(re));
			matches[1][0] = val;
			formatted = `${matches[0][0]}" x ${matches[1][0]}"`;
			td.innerText = formatted;
			header.querySelector('td.table-dimensions').innerText = formatted;
			break;
		default:
			td.innerText = val;
			headerDetail.innerText = val;
			break;
	};
	row.classList.add('new');
	container.classList.add('edited');
	show(btn, 'block');
	saveAllRules();
};

function toggleChecks(e) {
	let test = checkSaveAll().length;
	if (test > 1) {
		enableSaveAll();
	};
	if (this.checked) {
		checkBoxes.forEach(box => {
			box.checked = true;
		});
		show(toolbar, 'block');
	} else {
		checkBoxes.forEach(box => {
			box.checked = false;
		});
		if (test < 2) {
			hide(toolbar);
		};
	};
};

function enableSaveAll() {
	let saveAll = document.querySelector('#save-all');
	saveAll.classList.remove('disabled');
	saveAll.removeAttribute('disabled');	
};

function toggleSaveAll() {
	let saveAll = document.querySelector('#save-all');
	if (saveAll.classList.contains('disabled')) {
		enableSaveAll();
	} else {
		saveAll.classList.add('disabled');
		saveAll.setAttribute('disabled', true);		
	};
};

async function handleSave(e) {
	console.log("Saving details...");
	let data = {};
	let table = this.closest('tr.hidden-details');
	let orderId = table.querySelector('table.reference').dataset.order;
	let changes = table.querySelectorAll('.new');
	let container = table.querySelector('td.details-table');
	changes.forEach(change => {
		let key = change.dataset.key;
		let detail = change.querySelector('td.edit');
		let input = change.querySelector('td.hidden-input');
		let val = detail.innerText;
		if (key === 'artwork') {
			href = change.querySelector('input[name=artworkHref]').value;
			data['artworkHref'] = href;
		};
		if (key === 'status') {
			data[key] = statusMap[val];
		} else {
			data[key] = val;
		}
		if (detail.style.display === 'none') {
			toggle(input, 'table-cell');
			toggle(detail, 'table-cell');
		};
		change.classList.remove('new');
		console.log(data);
	});
	try {
		await call.updateOrder(data, orderId);
		alert(`Details saved!`);
	} catch (error) {
		console.log(error.msg);
	};
	hide(table.querySelector('button.save-details'));
	container.classList.remove('edited');
};

function parseStatus(el) {
	let status = el.innerText;
	return status;
};

// EVENT HANDLERS
displayIcons.forEach(el => {
	el.addEventListener('click', showEditPane, false);
});

editIcons.forEach(el => {
	el.addEventListener('click', switchInput, false);
});

orderInputs.forEach(el => {
	el.addEventListener('input', handleInputs, false);
});

orderSelects.forEach(el => {
	el.addEventListener('change', handleSelects, false);
});

textAreaNotes.forEach(el => {
	el.addEventListener('input', handleTextArea, false);
});

saveBtns.forEach(el => {
	el.addEventListener('click', handleSave, false);
});

document.querySelector('input#master-check').addEventListener('change', toggleChecks, false);

bulkStatusSelect.addEventListener('click', function(e) {
	let selected = e.target;
	let newStatus = parseStatus(selected);
	let statusId = selected.dataset.id;
	bulkEdit(newStatus);
	document.querySelector('#master-check').setAttribute('disabled', true);
	checkBoxes.forEach(box => {
		box.setAttribute('disabled', true);
	});
	bulkStatusSelect.dataset.status = statusId;
	enableSaveAll();
}, false);

checkBoxes.forEach(box => {
	box.addEventListener('click', function(e) {
		let count = Array.from(checkBoxes).filter(box => box.checked === true).length;
		console.log(`${count} boxes have been checked.`);
		if (count > 1) {
			show(toolbar, 'block');
		} else {
			checkSaveAll().length <= 1 ? hide(toolbar): false;
		};
	});
}, false);
