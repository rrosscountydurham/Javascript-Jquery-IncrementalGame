/*
===================CODE====================
*/
var	shorthandArray = [
	"Million","Billion","Trillion","Quadrillion","Quintillion","Sextillion","Octillion","Nonillion","Undecillion","Duodecillion","Tredecillion","Quattuordecillion","Quinquadecillion","Sedecillion",
	"Septendecillion","Octodecillion","Novendecillion","Vigintillion","Unvigintillion","Duovigintillion","Tresvigintillion","Quattuorvigintillion","Quinquavigintillion","Sesvigintillion","Septemvigintillion",
	"Octovigintillion","Novemvigintillion","Trigintillion","Untrigintillion","Duotrigintillion","Trestrigintillion","Quattuortrigintillion","Quinquatrigintillion","Sestrigintillion","Septentrigintillion",
	"Octotrigintillion","Noventrigintillion","Quadragintillion","Quinquagintillion","Sexagintillion","Septuagintillion","Octogintillion","Nonagintillion","Centillion","Uncentillion","Duocentillion","Trescentillion",
	"Decicentillion","Undecicentillion","Viginticentillion","Unviginticentillion","Trigintacentillion","Quadragintacentillion","Quinquagintacentillion","Sexagintacentillion","Septuagintacentillion","Octogintacentillion",
	"Nonagintacentillion","Ducentillion","Trecentillion","Quadringentillion","Quingentillion","Sescentillion","Septingentillion","Octingentillion","Nongentillion","Millinillion"]

Decimal.prototype.display = function(){
	var text = this.toFixed(0);
	if(text.length >= 7){
		var mod = text.length - 7;
		mod = Math.floor(mod/3);
		text = text.slice(0,3 + (text.length - 1)%3);
		text = text.slice(0,text.length - 2) + "." + text.slice(-2) + " " + shorthandArray[mod];
	}
	return text;
}

