// GLOBALS
var displayIcons = document.querySelectorAll('i.fa-search');

// FUNCTIONS
function showEditPane(e) {
	// alert(e);
	let editRow = e.target.closest('tr');
	let editId = editRow.dataset.id;
	let editTable = document.querySelector(`[data-order='${editId}']`);
	let displayRow = editTable.closest('tr.hidden-details');
	toggle(displayRow, 'table-row');
	toggleClass(editRow, 'toggled');
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

function toggleClass(el, className) {
	if (el.classList.contains(className)) {
		el.classList.remove(className);
	} else {
		el.classList.add(className);
	};
};

// EVENT HANDLERS
displayIcons.forEach(el => {
	el.addEventListener('click', showEditPane, false);
});