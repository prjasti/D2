//Creates random problems, checks answers to them
/*

Name: Elijah Thorpe (and Prahlad Jasti a bit at the bottom)
Course: CSE
Project: Software design project
Purpose: All of the javascript for the practice page. functionthing() is the main function, being a splitter for everything.
		Most of the other descriptions are a bit further down in the other questions

*/
///////
//To People coming here for minor tweaks to the interface
///////
/*
Ok, so if you want to change the name of a question, look for it in the variable diffNames
If you want to change the options of a question (higher or lower range), look at diffs for that...
You can find out what the function is by looking at newQ to see where that points, then find where that splitter points to
*/
//mathjs is imported as math in practice.html, but that should be fine
//el.innerHTML = math.sqrt(9);
//Ok, so how all of this code works:
//functionthing()[named by Andrew when showing how onclick worked] is the main function, when the submit button is pressed
	//If the question hasn't already been answered, it will call checkAns(), which will check the answer against the variable (string or int) currentAns
	//If the question has already been answered, newQ() is called
//newQ() looks at what the dropdowns are, and then will call the corresponding function (so just put some function in there), given the difficutly as an argument
//That function will look at the difficutly, and then call a question generating function
//The function will generate a question, set currentAns to the new answer, and call ask(text, latex)
//ask(text, latex) will set the question's text to the first argument ('What does this equal?'), and set the math expression to the second argument ('2^{3}')

//Other stuff to look at for adding new questions is diffNames, which is used to make the dropdowns
//So, in the lesson select element, you will have an option with the value, for exampe, "maths"
//Then, in diffNames, you would set diffNames["maths"] to ["easy maths","medium maths", "hard maths"]
//Then, when "maths" is selected, the difficulty dropdown will switch to that list
//But make sure that you still set newQ() to have a check of type=="maths" to call the doMaths(diff) function
//This is so amusing to write pseduocode for.
var response=document.getElementById("response");
var x=0;//Used for saying 'Maybe you should go to a higher difficulty'
var currentAns='';
var answered=true;
var strike=false;
var entry_text="";
var qType="";
var rat=false;//should answer checker try to order it(some things will cause errors)
var start_diff=1;
var old_diff=1;
/////
//Difficulty settings
/////
var sTrig=['sin','cos'];//The ones that can actually be used now
var nTrig=['sin','cos','tan'];
var rTrig=['csc','sec','cot'];
var inTrig=['arcsin','arccos','arctan'];
var irTrig=['arccsc','arcsec', 'arccot'];
var allTrig=nTrig.concat(rTrig, inTrig, irTrig);
var diffs=[];
diffs["derivative"]=[
	[5,5,false],[5,5,true],[10,10,true],//Introduction Derivative questions
	[2,1,5], [3,2,5], [4,5,10], //Polynomial difficulty levels
	[1,1,1,sTrig], [2,2,2,sTrig], [3,3,sTrig]//The trig difficulty levels
];
diffs["tangent"]=[[2,1,5,3],[3,2,5,10]]; 
diffs["integral"]=[[2,2,3,5,30],[3,2,3,5,30],[3,5,4,5,35],//Riemann sums
				[2,1,5],[3,2,5],[4,5,10]];//reverse power rule
diffs["limit"]=[[2,2,5,5,5,false],[3,3,5,5,5,true],[4,4,5,5,5,true],//hole finding
	10, [2,1,5,5,5],[3,2,5,10,10],//Left and right limits
	[2,2,5,5,5,false],[3,3,5,5,5,true],[4,4,5,5,5,true],//algebraic limmits
	[2,1,1],[3,2,5],[4,5,5]];//limits at infinity
var diffNames=[];
diffNames['derivative']=["Easy Introduction Derivative","Normal Introduction Derivative","Hard Introduction Derivative",
						"Easy Power Rule","Normal Power Rule","Hard Power Rule",
						"Easy Trigonometry","Normal Trigonometry","Hard Trigonometry"];
						//Is it bad that I needed to look up what "Trig" was short for?
diffNames['tangent']=["Easy Polynomial","Hard Polynomial"];
diffNames['integral']=["Easy Riemann Sum","Medium Riemann Sum","Hard Riemann Sum",
						"Easy Reverse Power Rule","Medium Reverse Power Rule","Hard Reverse Power Rule"];
diffNames['limit']=["Easy Hole","Medium Hole","Hard Hole",
					"Easy Sided Limit","Medium Sided Limit","Hard Sided Limit",
					"Easy Algebraic Limit","Medium Algebraic Limit","Hard Algebraic Limit",
					"Easy Limit At Infinity","Medium Limit At Infinity", "Hard Limit At Infinity"];
