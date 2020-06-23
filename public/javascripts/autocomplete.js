$( document ).ready(function() {
    // Autocomplete function
    $("#search-customers, .customer-search").autocomplete({
    	source: function(req, res) {
			let currentValue = $("input.customer-lookup").val();
    		$.ajax({
    			dataType: "json",
    			type: "get",
    			url: "/api/customer/q/" + currentValue,
    			success: function(data) {
    				res($.map(data, function(item) {
    					return {
    						label: item.label,
    						value: item.value,
    						id: item.id,
    						in_house: item.in_house
    					};
    				}))
    				res(data);
    			}
    		})
    	},
    	select: function (event, ui) {
    		event.preventDefault();
    		console.log(ui.item);
    		$("#search-customers").val(ui.item.label);
    		$("#customer-id").val(ui.item.id);
            $("input.customer-lookup").attr('data-id', ui.item.id);
    		$(".order-details").show();
    		$("#orderNumber-1").focus();
    		// $(".continue").prop("disabled", false);
    	},
    	focus: function(event, ui) {
    		event.preventDefault();
    		$(this).val(ui.item.label);
    		$("#customer-id").val(ui.item.id);
    		$("#exists-in_house").val(ui.item.in_house);    			
    	},
    	minLength: 3,
    	scroll: true
    	// appendTo: "#search-customers" 
    }).data( "ui-autocomplete" )._renderItem = function(ul, item) {
		var $div = $("<div class='search-container'></div>").text(item.label);
		highlightText(this.term, $div);
		return $("<li class='search-result'></li>").append($div).appendTo(ul);
    };
    // For highlighting autocomplete results
	function highlightText(text, $node) {
		var searchText = $.trim(text).toLowerCase(), currentNode = $node.get(0).firstChild, matchIndex, newTextNode, newSpanNode;
		while ((matchIndex = currentNode.data.toLowerCase().indexOf(searchText)) >= 0) {
			newTextNode = currentNode.splitText(matchIndex);
			currentNode = newTextNode.splitText(searchText.length);
			newSpanNode = document.createElement("span");
			newSpanNode.className = "highlight";
			currentNode.parentNode.insertBefore(newSpanNode, currentNode);
			newSpanNode.appendChild(newTextNode);
		}
	}
});