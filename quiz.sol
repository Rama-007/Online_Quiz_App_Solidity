pragma solidity ^0.4.22;
pragma experimental ABIEncoderV2;

contract quiz{
    uint private register_time;
    uint [4] public start_time;
    uint [4] public end_time;
    uint public registration_fee;
    uint public no_members;
    uint num_players;
    string private question_1;
    string private question_2;
    string private question_3;
    string private question_4;
    uint private answer_1;
    uint private answer_2;
    uint private answer_3;
    uint private answer_4;
    address conductor;
    
    mapping (address => bool) puzzle;
    mapping (address => bool) register;
    mapping(address => uint) pending_amount;
    
    event AmountCollected(address sender, uint amount);
    
    uint tfee;
    
    struct Participant{
        address account;
        bytes32 a1;
        bytes32 a2;
        bytes32 a3;
        bytes32 a4;
        uint timestamp1;
        uint timestamp2;
        uint timestamp3;
        uint timestamp4;
    }
    
    mapping (uint => Participant) players;
    mapping(address=>uint) player_index;
    
    // constructor(uint participants, uint pfee, uint [4] starttime, uint [4] endtime, string [4] questions) payable
    constructor(uint participants, uint pfee, uint [4] starttime, uint [4] endtime, string question1, string question2,string question3,string question4, uint[4] answers) payable
    {
        conductor=msg.sender;
        require(conductor.balance<0,"invalid address");
        register_time=now;
        for(uint i=0;i<4;i++)
        {
            start_time[i]=register_time+(starttime[i]*30);
            end_time[i]=register_time+(endtime[i]*30);
        }
        question_1=question1;
        question_2=question2;
        question_3=question3;
        question_4=question4;
        answer_1=answers[0];
        answer_2=answers[1];
        answer_3=answers[2];
        answer_4=answers[3];
        // question_1="Capital Of Australia";
        // question_2="3*8";
        // question_3="Dhoni's jersey Number ";
        // question_4="Kohli's jersey Number ";
        no_members=participants;
        registration_fee=pfee;
        tfee=0;
        // answer_1="canberra";
        // answer_2="24";
        // answer_3="7";
        // answer_4="18";
        num_players=0;
    }
    
    modifier onlyconductor()
    {
        require(msg.sender==conductor,"Only Conductor has access to this");
        _;
    }
    
    
    function crypto_puzzle() public view returns(string)
    {
        return "2+2";
    }
    
    function solve_puzzle(uint answer) public returns(string)
    {
        require(msg.sender!=conductor);
        require(puzzle[msg.sender]==false,"Already solved");
        if(answer==4)
        {
            puzzle[msg.sender]=true;
            return "solved_successfully";
        }
        else
        {
            return "wrong answer try again";
        }
    }
    
    function answer_question_1(string answer) public
    {
        require(players[player_index[msg.sender]].a1=="","already attempted");
        require(msg.sender!=conductor);
        require(register[msg.sender]==true,"Access Restricted");
        require(now>=start_time[0],"question_1 not yet started");
        require(now<=end_time[0],"question_1 time finished");
        players[player_index[msg.sender]].a1=keccak256(answer);
        players[player_index[msg.sender]].timestamp1=now;
    }
    
    function answer_question_2(string answer) public
    {
        require(players[player_index[msg.sender]].a2=="","already attempted");
        require(msg.sender!=conductor);
        require(register[msg.sender]==true,"Access Restricted");
        require(now>=start_time[1],"question_2 not yet started");
        require(now<=end_time[1],"question_2 time finished");
        players[player_index[msg.sender]].a2=keccak256(answer);
        players[player_index[msg.sender]].timestamp2=now;
    }
    
    function answer_question_3(string answer) public
    {
        require(players[player_index[msg.sender]].a3=="","already attempted");
        require(msg.sender!=conductor);
        require(register[msg.sender]==true,"Access Restricted");
        require(now>=start_time[2],"question_3 not yet started");
        require(now<=end_time[2],"question_3 time finished");
        players[player_index[msg.sender]].a3=keccak256(answer);
        players[player_index[msg.sender]].timestamp3=now;
    }
    
    function answer_question_4(string answer) public
    {
        require(players[player_index[msg.sender]].a4=="","already attempted");
        require(msg.sender!=conductor);
        require(register[msg.sender]==true,"Access Restricted");
        require(now>=start_time[3],"question_4 not yet started");
        require(now<=end_time[3],"question_4 time finished");
        players[player_index[msg.sender]].a4=keccak256(answer);
        players[player_index[msg.sender]].timestamp4=now;
    }
    
    
    
    function pay_fee() public payable returns(string)
    {
        require(msg.sender!=conductor);
        require(register[msg.sender]!=true, "Already Registered");
        require(num_players<no_members,"Player limit exceeded");
        require(now<=end_time[3],"Quiz finished");
        require(msg.value>=registration_fee,"Amount not sufficient");
        num_players++;
        tfee=tfee+msg.value;
        register[msg.sender]=true;
        pending_amount[msg.sender]=msg.value - registration_fee;
        player_index[msg.sender]=num_players;
        players[num_players].account=msg.sender;
    }
    
    function reveal_questions() public view returns(string)
    {
        require(register[msg.sender]==true || msg.sender==conductor,"Access Restricted");
        uint temp=now;
        // return question_1;
        require(temp>=start_time[0], "quiz not started");
        require(temp<= end_time[3],"quiz finished");
        // for(uint i=0;i<4;i++)
        // {
            if(temp>=start_time[0] && temp<=end_time[0])
            {
                return question_1;
            }
            if(temp>=start_time[1] && temp<=end_time[1])
            {
                return question_2;
            }
            if(temp>=start_time[2] && temp<=end_time[2])
            {
                return question_3;
            }
            if(temp>=start_time[3] && temp<=end_time[3])
            {
                return question_4;
            }
        // }
    }
    
    function encrytion(uint answer,uint key) private returns(uint)
    {
        return (answer**key)%10001;
    }
    
    function get_winners(uint key) public onlyconductor payable
    {
        require(now>end_time[3]);
        //Q1
        uint winner=0;
        uint i;
        uint prev=2**256 - 1;
        for(i=1;i<=num_players;i++)
        {
            if(players[i].a1==keccak256(encrytion(answer_1,key)) && players[i].timestamp1<prev)
            {
                prev=players[i].timestamp1;
                winner=i;
            }
        }
        if(winner>0)
        {
            pending_amount[players[winner].account]+=((3*tfee)/16);
        }
        //Q2
        winner=0;
        prev=2**256 - 1;
        for(i=1;i<=num_players;i++)
        {
            if(players[i].a2==keccak256(encrytion(answer_2,key)) && players[i].timestamp2<prev)
            {
                prev=players[i].timestamp2;
                winner=i;
            }
        }
        if(winner>0)
        {
            pending_amount[players[winner].account]+=((3*tfee)/16);
        }
        
        //Q3
        winner=0;
        prev=2**256 - 1;
        for(i=1;i<=num_players;i++)
        {
            if(players[i].a3==keccak256(encrytion(answer_3,key)) && players[i].timestamp3<prev)
            {
                prev=players[i].timestamp3;
                winner=i;
            }
        }
        if(winner>0)
        {
            pending_amount[players[winner].account]+=((3*tfee)/16);
        }
        
        //Q4
        winner=0;
        prev=2**256 - 1;
        for(i=1;i<=num_players;i++)
        {
            if(players[i].a2==keccak256(encrytion(answer_4,key)) && players[i].timestamp4<prev)
            {
                prev=players[i].timestamp4;
                winner=i;
            }
        }
        if(winner>0)
        {
            pending_amount[players[winner].account]+=((3*tfee)/16);
        }
        
        for(i=1;i<num_players;i++)
        {
            uint amount=pending_amount[players[i].account];
            emit AmountCollected(players[i].account,amount);
            
            if(amount>0)
            {
                pending_amount[players[i].account]=0;
                players[i].account.transfer(amount);
            }
        }
        
        selfdestruct(conductor);
    }



















    
}