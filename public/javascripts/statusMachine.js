function StatusMachine() {
	var statusOptions = [];
    var statusIds = {};
	this.init = async function filterStatuses() {
        await call.getStatuses()
            .then(res => {      
                res.map(status => {
                    statusOptions.push(status.status);
                    statusIds[status.status] = status._id;
                });
            });
        let statusList = [];
        statusOptions.forEach(status => {
            let openLink = `<a class="dropdown-item status" data-id="${statusIds[status]}" href="#">`;
            let closeLink = '</a>';
            statusList.push(openLink, status, closeLink);
        });
        let html = statusList.join('');
        document.querySelector('#dropdown-statuses').innerHTML = html;
    };
    this.list = function() {
    	return statusOptions;
    };
    this.hash = function() {
    	return statusIds;
    };
};