const utils = {
	// UTILITIES
    isEmpty: function(obj) {
        return Object.keys(obj).length === 0;
    },
    getKeyByValue: function(object, value) {
    	for (let prop in object) {
    		if (object.hasOwnProperty(prop)) {
    			if (object[prop] === value) 
    				return prop;
    		};
    	};
    },
};