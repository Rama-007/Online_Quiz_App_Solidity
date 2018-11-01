var Quiz = artifacts.require("./quiz.sol");
// const truffleAssert = require("truffle-assertions");

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
		describe("Fail case", () => {
			it("should revert on invalid address", async () => {
				try {
					const instance = await Quiz.new(5,100,[1,3,5,7],[2,4,6,8],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0]);
					assert.fail("should throw an error");
				} catch(err)
				{
					assert.equal(err.message,"invalid address");
				}
				
			});
		});
	});
	describe("Solve Puzzle",() => {
		let instance;

		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,3,5,7],[2,4,6,8],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
		});
		describe("Success Case", () => {
			it("Person solves puzzle", async() => {
				let result= await instance.solve_puzzle(4,{from: accounts[1]});
			});
		});

		describe("Fail Case", () => {
			it("Wrong answer", async() => {
				let result= await instance.solve_puzzle(5,{from: accounts[1]});
				assert.equal(result,"solved_successfully");
			});
		});

		describe("Fail Case", () => {
			it("Conductor Cannot register", async() => {
				let result= await instance.solve_puzzle(4,{from: accounts[0]});
			});
		});
	});

	describe("Quiz Register before solving puzzle",() => {
		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,3,5,7],[2,4,6,8],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
		});
		describe("Fail Case", () => {
			it("Puzzle not solved", async() => {
				await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			});
		});
	});

	describe("Quiz Register wrongly solving puzzle",() => {
		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,3,5,7],[2,4,6,8],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
			await instance.solve_puzzle(5,{from: accounts[1]});
		});
		describe("Fail Case", () => {
			it("Puzzle not solved", async() => {
				await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			});
		});
	});

	describe("Quiz Register",() => {
		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,1,1,1],[1,1,1,1],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
			await instance.solve_puzzle(4,{from: accounts[1]});
			await instance.solve_puzzle(4,{from: accounts[2]});
			await instance.solve_puzzle(4,{from: accounts[3]});
			await instance.solve_puzzle(4,{from: accounts[4]});
			await instance.solve_puzzle(4,{from: accounts[5]});
		});

		describe("Success Case", () => {
			it("1 person can successfully register", async () => {
				let result = await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			
			assert.equal(await instance.num_players.call(),1,"num_players=1");

			});
			
		});

		describe("Success Case", () => {
			it("4 persons can successfully register", async () => {
				await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
				await instance.pay_fee({from: accounts[2],value : web3.toWei(100, "wei")});
				await instance.pay_fee({from: accounts[3],value : web3.toWei(100, "wei")});
				await instance.pay_fee({from: accounts[4],value : web3.toWei(100, "wei")});
				// await instance.pay_fee({from: accounts[5],value : web3.toWei(100, "wei")});
			});
			
		});

		describe("Fail Case", () => {
			it("1 person cannot register twice from same account", async () => {
				await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
				await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			// try{
			// 	await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			// } catch(err)
			// {
			// 	assert.equal(
			// 			err.message,
			// 			"VM Exception while processing transaction: revert"
			// 		);
			// }
			});
			
		});

		describe("Fail Case", () => {
			it("Insufficient Fee", async () => {
				let result = await instance.pay_fee({from: accounts[1],value : web3.toWei(80, "wei")});
			});
			
		});

		// describe("Fail Case", () => {
		// 	it("Cant register after quiz ends", async () => {
		// 		const delay = ms => new Promise(res => setTimeout(res, ms));
		// 		await delay(5*1000);
		// 		let result = await instance.pay_fee({from: accounts[1],value : web3.toWei(80, "wei")});
		// 	});
			
		// });

	});
	
	describe("Reveal Questions",() => {

		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,3,5,7],[2,3,5,7],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
			await instance.solve_puzzle(4,{from: accounts[1]});
			await instance.solve_puzzle(4,{from: accounts[2]});
			await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(5*1000);
		});

		describe("Success Case", () =>{
			it("Question Revealed to registered user", async() => {
				let result=await instance.reveal_questions({from: accounts[1]});
				assert.equal(result,"sqrt of 4");
			});
		});

		describe("Fail Case", () =>{
			it("Question not Revealed to unregistered user", async() => {
				await instance.reveal_questions({from: accounts[3]});
			});
		});

	});

	describe("Submit answer 1",() => {
		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,3,5,7],[2,3,5,7],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
			await instance.solve_puzzle(4,{from: accounts[1]});
			await instance.solve_puzzle(4,{from: accounts[2]});
			await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(5*1000);
			await instance.reveal_questions({from: accounts[1]});
		});

		describe("Success Case", () =>{
			it("answer Submitted", async() => {
				await instance.answer_question_1(2,{from: accounts[1]});
			});
		});

		describe("Fail Case", () =>{
			it("cannot submit multiple times", async() => {
				await instance.answer_question_1(2,{from: accounts[1]});
				await instance.answer_question_1(2,{from: accounts[1]});
			});
		});

		describe("Fail Case", () =>{
			it("Conductor cannot submit answers", async() => {
				
				await instance.answer_question_1(2,{from: accounts[0]});
			});
		});

		describe("Fail Case", () =>{
			it("cannot submit after end time", async() => {
				const delay = ms => new Promise(res => setTimeout(res, ms));
				await delay(6*1000);
				await instance.answer_question_1(2,{from: accounts[1]});
			});
		});


	});
	
	describe("Find Winner",() => {

		let instance;
		beforeEach(async () => {
			instance = await Quiz.new(5,100,[1,1,1,1],[1,1,1,1],"sqrt of 4","Dhoni Jersey Number","Number of days in leap year","1*0",[2,7,366,0],{ from: owner });
			await instance.solve_puzzle(4,{from: accounts[1]});
			await instance.solve_puzzle(4,{from: accounts[2]});
			await instance.pay_fee({from: accounts[1],value : web3.toWei(100, "wei")});
			await instance.pay_fee({from: accounts[2],value : web3.toWei(100, "wei")});
			const delay = ms => new Promise(res => setTimeout(res, ms));
			await delay(5*1000);
			await instance.reveal_questions({from: accounts[1]});
			await instance.answer_question_1("2",{from: accounts[1]});
			await instance.answer_question_2("7",{from: accounts[1]});
			await instance.answer_question_3("365",{from: accounts[1]});

			// await delay(6*1000);
			// await instance.reveal_questions({from: accounts[1]});
			// await instance.answer_question_2("7",{from: accounts[1]});
			// await instance.answer_question_2("18",{from: accounts[2]});

			// await delay(11*1000);
			// await instance.reveal_questions({from: accounts[1]});
			// await instance.answer_question_3("365",{from: accounts[1]});
			// await instance.answer_question_3("366",{from: accounts[2]});

			// await delay(16*1000);
			// await instance.reveal_questions({from: accounts[1]});
			// await instance.answer_question_4("1",{from: accounts[1]});
			// await instance.answer_question_4("1",{from: accounts[2]});

		});
		
		describe("Success Case",() => {
			it("winner determined", async () => {
				const delay = ms => new Promise(res => setTimeout(res, ms));
				await delay(7*1000);
				let tx = await instance.get_winners(1,{
					from: owner
				});
			});
		});
		describe("Fail Case",() => {
			it("winner determined only by Conductor", async () => {
				const delay = ms => new Promise(res => setTimeout(res, ms));
				await delay(7*1000);
				let tx = await instance.get_winners(1,{
					from: accounts[1]
				});
			});
		});
	});

});