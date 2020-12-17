/** @format */

const accessControl = require("accesscontrol");
const ac = new accessControl();

exports.roles = (function () {
	ac.grant("basic").readOwn("profile").updateOwn("profile");
	ac.grant("supervisor").extend("basic").readAny("profile");
	ac.grant("admin")
		.extend("basic")
		.extend("supervisor")
		.updateAny("profile")
		.deleteAny("profile");

	return ac;
})();

// module.exports = {
// 	roles() {
// 		ac.grant("basic").readOwn("profile").updateOwn("profile");
// 		ac.grant("supervisor").extend("basic").readAny("profile");
// 		ac.grant("admin")
// 			.extend("basic")
// 			.extend("supervisor")
// 			.updateAny("profile")
// 			.deleteAny("profile");
// 		return ac;
// 	},
// }();
