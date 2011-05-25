
var sha2 = require('./SHA2');

// ## The *mergeObjs* function
// is a simple helper function to create a new object based on input objects.
// It has been copied from the *Registration* server source, and so is a
// candidate for moving into a common library.
var mergeObjs = function () {
	var outObj = {};
	for(var i in arguments) {
		if(arguments[i] instanceof Object) {
			for(var j in arguments[i]) {
				// Does not check for collisions, newer object
				// definitions clobber old definitions
				outObj[j] = arguments[i][j];
			}
		}
	}
	return outObj;
};
exports.mergeObjs = mergeObjs;

// ### The *setMasterKey* method
// is provided by the *Registration* server a new *masterKey*, and this method
// simply marks the current key as the old key and the newly-provided key as
// the master key, and informs the *Registration* server that it was successful
function setMasterKey(masterKey) {
	global.registration.prevMasterKey = global.registration.currMasterKey;
	global.registration.currMasterKey = masterKey;
	return true;
};
exports.setMasterKey = setMasterKey;

// ## The *verifyUser* function
// validates whether or not the user has successfully logged into the
// *Registration* server, indicating whether or not access should be granted
// by whatever function calls it.
// IMPORTANT: This function expects global.registration.currMasterKey and global.registration.prevMasterkey to be defined.
function verifyUser(user_id, session_code) {
	var currSessionCode = sha2(global.registration.currMasterKey + user_id);
	if(currSessionCode == session_code) {
		return true;
	}
	currSessionCode = sha2(global.registration.prevMasterKey + user_id);
	if(currSessionCode == session_code) {
		return true;
	} else {
		return false;
	}
};
exports.verifyUser = verifyUser;

// ## The *authenticate* function
// is a wrapper around the *verifyUser* function that will also execute a
// provided *callback* if the user validation fails. This is a convenience
// function to reduce code size, but does not completely replace the
// *verifyUser* function if, for example, a function performs different actions
// depending on whether or not a user is logged in.
function authenticateUser(userId, sessionCode, callback) {
	if(verifyUser(userId, sessionCode)) {
		return true;
	} else {
		callback(null, "Invalid Session");
		return false;
	}
};
exports.authenticateUser = authenticateUser;