function randIntRange(min,max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

 function SetupInterface(){
	 Decimal.config({
		precision: 5,
	 });
	 
	 $("#battle-current-monster-left-button").button({
			icons:{primary: "ui-icon-carat-1-w", secondary: null},
			label: "Reduce monster level"
	});

	 $("#battle-current-monster-right-button").button({
			icons:{primary: null, secondary: "ui-icon-carat-1-e"},
			label: "Increase monster level"
	});
	
	$("#battle-current-monster-info-hpbar").progressbar({max: 1000, value: 1000});
	$("#battle-current-monster-info-hpbar").css({background: $("#battle-current-units").css("background-color")});
	$("#battle-current-monster-right-button").click(function() {IncrementMonster();});
	$("#battle-current-monster-left-button").click(function() {DecrementMonster();});
	$("#subtabs2").tabs();
	$("#tabs").tabs({activate: function(event,ui){
		if(ui.newPanel.selector=="#tabs-2")
			DisplayCharStats();
		}
	});
	$("#subtabs").tabs({activate: function(event,ui) {
       if ( ui.newPanel.selector=="#subtabs-2" )
            DisplayLand();
        }
	});
	var tempText = "<h1>Base Genes</h1><br>"
	$(tempText).appendTo("#troops-genebank-statselector");
	for(var i = 0 ; i < Bonuses.LENGTH ; i++){
		tempText = "troops-genebank-statselector-" + i;
		$("<input type=button class=troops-genebank-statselector-button id=" + tempText + ">").appendTo("#troops-genebank-statselector");
		tempText = "#" + tempText;
		$(tempText).button({label: BonusesText[i]});
		$(tempText).click(function(){EquipGenericGene(this.id);});
	}
 }
 
var Levels = function(){
	this.currLevel = 1;
	this.maxLevel = 1;
	this.goal = 0;
	this.currLand = 0;
	this.maxLand = 0;
	this.currPlanet = 0;
	this.maxPlanet = 0;
	this.isGoal =  function(){
		if(this.currLevel == this.maxLevel && this.currLand == this.maxLand && this.currPlanet == this.maxPlanet)
			$("#battle-current-monster-info-goal").html("Goal: " + this.goal + "/10");
		else
			$("#battle-current-monster-info-goal").html("");
	}
	this.isGoal();
	this.incrementBattle = function(){
		if((this.currLevel < this.maxLevel || this.currLand < this.maxLand || this.currPlanet < this.maxPlanet) && this.currLevel < 10){
			this.currLevel += 1;
			this.isGoal();
			return true;
		}
		else
			return false;
	}
	this.decrementBattle = function(){
		if(this.currLevel > 1){
			this.currLevel -= 1;
			this.isGoal();
			return true;
		}
		else
			return false;
	}
	this.setLand = function(i){
		this.currLand = i;
		this.currLevel = 1;
		this.isGoal();
	}
	this.incrementGoal = function(){
		if(this.currLevel == this.maxLevel && this.currLand == this.maxLand && this.currPlanet == this.maxPlanet)
			this.goal+= 1;
		if(this.goal >= 10)
			this.incrementLevel();
		this.isGoal();
	}
	this.incrementLevel = function(){
		this.maxLevel += 1;
		this.goal = 0;
		if(this.maxLevel >= 11)
			this.incrementLand();
	}
	this.incrementLand = function(){
		this.maxLand += 1;
		this.maxLevel = 1;
		DisplayLand();
		if(this.maxLand >= 11)
			this.incrementPlanet();
	}
	this.incrementPlanet = function(){
		this.maxPlanet += 1;
		this.maxLand = 0;
	}
	this.monLevel = function(){
		return this.currLevel + (this.currLand * 10) + (this.currPlanet * 100);
	}
	this.levelRange = function(i){
		return ((i * 10) + 1 + (this.currPlanet * 100)) + " - " + ((i * 10) + 10 + (this.currPlanet * 100))
	}
	this.showLand = function(){
		var i = parseInt(this.currLand) + 1;
		return i;
	}
}

var Combatant = function(name,dps){
	this.HP =  new Decimal(100);
	this.MaxHP = new Decimal(100);
	this.totalDPS = new Decimal(dps);
	this.name = name;
};

function PlayerChar(name,dps){
	Combatant.call(this,name,dps);
	this.recovery = 0;
	this.Def = new Decimal(0);
	this.Crit = new Decimal(0);
	this.Regen = new Decimal(0);
	this.Focus = new Decimal(0);
	this.Genes = [];
	this.GeneMax = 4;
	this.Bonuses = [];
	this.resetBonuses = function(){
		for(var i = 0 ; i < Bonuses.LENGTH ; i++){
			this.Bonuses[i] = new Decimal(0);
		}
	}
	this.calcBonuses = function(){
		this.HP = this.HP.minus(this.Bonuses[Bonuses.HP]);
		this.resetBonuses();
		for(var i = 0 ; i < this.Genes.length ; i++){
			for(var j = 0 ; j < Bonuses.LENGTH ; j++){
				if(this.Genes[i].active)
					this.Bonuses[j] = this.Bonuses[j].plus(this.Genes[i].bonuses[j]);
			}
		}
		this.HP = this.HP.plus(this.Bonuses[Bonuses.HP]);
		if(this.HP.lessThan(0) || this.recovery > 0)
			this.HP = new Decimal(0);
		DisplayCharStats();
	}
	this.addGene = function(Gene){
		if(this.Genes.length < this.GeneMax){
			this.Genes.push(Gene);
			this.calcBonuses();
			return true;
		}
		else
			return false;
	}
	this.equipGene = function(){
		for(var i = 0 ; i < this.Genes.length ; i++){
			if(!this.Genes[i].active)
				this.Genes[i].active = true;
		}
		this.calcBonuses();
	}
	this.removeGene = function(i){
		if(this.Genes.length > 0){
			if(this.Genes[i].unique){
				AddGenebankGene(this.Genes[i]);
			}
			this.Genes.splice(i,1);
			DisplayCharStats();
		}
	}
	this.integrateGenes = function(xp){
		for(var i = 0 ; i < this.Genes.length ; i++){
			this.Genes[i].integrationResult(new Decimal(xp*5).pow(2));
		}
	}
	this.canExtract = function(){
		for(var i = 0 ; i < this.Genes.length ; i++){
			if(this.Genes[i].compatibility.equals(100))
				return true;
		}
		return false;
	}
	this.extractGenes = function(){
		var GenesOut = [];
		for(var i = 0 ; i < this.Genes.length ; i++){
			if(this.Genes[i].compatibility.equals(100))
				GenesOut.push(this.Genes[i]);
		}
		var Cleaned = false;
		while(!Cleaned){
			Cleaned = true;
			for(var i = 0 ; i < this.Genes.length ; i++){
				if(this.Genes[i].compatibility.equals(100)){
					Cleaned = false;
					this.Genes.splice(i,1);
				}
			}
		}
		DisplayCharStats();
		return GeneMix(GenesOut);
	}
	this.returnHP = function(){
		return this.MaxHP.plus(this.Bonuses[Bonuses.HP]);
	}
	this.returnDPS = function(){
		return this.totalDPS.plus(this.Bonuses[Bonuses.DPS]);
	}
	this.returnDef = function(){
		return this.Def.plus(this.Bonuses[Bonuses.DEF]);
	}
	this.returnCrit = function(){
		return this.Crit.plus(this.Bonuses[Bonuses.CRIT]);
	}
	this.returnRegen = function(){
		return this.Regen.plus(this.Bonuses[Bonuses.REGEN]);
	}
	this.returnFocus = function(){
		return this.Focus.plus(this.Bonuses[Bonuses.FOCUS]);
	}
	this.returnGenes = function(j){
		var text = "";
		for(var i = 0 ; i < this.GeneMax ; i++){
			if(this.Genes.length > i){
				text += "<div class=troops-char-genes-display id=char" + j + "gene" + i + ">" + this.Genes[i].returnStats(i);
				if(this.Genes[i].active)
					text += "</div>";
				else
					text += "<input type=button id=generemove-" + j + "-" + i + "></input></div>";
			}
			else
				text += "<div class=troops-char-genes-display id=char" + j + "gene" + i + ">Empty</div>";
		}
		return text;
	}
	this.updateIntegration = function(){
		for(var i = 0 ; i < this.Genes.length ; i++){
			$("#char-integration-" + i).html("CURRENT INTEGRATION: " + this.Genes[i].compatibility.display() + "%");
		}
	}
	this.regen = function(i){
		if(this.HP.lessThan(this.returnHP()))
			this.HP = this.HP.plus(this.returnRegen().times(i/1000));
		if(this.HP.greaterThan(this.returnHP()))
			this.HP = this.returnHP();
	}
	this.setRecovery = function(i){
		this.recovery = 60 * (1000/i);
	}
	this.tickRecovery = function(){
		this.recovery -= 1;
		if(this.recovery == 0)
			this.HP = this.returnHP();
	}
	this.returnRecovery = function(i){
		return "Recovering: " + (this.recovery / (1000/i)).toFixed(0) + " seconds remaining";
	}
	this.resetBonuses();
	this.calcBonuses();		
	this.HP = this.returnHP();
	AddCharDisplay(name,Characters.length,this.returnHP(),this.HP);
};
PlayerChar.prototype = Object.create(Combatant.prototype);
PlayerChar.prototype.constructor = PlayerChar;

function AddCharDisplay(name,index,MaxHP,HP){
	$("div#battle-current-units").append("<div class=battle-current-char id=character" + index + ">" + name + "<br><div class=battle-current-char-hpcontainer><div class=battle-current-char-hp id=characterhpbar" + index 
	+ "></div><div class=battle-current-char-hp-text id=characterhptext" + index + ">" + HP.display() + "/" + MaxHP.display() + "</div></div>");
	$("#characterhpbar" + index).progressbar({max: 1000, value: HP.dividedBy(MaxHP).toFixed(4) * 1000});
	$("#characterhpbar" + index).css({background: $("#battle-current-units").css("background-color")});
}

function Monster(name,monlevel){
	var DPS = new Decimal(2);
	DPS = DPS.times(monlevel);
	Combatant.call(this,name,DPS);
	this.MaxHP = this.MaxHP.times(monlevel);
	this.HP = this.MaxHP;
	AddMonDisplay(name,this.MaxHP,this.HP);
};
Monster.prototype = Object.create(Combatant.prototype);
Monster.prototype.constructor = Monster;

var Bonuses = {
	DPS: 0,
	HP: 1,
	DEF: 2,
	CRIT: 3,
	REGEN: 4,
	FOCUS: 5,
	LENGTH: 6
}

var BonusesText = [
	"Dps",
	"Hitpoints",
	"Defence",
	"Critical Damage",
	"Regeneration",
	"Focus"
]

var BonusMulti = [
	10,
	100,
	1,
	1,
	1,
	1
]

function Gene(){
	this.bonuses = [];
	this.active = false;
	this.unique = true;
	this.compatibility = new Decimal(0);
	this.genBonuses = function(bonSelect){
		for(var i = 0 ; i < Bonuses.LENGTH ; i++){
			if(bonSelect[i].greaterThan(0))
				this.bonuses[i] = bonSelect[i].times(BonusMulti[i]);
			else
				this.bonuses[i] = new Decimal(0);
		}
	}
	this.integrationResult = function(i){
		if (this.compatibility.lessThan(100) && this.active){
			if(i.greaterThan(this.returnCost(false).dividedBy(1000)))
				this.compatibility = this.compatibility.plus(i.dividedBy(this.returnCost(false)));
		}
		console.log(this.compatibility.greaterThan(100));
		if(this.compatibility.greaterThan(100))
			this.compatibility = new Decimal(100);
	}
	this.returnStats = function(id){
		if(this.active)
			var text = "<div class=gene-bonuses-display>";
		else
			var text = "<div class=gene-bonuses-display-inactive>";
		for(var i = 0 ; i < Bonuses.LENGTH ; i++){
			if(this.bonuses[i].greaterThan(0))
				text += BonusesText[i] + ": " + this.bonuses[i].display() + "<br>";
		}
		text += "<div id=char-integration-" + id + ">CURRENT INTEGRATION: " + this.compatibility.display() + "%</div>";
		text += "</div>";
		return text;
	}
	this.returnLabel = function(){
		var text = "";
		for(var i = 0 ; i < Bonuses.LENGTH ; i++){
			if(this.bonuses[i].greaterThan(0))
				text += BonusesText[i] + ": " + this.bonuses[i].display() + " ";
		}
		return text;
	}
	this.returnCost = function(display){
		var cost = new Decimal(0);
		var multi = 0;
		for(var i = 0 ; i < this.bonuses.length ; i++){
			if(!this.bonuses[i].isZero()){
				cost = cost.plus(this.bonuses[i].div(BonusMulti[i]));
				multi++;
			}
		}
		cost = cost.times(10);
		
		if(display)
			return cost.times(multi).display();
		else
			return cost;
	}
}

function GeneBank(){
	this.genes = [];
	this.displayGenes = function(){
		$("#troops-genebank-inventory").html("");
		var tempText = "<h1>Gene Bank</h1><br>";
		$(tempText).appendTo("#troops-genebank-inventory");
		for(var i = 0 ; i < this.genes.length ; i++){
			tempText = "troops-genebank-inventory-" + i;
			$("<input type=button class=troops-genebank-inventory-button id=" + tempText + ">").appendTo("#troops-genebank-inventory");
			tempText = "#" + tempText;
			$(tempText).button({label: this.genes[i].returnLabel()});
			$(tempText).click(function(){EquipGenebankGene(this.id)});
		}
	}
	this.addGene = function(geneIn){
		this.genes.push(geneIn);
		this.displayGenes();
	}
	this.removeGene = function(i){
		this.genes.splice(i,1);
		this.displayGenes();
	}
}

function GeneMix(GenesIn){
	this.bonus = [];
	for(var i = 0 ; i < Bonuses.LENGTH ; i++){
		this.bonus[i] = new Decimal(0);
		for(var j = 0 ; j < GenesIn.length ; j++){
			this.bonus[i] = this.bonus[i].plus(GenesIn[j].bonuses[i].dividedBy(BonusMulti[i]));
			if(GenesIn[j].bonuses[i].greaterThan(0))
				this.bonus[i] = this.bonus[i].plus(1);
		}
		this.bonus[i] = this.bonus[i].times(randIntRange(90,110) / 100).floor();
	}
	this.geneReturn = new Gene();
	this.geneReturn.genBonuses(bonus);
	return geneReturn;
}

function AddMonDisplay(name,MaxHP,HP){
	$("#battle-current-monster-info-name").html(name);
	$("#battle-current-monster-info-level").html("Level " + Level.monLevel());
	$("#battle-current-monster-info-image").css('background-image', "buttonright.png");
	$("#battle-current-monster-info-hptext").html(HP.display() + "/" + MaxHP.display());
}

function IncrementMonster(){
	if(Level.incrementBattle())
		Mon = new Monster("George",Level.monLevel());
}

function DecrementMonster(){
	if(Level.decrementBattle())
		Mon = new Monster("George",Level.monLevel());
}

function SetLand(i){
	i = i.charAt(i.length - 1);
	Level.setLand(i);
	$("#battle-land-display").html("Current Land: " + Level.showLand());
	Mon = new Monster("George",Level.monLevel());
}

function RemoveCharInactiveGene(i){
	i = i.substr(11,i.length - 11);
	var charIndex = i.substring(0,i.search("-"));
	var geneIndex = i.substring(i.search("-") + 1,i.length);
	Characters[charIndex].removeGene(geneIndex,GeneInv);
}

function ExtractCharGene(i){
	i = i.slice(25,i.length);
	if(Characters[i].canExtract())
		AddGenebankGene(Characters[i].extractGenes());
}
function EquipGenericGene(i){
	var tempbonus = [];
	for(var j = 0 ; j < Bonuses.LENGTH ; j++){
		if(j == (i.substr(29,i.length-28)))
			tempbonus[j] = new Decimal(1);
		else
			tempbonus[j] = new Decimal(0);
	}
	var tempgene = new Gene();
	tempgene.unique = false;
	tempgene.genBonuses(tempbonus);
	Characters[$("#subtabs2").tabs("option","active")].addGene(tempgene);
}

function AddGenebankGene(gene){
	GeneInv.addGene(gene);
}

function EquipGenebankGene(i){
	i = i.slice(26,i.length);
	if(Characters[$("#subtabs2").tabs("option","active")].addGene(GeneInv.genes[i]))
		GeneInv.removeGene(i);
}

function EquipGenes(i){
	i = i.slice(23,i.length);
	Characters[i].equipGene();
}

/*
===================GLOBALS====================
*/

var GameVars = {
	critCheck: 0,
	CurrCharGene: 0
}
var Characters = [];
var Monster;
var Level;
var GeneInv = new GeneBank();

function InitGame(){
	$('#tabs').tabs();
	$('#tabs').tabs({heightStyle: "fill",show: false});
	$('#subtabs').tabs();
	$('#subtabs').tabs({heightStyle: "fill",show : false});
	Level = new Levels();
	Characters[0] = new PlayerChar("George",10);
	Mon = new Monster("Monster",Level.monLevel());
}

function DisplayCharacters(){	
	for(var i = 0 ; i < Characters.length ; i++){
		$("#characterhpbar" + i).progressbar("option","value",Characters[i].HP.dividedBy(Characters[i].returnHP()).toFixed(4) * 1000);
		if(Characters[i].recovery == 0)
			$("#characterhptext" + i).html(Characters[i].HP.display() + "/" + Characters[i].returnHP().display());
		else
			$("#characterhptext" + i).html(Characters[i].returnRecovery(interval));
	}
	$("#battle-current-monster-info-hpbar").progressbar("option","value",Mon.HP.dividedBy(Mon.MaxHP).toFixed(4) * 1000);
	$("#battle-current-monster-info-hptext").html(Mon.HP.display() + "/" + Mon.MaxHP.display());
}

function DisplayLand(){
	$("#subtabs-2").empty();
	$("#subtabs-2").html("<div id=battle-land-display>Current Land: " + Level.showLand() + "</div>");
	if(Level.currPlanet == Level.maxPlanet){
		for(var i = 0 ; i <= Level.maxLand ; i++){
			$("#subtabs-2").append("<button class=battle-land-selector id=land" + i + "></button>");
			$("#land" + i).button({			
				label: "Land " + (i + 1) + "<br>Level range: " + Level.levelRange(i)
			});
			$("#land" + i).click(function() {SetLand(this.id)});
		}
	}
	else{
		for(var i = 0 ; i < 10 ; i++){
			$("#subtabs-2").append("<button class=battle-land-selector id=land" + i + "></button>");
			$("#land" + i).button({			
				label: "Land " + (i + 1) + "<br>Level range: " + Level.levelRange(i)
			});
			$("#land" + i).click(function() {SetLand(this.id)});
		}
	}
}

function DisplayCharStats(){
	var tabs = $("#subtabs2").tabs();
	var currtab = 0;
	currtab = tabs.tabs("option","active");
	tabs.find("ul").empty();
	for(var i = 0 ; i < Characters.length ; i++){
		$("#chartab" + i).remove();
		$("<li><a href=#chartab" + i + ">" + Characters[i].name + "</a></li>" ).appendTo(tabs.find("ul"));
		$("<div class=troops-char-tab id=chartab" + i + "><div class=troops-char-statcontainer><h1>Stat Information</h1><div class=troops-char-statblock id=charstatblock" + i 
		+ "></div><h1>Gene Information</h1><input type=button class=troops-char-gene-equip id=troops-char-gene-equip-" + i + "></input><br><div class=troops-char-genes id=chargenes" + i + "></div></div>").appendTo(tabs);
		$("#charstatblock" + i).html("<div id=charname" + i + ">" + Characters[i].name + "</div><div id=chardps" + i + ">Total DPS: " + Characters[i].returnDPS() + "</div><div id=charhp" + i + ">HP: " 
		+ Characters[i].returnHP() + "</div><div id=chardef" + i + ">Defence: " + Characters[i].returnDef() + "</div><div id=charcrit" + i + ">Critical Damage: " + Characters[i].returnCrit() 
		+ "</div><div id=charregen" + i + ">Regeneration: " + Characters[i].returnRegen() + "</div><div id=charfocus" + i + ">Focus: " + Characters[i].returnFocus() + "</div>");
		$("#charhp" + i).tooltip({content: "How much damage this troop can sustain before requiring time to recover<br>Base HP: " + Characters[i].MaxHP + "<br>Bonus HP: " + Characters[i].Bonuses[Bonuses.HP], items: "div"});
		$("#chardps" + i).tooltip({content: "Base damage per second before critical damage is taken in account<br>Base DPS: " + Characters[i].totalDPS + "<br>Bonus DPS: " + Characters[i].Bonuses[Bonuses.DPS], items: "div"});
		$("#chardef" + i).tooltip({content: "Amount of enemy DPS ignored, meaning less damage to HP<br>Base Def: " + Characters[i].Def + "<br>Bonus Def: " + Characters[i].Bonuses[Bonuses.DEF], items: "div"});
		$("#charcrit" + i).tooltip({content: "Extra damage done when critically striking an enemy<br>Base Critical Damage: " + Characters[i].Crit + "<br>Bonus Critical Damage: " + Characters[i].Bonuses[Bonuses.CRIT], items: "div"});
		$("#charregen" + i).tooltip({content: "Amount of HP healed per second<br>Base Regen: " + Characters[i].Regen + "<br>Bonus Regen: " + Characters[i].Bonuses[Bonuses.REGEN], items: "div"});
		$("#charfocus" + i).tooltip({content: "Value of bonus added to buffs/debuffs<br>Base Focus: " + Characters[i].Focus + "<br>Bonus Focus: " + Characters[i].Bonuses[Bonuses.FOCUS], items: "div"});
		$("#chargenes" + i).html(Characters[i].returnGenes(i));
		$("<input type=button class=troops-char-extractgenes id=troops-char-extractgenes-" + i + "></input>").appendTo("#chargenes" + i);
		$("#troops-char-gene-equip-" + i).button({label: "Equip Genes"});
		$("#troops-char-extractgenes-" + i).button({label: "Extract Genes"});
		$("#troops-char-gene-equip-" + i).click(function(){EquipGenes(this.id)});
		$("#troops-char-extractgenes-" + i).click(function(){ExtractCharGene(this.id)});
		for(var j = 0 ; j < Characters[i].Genes.length ; j++){
			$("#generemove-" + i + "-" + j).button({label: "Remove"});
			$("#generemove-" + i + "-" + j).click(function(){RemoveCharInactiveGene(this.id)});
		}
	}
	tabs.on("tabsactivate",function(event,ui){GameVars.CurrCharGene = tabs.tabs("option","active");});
	tabs.tabs("refresh");
	tabs.tabs("option","active",currtab);
}

function CalcGeneCreationCost(spinVal){
	$("#troops-genebank-output").html("");
	var Cost = new Decimal(0);
	var TempGene = new Gene();
	var GeneBoni = [];
	for(var i = 0 ; i < Bonuses.LENGTH ; i++){
		if($("#troops-genebank-statselector-" + BonusesText[i].replace(" ","")).is(":checked"))
			GeneBoni[i] = new Decimal(spinVal);
		else
			GeneBoni[i] = new Decimal(0);
	}
	TempGene.genBonuses(GeneBoni);
	$("#troops-genebank-output").html(TempGene.returnStats());
	$("#troops-genebank-costdisplay").html("Cost: " + TempGene.returnCost(true) + " DNA Points");
}

function Tick(){
	TickFight();
	TickDisplay();
}

function TickFight(){
	GameVars.critCheck+= 1;
	for(var i = 0 ; i < Characters.length ; i++){
		if(!Mon.HP.lessThanOrEqualTo(0) && Characters[i].recovery == 0){
			Mon.HP = Mon.HP.minus(Characters[i].returnDPS().times(interval/1000));
			if(Math.random() * 100 <= 5 && GameVars.critCheck >= (1000/interval))
				Mon.HP = Mon.HP.minus(Characters[i].returnCrit());
		}
		if(!Characters[i].HP.lessThanOrEqualTo(0) && Mon.totalDPS.greaterThan(Characters[i].returnDef()))
			Characters[i].HP = Characters[i].HP.minus(Mon.totalDPS.minus(Characters[i].returnDef()).times(interval/1000));
		if(Characters[i].HP.lessThanOrEqualTo(0) && Characters[i].recovery <= 0)
			Characters[i].setRecovery(interval);
		if(Characters[i].recovery > 0)
			Characters[i].tickRecovery();
		else
			Characters[i].regen(interval);
	}
	if(Mon.HP.lessThanOrEqualTo(0)){
		Mon = new Monster("Monster",Level.monLevel());
		Level.incrementGoal();
		for(var i = 0 ; i < Characters.length ; i++){
			Characters[i].integrateGenes(Level.monLevel());
		}
	}
	if(GameVars.critCheck >= (1000/interval))
		GameVars.critCheck = 0;
}

function TickDisplay(){
	if($("#tabs").tabs("option","active") == 0 && $("#subtabs").tabs("option","active") == 0)
		DisplayCharacters();
	Characters[GameVars.CurrCharGene].updateIntegration();			
}

InitGame();
SetupInterface();
DisplayCharacters();
DisplayLand();

var interval = 100;
var before = new Date();
var AutoSave = 0;
setInterval(function()
{
    now = new Date();
    var elapsedTime = (now.getTime() - before.getTime());

    if(elapsedTime > interval)
    {
        for (var i = 0 ; i < Math.floor(elapsedTime/interval) ; i++){
			Tick();
		}
    }
    else
    {
		Tick();
    }
	AutoSave++;
	if(AutoSave > 99){
		Save();
		AutoSave = 0;
	}
    before = new Date(); 
	
}, interval);

function Save(){
	var Save = [];
	localStorage.setItem("save",JSON.stringify(Save));
}

function Load(){
	var savegame = JSON.parse(localStorage.getItem("save"));
}
	

	
	
	
	
	