//////
//Startup stuff
//////
var page=document.getElementById("problem");
var loadFunc = function(){
	//console.log("test");
	var query=window.location.search.substring(1);//Based off of an example I found online, this will give me a string to use
	var vars=query.split("&");
	var welcome=document.getElementById("welcome-text");
	//var start_diff=1;
	for(var v=0; v<vars.length; v++){
		var stuff=vars[v].split("=");
		if(stuff[0]=="type"){
			if(stuff[1]=="derivative"){
				qType="derivative";
				welcome.innerHTML="Now that you've learned derivatives, practice your skills with these problems";
			}
			else if(stuff[1]=="integral"){
				qType="integral";
				welcome.innerHTML="Now that you've learned integrals, practice your skills with these problems";
			}
			else if(stuff[1]=="tangent"){
				qType="tangent";
				welcome.innerHTML="Now that you've learned tangent lines, practice your skills with these problems";
			}
			else if(stuff[1]=="limit"){
				qType="limit";
				welcome.innerHTML="Now that you've learned limits, practice your skills with these problems";
			}
		}
		if(stuff[0]=="difficulty"){
			var t=Number(stuff[1]);
			if(!isNaN(t)){//Check that t is actually a number
				start_diff=t;
			}
		}
	}
	//console.log(qType);
	//console.log(start_diff);
	if(qType!=""){
		document.getElementById("type").value=qType;
		//document.getElementById("type").onload=
		setDropdown(document.getElementById("type"), qType);

		//document.getElementById("type").onload=function(){document.getElementById("type").value=qType;};
		document.getElementById("difficulty").value=start_diff;
		setDropdown(document.getElementById("difficulty"), start_diff);
		//document.getElementById("difficulty").onload=function(){document.getElementById("difficulty").value=start_diff;};
		newQ();
		//console.log("test");
	}
};
function setDropdown(dropdown, val){
	//console.log("test");
	//var instance = M.Dropdown.getInstance(dropdown);
	//instance.open();
	//instance.close();
	var found=false;
	var index;
	for(var i=0;i<dropdown.options.length&&!found; i++){
		//console.log("test"+i);
		//console.log(dropdown.options[i].value);
		//console.log(val);
		//console.log(dropdown.options[i].value==val);
		if(dropdown.options[i].value==val){
			//console.log("found");
			dropdown.selectedIndex=i;
			var opt=dropdown.options[i];
			opt.selected=true;
			index=i;
			found=true;
			//dropdown.remove(i);
			//dropdown.add(opt, i);
			//dropdown.click();


			//return;
		}
	}
	//Ok, so all of this code is a workaround to materialze
	//Pretty much, I need to find the list item that has the span inside with the right lable, and then change it's class, while reseting the other classes
	var parent=dropdown.parentElement;
	//console.log(parent);
	//var el=parent.querySelector(".dropdown-content");
	var e2=parent.querySelector(".dropdown-trigger");
	e2.click();//Yes, this is the best way to do this. Materialize has no real javasript API
	var e3=M.Dropdown.getInstance(e2);
	e3.close();
	/*//console.log(el);
	var temp=el.firstElementChild;
	//console.log(temp);
	while(temp!=null){
		var inside=temp.firstElementChild;
		//console.log(temp);
		temp.class="";
		var text=inside.innerHTML;
	//console.log(temp.class);
	//console.log(text);
	//console.log(dropdown.options[index].text);
	//console.log(text==dropdown.options[index].text)
		if(text==dropdown.options[index].text){
			temp.class="active selected";//Materialize's selected class
		//console.log(temp.class);
		}
		temp=temp.nextElementSibling;
		//console.log(temp);
	}
	//console.log("called");*/
}
//document.getElementById("type").onload=setTimeout(document.getElementById("type").style="visibility: visible", 30000)
function updateDropdowns(){
	var type=document.getElementById("type").value;
	//console.log(type);
	//var options=diffs[type].length;
	//console.log(options);
	var diffDrop=document.getElementById("difficulty");
	/*if(options==oldMaxDiff){//No options need to be added or removed
	//console.log("fine");
		return;
	}*/
	/*else if(options>oldMaxDiff){//Need to add options
	//console.log("Adding");
	var options=diffs[type].length;
	//console.log(options);
	var diffDrop=document.getElementById("difficulty");
	if(options==oldMaxDiff){//No options need to be added or removed
		//console.log("fine");
		return;
	}
	else if(options>oldMaxDiff){//Need to add options
		//console.log("Adding");
		for(var i=oldMaxDiff+1; i<=options; i++){//Add some options
			var option=document.createElement("option");
			option.text=i;
			option.value=i;
			diffDrop.add(option);
			//console.log(option);
		}
	}
	else{//need to remove options
		//console.log("removing");
		for(var i=oldMaxDiff; i>options; i--){//remove some options
			diffDrop.remove(i-1);//Remove the option at index i-1, so i=4 would remove index 3 (which would be '4')
		}
	}
	oldMaxDiff=options;*/
	while(diffDrop.options.length>0){
		diffDrop.remove(0);
	}
	for(var i=0;i<diffNames[type].length; i++){
		var option=document.createElement("option");
		option.text=diffNames[type][i];
		option.value=i+1;
		diffDrop.add(option);
	}
	$('#difficulty').formSelect();
}
//window.onload=setTimeout(loadFunc, 2000);
MathJax.Hub.Register.StartupHook("End", loadFunc);//Wait for MathJax to finish starting up
document.getElementById("type").addEventListener("change",updateDropdowns());
setTimeout(document.getElementById("type").addEventListener("change",function(){updateDropdowns()}), 100000000);//I should not have to do this, but materialize is evil
//document.getElementById("type").addEventListener("change",console.log("test"));
//////
//Questions
//////
function functionthing() {
	var ans=document.getElementById("input-answer").value;
	if(entry_text!=""){
		ans=entry_text.replace(/\[/g,"(").replace(/\]/g,")");//The /[stuff]/g makes it replace all, not just the first instance. Replaces [ and ] with ( and ), which used to be used for internal workings of fractions
	}
	try{
		var correct=checkAns(ans);
		if(answered){
			newQ();
		}
		else if(correct){
			if((x>5&&diffNames[qType][old_diff-1].startsWith("Easy"))||(x>10&&diffNames[qType][old_diff-1].startsWith("Medium"))){
				reply("Great job! Why don't you try a higher difficulty?");
			}
			else{
				reply("Great!");//+x.toString());
			}
			answered=true;
			x++;
		}
		else{
			reply('Aww...');
			x=0;
		}

	}
	catch(err){
		reply("There was an error with your input, check for empty or unclosed parentheses, implicit multiplication, and characters that don't make sense being there.");
		response.style.color = "#f00";
		response.style.font_weight="bold";
	}
}
function wrongResponse(){
	//Goes through and comes up with a better response to a wrong answer than "Aww..."
	var r="Incorrect<br>";
	if(qType=="der"){
		var responses=["Did you remember the power rule?","Check you work and try again.","You can do it!"];//I can't come up with any other response
		var a=Math.floor((Math.random()*responses.length))
		r+=responses[a];
	}
	else if(qType=="int"){
		//if()
	}
	reply(r);
}
function newQ(){
	if(!answered && !strike){
		var b=document.getElementById("new-question");
		b.innerHTML="Are you sure?";
		strike=true;
	}
	else{
		var type=document.getElementById("type").value;
		if(qType!=type){
			x=0;
			qType=type;
		}
		var diff=document.getElementById("difficulty").value;
		if(old_diff!=diff){
			x=0;
			old_diff=diff;
		}
		if(type=="derivative"){
			der(diff);
		}
		else if(type=="integral"){
			intQ(diff);
		}
		else if(type=="tangent"){
			t_l(diff);
		}
		else if(type=="limit"){
			limitQ(diff);
		}
		strike=false;
		var b=document.getElementById("new-question");
		b.innerHTML="New Question";
	}
}
function ask(question, expression){
	var q=document.getElementById("question");
	//console.log(question);
	//console.log(expression);
	//var e=document.getElementById("expression");
	q.innerHTML=question;
	//e.innerHTML=expression;
	var m=MathJax.Hub.getAllJax("expression")[0];
	MathJax.Hub.Queue(['Text',m, expression]);
	reply("");
	var ans=document.getElementById("input-answer");
	ans.value="";
	answered=false;
	entry_text="";
	var l=MathJax.Hub.getAllJax("final-entry")[0];
	MathJax.Hub.Queue(['Text',l,entry_text]);
	hideGraph();
}
function reply(text){
	if(text==""){
		text="<br>";
	}
	var response=document.getElementById("response");
	response.innerHTML=text;
	response.style.color = "#000";
}
function checkAns(ans){
	//This is going to have its own difficulties:
	//mathjs doesn't reorder terms, at all, so I need to figure out how to make x+1=1+x
	if (ans==currentAns){
		return true;
	}
	else if(['DNE','infty','-infty'].includes(currentAns)){
		return false;//math.simplify("DNE") or any othe string without numbers gives 0, so need to check for this
	}
	else if(ans.search(/[0-9x]/i)==-1){//If we are looking for something besides a string, check that it won't confuse mathjs
		return false;
	}
	//else if(math.equal(math.simplify(ans),math.simplify(currentAns))){
	//	return true;
	//}
	else{
		//reply(2);
		var a=math.simplify(ans);//really roundabout way to do this, simplify() simplifies it and rationalize() as a side effect puts it in normal order
		var b=math.simplify(currentAns);
		if(rat){
			a=math.rationalize(a);
			b=math.rationalize(b);
		}
		if(a.toString()==b.toString()){
			return true;
		}
		//var a=math.compareNatural(math.simplify(ans),math.simplify(currentAns));
		//reply(a);
		
	}
	//reply(3);
	//reply(math.compare(math.simplify(ans),math.simplify(currentAns)));
	//reply(math.format(math.simplify(currentAns));
	return false;
}

