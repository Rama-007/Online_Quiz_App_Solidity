var Quiz = artifacts.require("quiz.sol");
const truffleAssert = require("truffle-assertions");

contract("Quiz", accounts => {
	const owner=accounts[0];
	describe("constructor", () => {
		describe("Assert Contract is deployed", () => {
			it("should deploy this contract", async () => {
				const instance = await Quiz.new(5,100,[1,3,5,7],[2,4,6,8],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });

				let tot = await instance.no_members.call();
				let fee = await instance.registration_fee.call();
				assert.isNotNull(instance);
				assert.equal(tot.toNumber(), 5);
				assert.equal(fee.toNumber(), 100);
				
			});
		});
	});
});