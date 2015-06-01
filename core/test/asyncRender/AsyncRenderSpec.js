var helper = require("../specRuntime/testHelper");

xdescribe("A page with async elements", () => {

	helper.startServerBeforeAll(["./asyncRender/AsyncElementPage", "./asyncRender/ServerTimeoutElementPage"]);

	helper.stopServerAfterAll();

	describe("can render", () => {
		helper.testWithDocument("/asyncElement", (document) => {
			expect(document.querySelector("#main").innerHTML).toMatch("rendered!");
		});
	});

	it("can timeout on server", (done) => {
		helper.getServerDocument("/serverTimeoutElement", (document) => {
			expect(document.querySelector("#main")).toBeNull();
			done();
		});
	});

	describe("can timeout on server but render dynamically", () => {
		helper.testWithWindow("/serverTimeoutElement", (window) => {
			expect(window.document.querySelector("#main").innerHTML).toMatch("rendered!");
		});
	});
});