function der(diff){
	//I fell bad hardcoding this, but I don't know how to do it in js
	var derDiffs=diffs["derivative"];
	var d=derDiffs[diff-1];
	if(diffNames['derivative'][diff-1].endsWith("Introduction Derivative")){//The trinomial questions
		simpleDerivative(d[0],d[1],d[2]);
		rat=true;
	}
	if(diffNames['derivative'][diff-1].endsWith("Power Rule")){//The polynomial trig questions
		newDerivative(d[0],d[1],d[2]);
		rat=true;
	}
	if(diffNames['derivative'][diff-1].endsWith("Trigonometry")){//The trig questions have 4 parts of data
		newTrigDerivative(d[0],d[1],d[2],d[3]);
		rat=false;
	}
}
function newDerivative(terms, maxPow, maxCo, test=false){
	var q="What is the derivative of the following?";
	var e="\\frac{d}{dx}(";//The part to print
	var simple="";//The one to be used to make the answer
	//Ok, going to rethink this:
	//If there are more possible powers than terms, make terms that are to a random power in the range with a random coefficient, check that isn't already used (delete terms from list, probably)
		//Then, go through and put them in a reasonable order, to not confuse people
		//Much better than just generating random numbers and checking that it isn't already used
	//If there are more or equal terms than possible powers, make a random coefficient for each power, number of terms doesn't matter
	//Also, posible powers=maxpow+1;
	poly=makePolynomial(terms, maxPow, maxCo, test);
	if(test){
		for(var i=0; i<poly[2][0].length; i++){
			//console.log(poly[2][0][i]);
		}
		//console.log("pows:");
		for(var i=0; i<poly[2][1].length; i++){
			//console.log(poly[2][1][i]);
		}
	}
	e+=poly[0];
	simple+=poly[1];
	var ans;
	if(simple.includes("x")){
		ans=math.rationalize(math.derivative(simple, "x")).toString();
	}
	else{
		ans="0";//Pretty much, mathjs will break if x isn't actually in it, but since this is dx if there isn't x the derivative should be 0 (for now...)
	}
	currentAns=ans;
	e+=")=?";
	ask(q, e);

	/*var cos=[];//May want to make this an associative array, but not sure if I have time to do that right now
	var pow=[];
	if((maxPow+1)<terms){
		terms=maxPow+1;//If the higest power is x^4, you can't have 6 terms. 1+x+x^2+x^3+x^4 is 5 terms
	}
	for(var i=0; i<terms; i++){//Should add in some logic to stop repeat powers
		var c=(Math.random()*maxCo)+1;
		var p=(Math.random()*(maxPow+1));

	}*/
}
function newTrigDerivative(maxTCo, maxXCo, maxXPow, diff){
	var q="What is the derivative of the following?";
	var e="\\frac{d}{dx}(";
	var simple="";
	var trig=trig_term(maxTCo, maxXCo, maxXPow, diff);
	e+=trig[1];
	simple+=trig[0];
	e+=")=?";
	var ans=0;
	//console.log(simple);
	if(simple.includes("x")){
		ans=math.derivative(simple,"x").toString();
	}
	currentAns=ans;
	ask(q,e);
}
function simpleDerivative(maxXCo, maxCons, squared=false){
	var q="What is the derivative of the following?";
	//questions in the form of (x^2?) + ax + b
	//squared true-> x^2 can be there (probably like a 50% chance)
	//a is in range [-maxXCo, maxXCo]
	//b is in range [-maxCons, maxCons]
	var e="\\frac{d}{dx}(";
	var simple="";
	var s=false;
	if(squared&&Math.random()>=0.5){
		simple+="x^2";
		e+="x^{2}";
		s=true;
	}
	var a=Math.round(Math.random()*maxXCo);
	if(Math.random()>=0.5){a=-a;}
	var b=Math.round(Math.random()*maxCons);
	if(Math.random()>=0.5){b=-b;}
	if(a==-1){
		e+="-x";
		simple+="-x";
	}
	else if(a==1){
		if(s){
			e+="+";simple+="+";
		}
		e+="x";
		simple+="x";
	}
	else if(a!=0){
		if(s){
			e+="+";simple+="+";
		}
		e+=a+"x";
		simple+=a+"x";
	}
	if(b<0){
		e+=b; simple+=b;
	}
	else if(b!=0){
		if(a!=0||s){//something before it to make the + make sense
			e+="+"; simple+="+";
		}
		e+=b;
		simple+=b;
	}
	else if(a==0&&!s){//At least print *something*
		e+="0";
		simple+="0";
	}
	e+=")";
	var ans;
	if(simple.includes("x")){
		ans=math.derivative(simple, "x").toString();
	}
	else{
		ans=0;
	}
	currentAns=ans;
	ask(q, e);
}
function t_l(diff){
	//makes a new tangent line problem, from just the difficulty
	var tlDiffs=diffs["tangent"];
	var d=tlDiffs[diff-1];
	tangent_slope(d[0],d[1],d[2],d[3]);
	rat=true;
}
function tangent_slope(terms, maxPow, maxCo, maxX){
	var q="What is the slope of the following equation at x=";
	var e="f(x)=";
	var simple="";
	poly=makePolynomial(terms, maxPow, maxCo, true);
	e+=poly[0];
	simple+=poly[1];
	var xVal=Math.round((Math.random()*maxX*2)-maxX);//If I am correct, this gives a random number [-maxX, maxX], and rounds it to an integer
	//needs to be "xVal" because of how mathjs works
	var ans;
	if(simple.includes("x")){
		ans=math.derivative(simple, "x").toString();
		ans=math.eval(ans, {x:xVal});
	}
	else{
		ans=0;
	}
	q+=xVal+"?";
	ask(q,e);
	currentAns=ans;
	setPolyGraph(poly[2][1],poly[2][0]);
}
function intQ(diff){
	var intDiffs=diffs["integral"];
	var d=intDiffs[diff-1];
	if(diffNames['integral'][diff-1].endsWith("Power Rule")){
		newIntegral(d[0],d[1],d[2]);
		rat=true;
	}
	else if(diffNames['integral'][diff-1].endsWith("Sum")){
		riemannSum(d[0],d[1],d[2],d[3],d[4]);
		rat=true;
	}
}
function newIntegral(terms, maxPow, maxCo){//yeah, mathjs doesn't have a function for this
	//Yeah, this will be pretty much the same thing...
	var latex="\\int(";
	var simple="";
	var poly=makePolynomial(terms, maxPow, maxCo, true);
	latex+=poly[0];
	simple+=poly[1];
	latex+=")dx";
	raw=poly[2];
	ans=integrate(raw[0],raw[1], true);
	currentAns=ans;
	ask("Evaluate the following integral:",latex);
}
function newTrigIntegral(maxTCo, maxXCo, maxXPow, trig=nTrig){
	var latex="\\int(";
	var simple="";
	var t=trig_term(maxTCo, maxXCo, maxXPow, trig, true);
	latex+=t[1];
	simple+=t[0];
	latex+=")dx";
	raw=t[2];
	ans=integrateTrig(raw[0], raw[1],raw[2],raw[3]);
	currentAns=ans;
	ask("Evaluate the following integral:",latex);
}
function riemannSum(terms, maxPow, maxCo, maxX, maxY){
	//Yeah, I'm not coding this now, but I will plan it out:
	//Ok, so make a polynomial
	//Check that over the range it stays within the y scale
	//Generate an upper and lower bound within the x range
	//Generate a number of rectangles
	//Sum all the rectangle parts
	var poly=makePolynomial(terms, maxPow, maxCo, true);
	var cont=true;
	var tries=0;
	while(cont){//Check that the function is valid
	//console.log("y");
		cont=false;
		for(var x=-maxX; x<=maxX; x++){
			if(Math.abs(math.eval(poly[1],{x:x}))>maxY){//check that the value is within the vaild range
				cont=true;
			//console.log(x);
			}
		}
		if(cont){
			poly=makePolynomial(terms, maxPow, maxCo,true);//If it isn't, make a new polynomial
		}
		tries++;
	//console.log(poly[1]);
		if(tries>1000){
			relpy("A problem occured with the random quesion generator. If you can, please report this bug on the about page.")
			return;
		}
	}
	cont=true;
	var left; var right;
	while(cont){//generate the left and right bounds
	//console.log("bounds");
		var a; var b;
		a=Math.round(Math.random()*maxX);
		b=Math.round(Math.random()*maxX);
		if(Math.random()>=0.5){a=-a;}
		if(Math.random()>=0.5){b=-b;}
		if(a>b){
			left=b;
			right=a;
			cont=false;
		}
		else if(a<b){
			left=a;
			right=b;
			cont=false;
		}
	}
	/*var rects;
	var width;
	cont=true;
	while(cont){//Check that the rectangles aren't too small
	//console.log("rects")
		rects=Math.floor(Math.random()*maxRect)+1;
		var size=right-left;
		width=size/rects;
		if(width>=minSize){
			cont=false;
		}
	}*/
	var width=1;//In case I ever want to add more rectangles
	var rects=(right-left)/width;
	var side=Math.floor(Math.random()*2);//0-left, 1-right
//console.log(side);
//console.log(left);
	var pside=['left','right'][side];
	var ans=0;
	for(var r=0; r<rects; r++){
		var x=left+width*(r+side);
		var y=math.eval(poly[1], {x:x});
		var size=y*width;
		ans+=size;
	//console.log(x);
	//console.log(typeof x);
	//console.log(y);
	//console.log(size);
	}
	currentAns=ans;
	ask("Calcualte the "+pside+" Riemann sum of the following function from "+left+" to "+right+" with "+rects+" rectangle(s).",poly[0]);
	//MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
	setPolyGraph(poly[2][1],poly[2][0]);
}
function integrate(pows, cos, con=false){//one thing mathjs doesn't have that we need is integration, so this will handle the simple rule for it
	var simple="";//This doesn't make latex right now, but I could easily edit it to do that
	for(var i=0; i<pows.length; i++){
		var c=cos[i];
		var p=pows[i];
		p++;
		simple+="("+c+"/"+p+")";
		if(p==1){
			simple+="x";
		}
		else if(p>1){
			simple+="x^"+p;
		}
		if(i+1!=pows.length){
			simple+="+";
		}
	}
	if(con){
		simple+="+c";
	}
	return simple;
}
function integrateTrig(tCo, trig, xCo, xPow){
	//console.log("Not finishing this now...");
	return 1;//so that it won't crash, at least...
	//Going to start coding this now, but am going to have to leave in a bit
	//Hopefully I will remember to push this code later
	//pseudocode:
	//Oh, great, this is going to need a different random trig generator, to make it work nicely (no integration by parts)
	//Ok, so the random trig will make it so that it works out somewhat nicely
	//So do reverse power rule with the coefficient
	//Do the integration of the trig function
	//And print it nicely
	//Yeah, most of the work is going to need to be making the random trig generator
	//Might just want to generate a trig function, and then find the derivative of that (and print it nicely)
	//Yeah, do that
}
function limitQ(diff){
	var d=diffs["limit"][diff-1];
	if(diffNames['limit'][diff-1].endsWith("Hole")){
		simpleVisualLimit(d[0],d[1],d[2],d[3],d[4],d[5]);
		rat=true;
	}
	else if(diffNames['limit'][diff-1]=="Easy Sided Limit"){//I feel bad hardcoding this...
		sidedLimitQuestionAbs(d);//Yeah, these problems aren't that complicated
		rat=true;
	}
	else if(diffNames['limit'][diff-1].endsWith("Sided Limit")){
		sidedLimitQuestionPoly(d[0],d[1],d[2],d[3],d[4]);
		rat=true;
	}
	else if(diffNames['limit'][diff-1].endsWith("Algebraic Limit")){
		algebraicLimit(d[0],d[1],d[2],d[3],d[4],d[5]);
		rat=true;
	}
	else if(diffNames['limit'][diff-1].endsWith("At Infinity")){
		infinLimit(d[0],d[1],d[2]);
	}
}
function simpleVisualLimit(maxNum,maxDen, maxXPow, maxXCo, maxCons, neg=false){
	/*var nums=[];
	var usedMaxNum=Math.floor(Math.random()*maxNum)+1;
	//var type=Math.floor(Math.random()*3);//So, I remember 3 ways this can go:
											//0-no place where it is undefined
											//1-hole
											//2-jump, with an asymtote
	var type=1;//just going with hole problems, later on I can remove/move around the other code
	for(var i=0;i<usedMaxNum-1; i++){
		var num=generate_factored_part(maxXPow, maxXCo, maxCons, neg);
		nums.push(num);
	}
	if(type==1){
		if(!nums.some(function(n){
			return !isNaN(n[2][3]);//If all of them don't have a real 0
		})){
			var genning=true;
			while(genning){
				var num=generate_factored_part(maxXPow, maxXCo, maxCons, neg);
				if(!isNaN(num[2][3])){
					nums.push(num);
					genning=false;
				}
			}
		}
		else{
			nums.push(generate_factored_part(maxXPow, maxXCo, maxCons, neg));
		}
	}*/
	/*else{
		nums.push(generate_factored_part(maxXPow, maxXCo, maxCons, neg));
	}*//*
	var dens=[];
	var usedMaxDen=Math.floor(Math.random()*maxDen)+1;
	var hole_index=Math.floor(Math.random()*usedMaxDen);
	for(var i=0; i<usedMaxDen; i++){
		var genning=true;
		while(genning){
			var den=generate_factored_part(maxXPow, maxXCo, maxCons, neg);*/
			/*if(type==0){
				if(!isNaN(den[2][3])){//Not 0 over all reals
					dens.push(den);
					genning=false;
				}
			}
			else if(type==1){*//*
				var good_nums=nums.filter(function (n){
						return !isNaN(n[2][3]);
					})
				if(i==hole_index){
				//console.log(good_nums);
					var index=Math.floor(Math.random()*good_nums.length);
					dens.push(good_nums[index]);
				//console.log(good_nums[index]);
				//console.log(dens[i]);
					genning=false;
				}
				else if(!good_nums.some(function(n){
					return n[2][3]==den[2][3]&&!isNaN(n[2][3]);//There isn't another hole
				})){
					dens.push(den);
					genning=false;
				}*/
			/*}
			else if(type==2){
				if(!nums.some(function (n){
					return den[2][3]==n[2][3]&&!isNaN(den[2][3]);//Isn't a hole
				})){
					if(i+1==usedMaxDen&&!dens.some(function (d){return !isNaN(d[2][3])})){//Check that there is at least one asymptote
						if(!isNaN(den[2][3])){
							dens.push(den);//This one has an asymptote, push it
							genning=false;
						}
					}
					else{
						dens.push(den);
						genning=false;
					}
				}
			}*//*
		}
	}
	//console.log(nums);
	//console.log(dens);
	var simple="";
	var latex="\\frac{";
	for(var i=0; i<usedMaxNum; i++){
		simple+=nums[i][0];
		latex+=nums[i][1];
		if(i+1<usedMaxNum){
			simple+="*";
			latex+="\\times";
		}
	}
	simple+="/";
	latex+="}{";
	for(var i=0;i<usedMaxDen; i++){
		simple+=dens[i][0];
		latex+=dens[i][1];
		if(i+1<usedMaxDen){
			simple+="*";
			latex+="\\times";
		}
	}
	//Wait a second... I don't actually need 'simple' for this one... Sigh...
	latex+="}";*/
	var lim=makeLimitFunction(maxNum, maxDen, maxXPow, maxXCo, maxCons, neg, 1);
	var dens=lim[3]
	var latex=lim[1];
	var hole_index=lim[4];
	var ans=dens[hole_index][2][3];
	//console.log(hole_index);
	//console.log(dens);
	currentAns=ans;
	ask("Where is there a hole in this function?",latex);
	var nPows=[]; var nCons=[]; var nCos=[];
	var dPows=[]; var dCons=[]; var dCos=[];
	for(var i=0; i<dens.length; i++){
		dPows.push(dens[i][0]);
		dCos.push(dens[i][1]);
		dCons.push(dens[i][2]);
	}
	var nums=lim[2];
	for(var i=0; i<nums.length; i++){
		nPows.push(nums[i][0]);
		nCos.push(nums[i][1]);
		dCons.push(nums[i][2]);
	}
	//Something to graph simple
	setFracGraph(nCos, nPows, nCons, dCos, dPows, dCons);
}
function makeLimitFunction(maxNum,maxDen, maxXPow, maxXCo, maxCons, neg=false, type=-1){
	var nums=[];
	var usedMaxNum=Math.floor(Math.random()*maxNum)+1;
	//var type=Math.floor(Math.random()*3);//So, I remember 3 ways this can go:
											//0-no place where it is undefined
											//1-hole
											//2-jump, with an asymtote
	if(type==-1){
		type=Math.floor(Math.random()*3);
	}
	for(var i=0;i<usedMaxNum-1; i++){
		var num=generate_factored_part(maxXPow, maxXCo, maxCons, neg);
		nums.push(num);
	}
	if(type==1){
		if(!nums.some(function(n){
			return !isNaN(n[2][3]);//If all of them don't have a real 0
		})){
			var genning=true;
			while(genning){
				var num=generate_factored_part(maxXPow, maxXCo, maxCons, neg);
				if(!isNaN(num[2][3])){
					nums.push(num);
					genning=false;
				}
			}
		}
		else{
			nums.push(generate_factored_part(maxXPow, maxXCo, maxCons, neg));
		}
	}
	else{
		nums.push(generate_factored_part(maxXPow, maxXCo, maxCons, neg));
	}
	var dens=[];
	var usedMaxDen=Math.floor(Math.random()*maxDen)+1;
	var hole_index=Math.floor(Math.random()*usedMaxDen);
	for(var i=0; i<usedMaxDen; i++){
		var genning=true;
		while(genning){
			var den=generate_factored_part(maxXPow, maxXCo, maxCons, neg);
			if(type==0){
				if(!isNaN(den[2][3])){//Not 0 over all reals
					dens.push(den);
					genning=false;
				}
			}
			else if(type==1){
				var good_nums=nums.filter(function (n){
						return !isNaN(n[2][3]);
					})
				if(i==hole_index){
				//console.log(good_nums);
					var index=Math.floor(Math.random()*good_nums.length);
					dens.push(good_nums[index]);
				//console.log(good_nums[index]);
				//console.log(dens[i]);
					genning=false;
				}
				else if(!good_nums.some(function(n){
					return n[2][3]==den[2][3]&&!isNaN(n[2][3]);//There isn't another hole
				})){
					dens.push(den);
					genning=false;
				}
			}
			else if(type==2){
				if(!nums.some(function (n){
					return den[2][3]==n[2][3]&&!isNaN(den[2][3]);//Isn't a hole
				})){
					if(i+1==usedMaxDen&&!dens.some(function (d){return !isNaN(d[2][3])})){//Check that there is at least one asymptote
						if(!isNaN(den[2][3])){
							dens.push(den);//This one has an asymptote, push it
							genning=false;
						}
					}
					else{
						dens.push(den);
						genning=false;
					}
				}
			}
		}
	}
	//console.log(nums);
	//console.log(dens);
	var simple="";
	var latex="\\frac{";
	for(var i=0; i<usedMaxNum; i++){
		simple+=nums[i][0];
		latex+=nums[i][1];
		if(i+1<usedMaxNum){
			simple+="*";
			latex+="\\times";
		}
	}
	simple+="/";
	latex+="}{";
	for(var i=0;i<usedMaxDen; i++){
		simple+=dens[i][0];
		latex+=dens[i][1];
		if(i+1<usedMaxDen){
			simple+="*";
			latex+="\\times";
		}
	}
	//Wait a second... I don't actually need 'simple' for this one... Sigh...
	latex+="}";
	return [simple, latex, nums, dens, hole_index];
}
function sidedLimitQuestionPoly(terms, maxPow, maxCo,maxX, maxY){
	//So, it will make 2 polynomials, so the first 3 arguments make that.
	//maxX is how far from x=0 the point it is asking about can be
	//maxY is how far from y=0 the graph will go around where it is asking about
	if(maxX<1){
		reply("Sorry about this. Something broke in the question generator.<br>Please report this on the about page, saying what question you are doing.");
	}
	var x=Math.round(Math.random()*maxX);
	if(Math.random()>=0.5){x=-x;}
	var left=makePolynomial(terms, maxPow, maxCo);
	var tries=0;
//console.log("test");
	while(Math.abs(math.eval(left[1], {x:x}))>maxY){
		left=makePolynomial(terms, maxPow, maxCo);
		tries++;
		if(tries>100){//By then, something is wrong with the code, so this should stop it very obviously
			//x=y;//y is undefined, so it will make it clear that it is broken
			//reply("Sorry about this. Something broke in the question generator.<br>Please report this on the about page, saying what question you are doing.");
			//console.log("Dump for reporting this problem:");
			//console.log("Side: left");
			//console.log("x:"+x);
			sidedLimitQuestionPoly(terms, maxPow, maxCo, maxX-1, maxY);
			return "";
		}
	}
//console.log(left);
	var right=makePolynomial(terms, maxPow, maxCo);
	tries=0;
	while(Math.abs(math.eval(right[1],{x:x}))>maxY){
		right=makePolynomial(terms, maxPow, maxCo);
		tries++;
		if(tries>100){
			//reply("Sorry about this. Something broke in the question generator.<br>Please report this on the about page, saying what question you are doing.");
			//console.log("Dump for reporting this problem:");
			//console.log("Side: right");
			//console.log("x:"+x);
			sidedLimitQuestionPoly(terms, maxPow, maxCo, maxX-1, maxY);
			return"";
		}
	}
	var leftVal=math.eval(left[1],{x:x});
	var rightVal=math.eval(right[1],{x:x});
	var middle=Math.round(Math.random()*maxY);
	if(Math.random()>=0.5){middle=-middle;}
	while(middle==leftVal||middle==rightVal){
		middle=Math.round(Math.random()*maxY);
		if(Math.random()>=0.5){middle=-middle;}
	}
	var side;
	var used;
	if(Math.random()>=0.5){
		side="left";
		used=left;
	}
	else{
		side="right";
		used=right;
	}
	var latex="f(x) = \\begin{cases}\n";
	latex+=left[0]+"& \\text{if } x<"+x+"\\\\\n";//latex wants \\ and then a new line, so it needs to be \\\\\n
	latex+=middle+"& \\text{if } x="+x+"\\\\\n";
	latex+=right[0]+"& \\text{if } x>"+x+"\n";
	latex+="\\end{cases}";
	var ans=math.eval(used[1],{x:x});
	currentAns=ans;
	ask("What is the value of the following equation as x approaches "+x+" from the "+side+" side?", latex);
}
function sidedLimitQuestionAbs(maxXCo){
	var xCo=Math.floor(Math.random()*maxXCo)+1;
	if(Math.random()>=0.5){xCo=-xCo;}
	var side;
	var ans;
	if(Math.random()>=0.5){
		side="left";
		ans=-Math.abs(xCo);
	}
	else{
		side="right";
		ans=Math.abs(xCo);
	}
	currentAns=ans;
	var latex="f(x) = \\frac{|";
	if(Math.abs(xCo)>1){
		latex+=xCo;
	}
	else if(xCo=-1){
		latex+="-";
	}
	latex+="x|}{x}";
	ask("What is the value of the following function as x approaches 0 from the "+side+" side?",latex);
	setAbsGraph(xCo,1);
}
function algebraicLimit(maxNum,maxDen, maxXPow, maxXCo, maxCons, neg=false){
	var lim=makeLimitFunction(maxNum, maxDen, maxXPow, maxXCo, maxCons, neg);
	var latex=lim[1];
	var ns=lim[2];
	var num=[];
	for(var i=0; i<ns.length; i++){
		num.push(ns[i][0]);//the normal string part of it
	}
	num=num.join("*");
	var ds=lim[3];
	var den=[];
	for(var i=0; i<ds.length; i++){
		den.push(ds[i][0]);
	}
	den=den.join("*");
	var x;//Great, I need to make this...
	if(math.random()<0.2){//20% chance of just some random point in the range
							//So the range is maxXCo, because ax^b+c=x, max x at a->0 b->0 and c->infinity, so +-c
		x=Math.round(Math.random()*maxCons);
		if(Math.random()>=0.5){x=-x;}
	}
	else{//Otherwise, make it so that x is where one of the denominator parts=0
		var cont=true;
		var dens=lim[3];
		while(cont&&dens.length>0){
		//console.log("finding x from den");
			var i=Math.floor(Math.random()*dens.length);
			if(isNaN(dens[i][2][3])){
				dens.splice(i,1);//remove that one from the list for now
			}
			else if(math.rationalize(dens[i][2][3]).toString().includes(".")){//If it's irrational
				dens.splice(i,1);//Yeah, let's just ignore that...
			}
			else{
				x=dens[i][2][3];
				cont=false;
			}
			if(dens.length==0){
				cont=false;
			}
		}
		if(dens.length==0){//If it doesn't equal 0 anywhere, just pick a random point
			x=Math.round(Math.random()*maxCons);
			if(Math.random()>=0.5){x=-x;}
		}
	}
	var ans=lhopital(num, den, x);
	currentAns=ans;
	var px=math.rationalize(x).toString();
	if(px.includes("/")){
		px=px.replace("/","}{");
		px="\\frac{"+px+"}";
	}
	latex="\\lim_{x \\to "+px+"} "+latex;
	ask("Evaluate the following limit.<br>If the limit is undefined, just enter 'DNE'.", latex);
	//console.log(lim[0]);
	var nPows=[]; var nCons=[]; var nCos=[];
	var dPows=[]; var dCons=[]; var dCos=[];
	for(var i=0; i<dens.length; i++){
		dPows.push(dens[i][0]);
		dCos.push(dens[i][1]);
		dCons.push(dens[i][2]);
	}
	var nums=lim[2];
	for(var i=0; i<nums.length; i++){
		nPows.push(nums[i][0]);
		nCos.push(nums[i][1]);
		dCons.push(nums[i][2]);
	}
	setFracGraph(nCos, nPows, nCons, dCos, dPows, dCons);
}
function lhopital(num, den, x){
	//Evaluates a limit, which for some reason mathjs can't do...
//console.log(num);
//console.log(den);
//console.log(x);
	var n=math.eval(num, {x:x});
	var d=math.eval(den, {x:x});
	var a=0;
	while(n==0&&d==0){
		num=math.derivative(num, "x").toString();
		den=math.derivative(den, "x").toString();
		n=math.eval(num, {x:x});
		d=math.eval(den, {x:x});
		a++;
	//console.log(a);
	//console.log(n);
	//console.log(d);
	//console.log(num);
	//console.log(den);
	}
	if(d==0){
		return "DNE";
	}
	else{
		return n/d;
	}
}
function infinLimit(maxTerms, maxPow, maxCo){
	//So, pretty much just generate something like ax^b(other unimportant stuff)/cx^d(other stuff that we don't care about)
	//If b==d, lim->oo = a/c
	//If b>d, lim->oo = +-infty
	//if b<d, lim->oo = 0
	//Also, asciimath for infinity is oo, and 'inifinity' will print weird stuff
	var way=Math.floor(Math.random()*3);//0-Will be a/c, 1-will be oo, 2-will be 0
	var ltext="\\frac{";
	var a=Math.floor(Math.random()*maxCo)+1;
	if(Math.random()>=0.5){a=-a;}
	var c=Math.floor(Math.random()*maxCo)+1;
	if(Math.random()>=0.5){c=-c;}
	var b=Math.round(Math.random()*Math.pow(maxPow,2));
	b=Math.ceil(Math.pow(b, 1/2));//Gives a much higher chance 
	var d;
	var ans;
	if(way==1){
		if(b==0){
			b++;
			d=0;
		}
		else{
			d=Math.round(Math.random()*Math.pow(b-1,2));
			d=Math.ceil(Math.pow(d,1/2));
		}
		ans="infty";
		if((a<0)? (c>=0):(c<0)){//Ok, I'm not 100% certain what this does, but it is what came up when I searched 'javascript XOR'. I think it's if a<0, then c>=0, otherwise c<0
			ans="-infty";
		}
	}
	else if(way==0){
		d=b;
		ans=a/c;
	//console.log("Should be a/c");
	}
	else{
		d=Math.round(Math.random()*Math.pow(maxPow-b,2));
		d=Math.ceil(Math.pow(d,1/2));
		d+=b;
		if(b==maxPow){
			d=maxPow;
			b=maxPow-1;
		}
		else if(b==d){
			d++;
		}
		ans=0;
	//console.log("Should be 0");
	}
//console.log(a);
//console.log(c);
	currentAns=ans;
	if(b==0){
		ltext+=a;
	}
	else if(a==-1){
		ltext+="-x";
	}
	else if(a==1){
		ltext+="x";
	}
	else{
		ltext+=a+"x";
	}
	if(b>1){
		ltext+="^{"+b+"}";
	}
	//Put in the other unimportant stuff after the first numerator term
	var t=Math.round(Math.random()*maxTerms);
	var num=makePolynomial(t, b-1, maxCo);
	if(!num[0].startsWith("-")){
		ltext+="+";
	}
	ltext+=num[0];
	ltext+="}{";
	if(d==0){
		ltext+=c;
	}
	else if(c==-1){
		ltext+="-x";
	}
	else if(c==1){
		ltext+="x";
	}
	else{
		ltext+=c+"x";
	}
	if(d>1){
		ltext+="^{"+d+"}";
	}
	//Unimportant terms in the denominator...
	t=Math.round(Math.random()*maxTerms);
	var den=makePolynomial(t, d-1, maxCo);
	if(!den[0].startsWith("-")){
		ltext+="+";
	}
	ltext+=den[0];
	ltext+="}";
	ask("What is the value of the following function as \\(x \\to \\infty\\)? (To enter infinity, type 'infty')", ltext);
	MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}
function makePolynomial(terms, maxPow, maxCo, raw=false){
	//So, this entire thing is just going to be the derivative's polynomial maker
	//need to have it return the latex and normal text...
	//Return is: [latex, simple, [pows, cos]]
	var latex="";
	var simple="";
	var raws=[[],[]];
	if((maxPow+1)<=terms){
		for(var pow=maxPow; pow>=0; pow--){
			var co=0;
			while(co==0){
				co=Math.round((Math.random()*maxCo*2)-maxCo);//So that there isn't a coefficient of 0, becuase that would be annoying and would lower terms number
			}
			/*if(co==-1&&pow!=0){
				simple+="-";
				latex+="-";
			}
			else if(co!=1||pow==0){
				simple+=co;
				latex+=co;
			}
			if(pow==1){
				latex+="x+";
				simple+="x+";
			}
			else if(pow>1){
				latex+="x^{"+pow+"}+";
				simple+="x^"+pow+"+";
			}*/
			//Add in later: allow a term with coefficient <=0, and account for that with the printing of the + and the entire term
			if(pow!=maxPow){
				if(co>0){
					latex+="+";
					simple+="+";
				}
				if(Math.abs(co)>1||pow==0){
					latex+=co;
					simple+=co;
				}
				else if(co<0){//-1
					latex+="-";
					simple+="-";
				}
			}
			else{
				if(Math.abs(co)>1||pow==0){
					simple+=co;
					latex+=co;
				}
				else if(co<0){//-1
					simple+="-";
					latex+="-";
				}
			}
			if(pow>0){
				simple+="x";
				latex+="x";
				if(pow>1){
					simple+="^"+pow;
					latex+="^{"+pow+"}";
				}
			}
			raws[0].push(pow);
			raws[1].push(co);
		}
	}
	else{
		var possiblePows=[];
		//Ok, for the removing parts of the array, use .splice(a,b), where a=start index, b=end index-1, so .splice(0,1) would remove item at index 0
		//Also, that doesn't return the value of it.
		for(var pow=0; pow<=maxPow; pow++){
			possiblePows.push(pow);
		}
		//console.log(possiblePows);
		var pows=[];
		var cos=[];
		for(var i=0; i<terms; i++){
			var pi=Math.floor((Math.random()*possiblePows.length));
			//console.log(pi);
			var c=0;
			while(c==0){
				c=Math.round((Math.random()*maxCo*2)-maxCo);
			}
			var p=possiblePows[pi];
			possiblePows.splice(pi, 1);
			//console.log(possiblePows);
			pows.push(p);
			cos[p]=c;
			//console.log(p);
		}
		pows.sort(function(a,b){return b-a});//Javascript tutorial says this should be reverse order
		//console.log(pows);
		for(var i=0; i<pows.length; i++){
			var p=pows[i];
			/*if((cos[p]==-1)&&(p!=0)){
				latex+="-";
				simple+="-";
			}
			else if(cos[p]!=1||p==0){
				latex+=cos[p];
				simple+=cos[p];
			}
			if(p>1){
				latex+="x^{"+p+"}";
				simple+="x^"+p;
			}
			else if(p==1){
				latex+="x";
				simple+="x";
			}
			if((i+1)!=pows.length){
				latex+="+";
				simple+="+";
			}*/
			if(i>0){
				if(cos[p]>0){
					latex+="+";
					simple+="+";
				}
				if(Math.abs(cos[p])>1||p==0){
					latex+=cos[p];
					simple+=cos[p];
				}
				else if(cos[p]<0){//-1
					latex+="-";
					simple+="-";
				}
			}
			else{
				if(Math.abs(cos[p])>1||p==0){
					simple+=cos[p];
					latex+=cos[p];
				}
				else if(cos[p]<0){//-1
					simple+="-";
					latex+="-";
				}
			}
			if(p>0){
				simple+="x";
				latex+="x";
				if(p>1){
					simple+="^"+p;
					latex+="^{"+p+"}";
				}
			}
			raws[0].push(p);
			raws[1].push(cos[p]);
			//console.log("Co:"+cos[p]+" Pow:"+p);
		}
	}
	var result=[latex, simple];
	if(raw){
		result.push(raws);
	}
	return result;
}
function trig_term(maxTCo, maxXCo, /*maxTPow,*/ maxXPow, diff=nTrig, raw=false){
	//Ok, so all of these variables are because you can have: a*sin^c(bx^d)
	//'max' is just there to be descriptive
	//'T' is for 'Trig', so it is a modifier for the trig (a and c)
	//'X' is for 'x', so it is a modifier for the indepenent variable (b and d)
	//'Co' is 'Coefficient', so it is a and b
	//'Pow' is 'Power', so it is c and d
	//So: maxTCo*sin^maxTPow(maxXCo*x^maxXPow) would be what it is, if it rolled 'sin' and 1 for every random thing
	//diff is an array of all of the trig functions that can be used, which are kindly listed in a few arrays above this function
	//Default is just sin, cos and tan
	var latex="";
	var simple="";
	var trigs=diff.filter(function (trig){
		return allTrig.includes(trig);
	});
	//Ok, since I seem to already be writing a lot of comments for this, might as well plan out the logic:
	//Generate a random coefficient within the range and !=0, print it, accounting for possibly =+-1
	//Pick a random power within the range, thought I may want to make it !=0
		//If it is 1, don't need to worry about it anymore
		//Otherwise, print a parenthese and later on print the exponent
		//May just drop this part...
		//Dropping it for now
	//Pick a random trig function within the checked list, print it 
		//(latex for trig stuff is \trig, with 'trig' being an actual trig function, makes it not an italicized variable)
	//Pick a random coefficient within the second range, print it, accounting for =+-1
	//Pick a random exponent for x, possible checking !=0, but we may want that... Do I need another argument for having x^0?
		//Yeah, print it according to the normal printing rules
	//Close the parens, put in the ^pow if it should be there
	//Why am I writing so many comments right now?
	var tc=0;
	while(tc==0){
		tc=Math.round((Math.random()*maxTCo*2)-maxTCo);
	}
	if(Math.abs(tc)==1){
		if(tc==-1){
			simple+="-";
			latex+="-";
		}
	}
	else{
		simple+=tc;
		latex+=tc;
	}
	var t=Math.floor(Math.random()*trigs.length);
	var tr=trigs[t];
	simple+=tr+"(";
	latex+="\\"+tr+"(";//If it was just "sin", it LaTeX would italicize it because it thinks it is a variable, so it needs to be"\sin"
	var xc=0;
	while(xc==0){
		xc=Math.round((Math.random()*maxXCo*2)-maxXCo);
	}
	if(xc==-1){
		simple+="-";
		latex+="-";
	}
	else if(xc!=1){
		simple+=xc;
		latex+=xc;
	}
	var xp=Math.round(Math.random()*maxXPow);
	if(xp==0){
		if(Math.abs(xc)==1){//If it had just printed a - or nothing at all for the coefficient, print 1
			simple+="1";
			latex+="1";
		}
	}
	else{
		simple+="x";
		latex+="x";
		if(xp>1){
			simple+="^"+xp;
			latex+="^{"+xp+"}";
		}
	}
	simple+=")";
	latex+=")";
	var val=[simple, latex]
	if(raw){
		val.push([tc, tr, xc, xp]);//Add in the values to the return statement so that the integral can be found
	}
	return val;
}
function generate_factored_part(maxXCo, maxXPow, maxC, neg=false){
	//Ok, so this will pretty much make a thing like (x^2 +1), etc, so that I can quickly make graphs with holes
	//neg accounts for if the constants can be negative as well (not counting the power)
	var xPow=Math.floor(Math.random()*maxXPow)+1;//So that it can't be 0
	var xCo=Math.floor(Math.random()*maxXCo)+1;
	var cons=Math.round(Math.random()*maxC);
	if(neg){
		if(Math.random()>=0.5){//50% chance of making it negative (Math.random() has domain [0,1), so 0.5 is included in the upper half)
			xCo=-xCo;
		}
		if(Math.random()>=0.5){//Yes, a second roll, because otherwise both would be positive/both would be negative
			cons=-cons;
		}
	}
	var simple="("+xCo+"x";
	var latex="(";
	if(xCo==-1){
		latex+="-x";
	}
	else if(xCo==1){
		latex+="x";
	}
	else{
		latex+=xCo+"x";
	}
	if(xPow>1){
		simple+="^("+xPow+")";
		latex+="^{"+xPow+"}";
	}
	if(cons!=0){
		if(cons>0){//Don't need to manually add the -, because it will already be printed
			simple+="+";//Sadly, the + needs to be done manually
			latex+="+";
		}
		simple+=cons;
		latex+=cons;
	}
	simple+=")";
	latex+=")";
	var zero=Math.pow(-(cons/xCo), 1/xPow)
	return [simple, latex, [xPow, xCo, cons, zero]];
}
function test(){
//console.log("test");
}
function testRandom(max, limit=100){
	//Just a check that I was doing random numbers properly
	//I think it might be rolling both + and - 0 though?
	var full=[];
	for (var i=0; i<=max; i++){
		full[i]=false;
	}
	var cont=true;
	var count=0;
	while(cont&&count<limit){
		count++;
		var a=Math.round((Math.random()*max));
		if(a>max||a<-max){
		//console.log("Problem:"+a);
		}
		full[a]=true;
		cont=!full.every(function (i){
			return i;
		})
	}
	//console.log("All were generated?"+!cont);
	//console.log("Times rolled: "+count);
	//console.log(full);
}
function testWeight(func, times){
//console.log("test");
	var counts=[];
	var occured=[];
	for(var i=0; i<times; i++){
		var a=func();
		if (occured.includes(a)){
			counts[a]=counts[a]+1;
		}
		else{
			occured.push(a);
			counts[a]=1;
		}
	}
	occured.sort();
	for(var i=0; i<occured.length; i++){
	//console.log(occured[i]+": "+counts[occured[i]]);
	}
}
///////
//Numpad stuff (I would move this into a separate file, but they work so closely together that they might as well be in the same file)
///////
//var expo=false;
//var first=0;
//wait, so you can have [number], [expoenet][/exponent], [fstart][fmid][fend], [exponent][fstart][/exponent], [fstart][exponent][fmid], and also in denominator, but it isn't much of a problem
//So, those scenarios can be 0, 1, 2, 3, 4
var keyWrapper=function keyGuard(event){
	if(event.key=="Enter"){
		functionthing();
	}
	else{
		setTimeout(
			function(){
		entry_text=event.target.value;//Update entry_text
		update_ascii();}
		, 10);//wait a tiny bit to let html update the inner value, and then do update everything (may break on very laggy computers or with a very fast typing bot)
	}
}
var entry=document.getElementById("input-answer");
entry.addEventListener('keydown', keyWrapper);
//var buffer="";//what is currently being typed out that is a multi-character function
//var buffering=false;//if it is currently buffering something
//var ltext="";
function update_ascii(){
	var e=MathJax.Hub.getAllJax("final-entry")[0];
	MathJax.Hub.Queue(['Text',e,entry_text]);
}
function numpad(key){
	//var old=ltext;//to check if latex actuall needs to update, later on
	//var area=document.getElementById("new-entry");
	/*if(buffering){
		key=buff(key,area);
	}*/
	var num=Number(key);
	
	if(!isNaN(num)){//just a workaround for a bug
		if(entry_text.slice(-1)=="]"||entry_text.slice(-1)==")"){//fix implicit multiplication
			//area.innerHTML+="*";
			entry_text+="*";
			//lCharAdd("*");
		}
		//area.innerHTML+=num;
		entry_text+=num;
		//lCharAdd(num);
	}
	else if(key=="^"){
		entry_text+="^(";
		//lCharAdd("^{}");
		//entry_text+=addExpo(area);
	}
	else if(key=="back"){
		//entry_text=backspace(area, entry_text);
		//newBackspace();
		entry_text=entry_text.slice(0,-1);
	}
	/*else if(key=="frac"){
		//entry_text+=addFrac(area);
		entry_text+="(";
		//lCharAdd("\\frac{}{}");
	}*/
	else if(['x','c','e','z','y'].includes(key)){//any remaining value, not a function
		if([")","]"].includes(entry_text.slice(-1))){//just came up with a much better way of doing this logic
			entry_text+="*";
			//area.innerHTML+="*";
			//lCharAdd("*");
		}
		//area.innerHTML+=key;
		entry_text+=key;
		//lCharAdd(key);
	}
	else if(['*','+',"-",'/',')','(',']','['].includes(key)){
		entry_text+=key;
		//area.innerHTML+=key;
		//lCharAdd(key);
	}
	else if(key=='Enter'){
		functionthing();
	}
	else if(key=="clr"||key=='Delete'){
		//area.innerHTML="";
		entry_text="";
		//expo=false;
		//first=0;
		//frac_stage=0;
		//ltext="";
		//justEnded=false;
	}
	else if(key=="pi"){//You never know what special characters their keyboard might have...
		//area.innerHTML+="&pi;";
		entry_text+="pi";
		//lCharAdd("pi");
	}
	else if(['sin(','cos(','tan(','csc(','sec(','cot('].includes(key)){
		//area.innerHTML+=key;
		entry_text+=key;
		//lCharAdd(key);
	}
	else if(key=="."){
		//console.log(key);
		if(isNaN(Number(entry_text.slice(-1)))){
			entry_text+="0";
			//area.innerHTML+="0";
			//lCharAdd("0");
		}
		entry_text+=".";
		//area.innerHTML+=".";
		//lCharAdd(".");
	}
	else if(key=="^2"){
		entry_text+="^2";
	}
	else if(key=="^(1/2)"){
		entry_text+="^(1/2)";
	}
	else{
		entry_text+=key;
	}
	/*if(key=="2nd"){
		second(true);
	}
	else{
		second();//turns off second
	}*/
	//console.log(first);
	entry.value=entry_text;
	/*if(old!=ltext){
		var m=MathJax.Hub.getAllJax("latex-entry")[0];
		MathJax.Hub.Queue(['Text',m, ltext]);
	}*/
	update_ascii();
}
//Yeah, we decided to not use this...
function second(state=false){//by default, it turns second off
	var sin=document.getElementById('sin');
	var cos=document.getElementById('cos');
	var tan=document.getElementById('tan');
	if(state){//turn on second (set the sin to csc, etc.)
		sin.innerHTML="csc";
		sin.onclick=function(){numpad('csc(');};
		cos.innerHTML="sec";
		cos.onclick=function(){numpad('sec(');};
		tan.innerHTML="cot";
		tan.onclick=function(){numpad('cot(');};
	}
	else{
		sin.innerHTML="sin";
		sin.onclick=function(){numpad('sin(');};
		cos.innerHTML="cos";
		cos.onclick=function(){numpad('cos(');};
		tan.innerHTML="tan";
		tan.onclick=function(){numpad('tan(');};
	}
}
/////
//Graph functions (Prahlad please make these)
/////
function setPolyGraph(cos, pows){
	//Sets the graph to be a polynomial function
	//cos is a list of the coeficients, pows is a list of the powers
	//So the function would look like "cos[0]*x^pows[0]+cos[1]*x^pows[1]"
	//Please code this
	showGraph();
}
function setFracGraph(nCos, nPows, nCons, dCos, dPows, dCons){
	//Sets the graph to a fraction
	//n___ is for the numberator, d____ is for the denominator
	//_Cos is the coefficients of x, _Pows is the powers of x, and _Cons is the constant added to it
	//So it would look like "(nCos[0]*x^nPows[0]+nCons[0])*(nCos[1]*x^nPows[1]+nCons[1])*.../(dCos[0]*x^dPows[0]+dCons[0])*(dCos[1]*x^dPows[1]+dCons[1])*..."
	//Please code this as well
	showGraph();
}
function setAbsGraph(a, b){
	//Function in the form |ax|/bx
	showGraph();
}
function setXScale(min, max){
	//Would set the scale of the x's to be between min and max
	//Not as important, I can just edit the problems to not go outside the range it is stuck on
}
function setYScale(min, max){
	//Similar to the above one, sets the y range
	//Slightly more important than getting x (because now I have to put in more checks), but still can be worked around
}
function hideGraph(){
	//Just hides the graph, so that non-graph problems don't have a graph
	//Hopefully you don't need to add anything
	var g=document.getElementById("graph");
	g.style="visibilty: hidden";
}
function showGraph(){
	//Just makes the graph visible again, you may want to call this in the make graph functions, but I can call them myself
	var g=document.getElementById("graph");
	g.style="visibilty: visible";
}