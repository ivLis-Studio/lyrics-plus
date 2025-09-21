// Optimized Utils with performance improvements and caching
const Utils = {
	// Cache for frequently used operations
	_colorCache: new Map(),
	_normalizeCache: new Map(),
	
	addQueueListener(callback) {
		Spicetify.Player.origin._events.addListener("queue_update", callback);
	},
	
	removeQueueListener(callback) {
		Spicetify.Player.origin._events.removeListener("queue_update", callback);
	},
	
	convertIntToRGB(colorInt, div = 1) {
		const cacheKey = `${colorInt}_${div}`;
		
		if (this._colorCache.has(cacheKey)) {
			return this._colorCache.get(cacheKey);
		}
		
		// Use bit operations for faster calculations
		const r = Math.round(((colorInt >>> 16) & 0xff) / div);
		const g = Math.round(((colorInt >>> 8) & 0xff) / div); 
		const b = Math.round((colorInt & 0xff) / div);
		
		const result = `rgb(${r},${g},${b})`;
		
		// Cache result (limit cache size)
		if (this._colorCache.size > 100) {
			const firstKey = this._colorCache.keys().next().value;
			this._colorCache.delete(firstKey);
		}
		this._colorCache.set(cacheKey, result);
		
		return result;
	},
	/**
	 * @param {string} s
	 * @param {boolean} emptySymbol
	 * @returns {string}
	 */
	normalize(s, emptySymbol = true) {
		const cacheKey = `${s}_${emptySymbol}`;
		
		if (this._normalizeCache.has(cacheKey)) {
			return this._normalizeCache.get(cacheKey);
		}
		
		// Optimized: use a single pass with compiled regex
		const replacements = [
			[/（/g, "("],
			[/）/g, ")"],
			[/【/g, "["],
			[/】/g, "]"],
			[/。/g, ". "],
			[/；/g, "; "],
			[/：/g, ": "],
			[/？/g, "? "],
			[/！/g, "! "],
			[/、|，/g, ", "],
			[/'|'|′|＇/g, "'"],
			[/"|"/g, '"'],
			[/〜/g, "~"],
			[/·|・/g, "•"]
		];
		
		let result = s;
		for (const [regex, replacement] of replacements) {
			result = result.replace(regex, replacement);
		}
		
		if (emptySymbol) {
			result = result.replace(/[-/]/g, " ");
		}
		
		result = result.replace(/\s+/g, " ").trim();
		
		// Cache result (limit cache size to prevent memory leaks)
		if (this._normalizeCache.size > 200) {
			const firstKey = this._normalizeCache.keys().next().value;
			this._normalizeCache.delete(firstKey);
		}
		this._normalizeCache.set(cacheKey, result);
		
		return result;
	},
	/**
	 * Check if the specified string contains Han character.
	 *
	 * @param {string} s
	 * @returns {boolean}
	 */
	containsHanCharacter(s) {
		const hanRegex = /\p{Script=Han}/u;
		return hanRegex.test(s);
	},
	/**
	 * Singleton Translator instance for {@link toSimplifiedChinese}.
	 *
	 * @type {Translator | null}
	 */
	set translator(translator) {
		this._translatorInstance = translator;
	},
	_translatorInstance: null,
	/**
	 * Convert all Han characters to Simplified Chinese.
	 *
	 * Choosing Simplified Chinese makes the converted result more accurate,
	 * as the conversion from SC to TC may have multiple possibilities,
	 * while the conversion from TC to SC usually has only one possibility.
	 *
	 * @param {string} s
	 * @returns {Promise<string>}
	 */
	async toSimplifiedChinese(s) {
		// create a singleton Translator instance
		if (!this._translatorInstance) this.translator = new Translator("zh", true);

		// translate to Simplified Chinese
		// as Traditional Chinese differs between HK and TW, forcing to use OpenCC standard
		return this._translatorInstance.convertChinese(s, "t", "cn");
	},
	removeSongFeat(s) {
		return (
			s
				.replace(/-\s+(feat|with|prod).*/i, "")
				.replace(/(\(|\[)(feat|with|prod)\.?\s+.*(\)|\])$/i, "")
				.trim() || s
		);
	},
	removeExtraInfo(s) {
		return s.replace(/\s-\s.*/, "");
	},
	capitalize(s) {
		return s.replace(/^(\w)/, ($1) => $1.toUpperCase());
	},
	// Cache for language detection results
	_langDetectCache: new Map(),

	_cacheLanguageResult(cacheKey, result) {
		if (this._langDetectCache.size > 100) {
			const firstKey = this._langDetectCache.keys().next().value;
			this._langDetectCache.delete(firstKey);
		}
		this._langDetectCache.set(cacheKey, result);
	},

	detectLanguage(lyrics) {
		if (!Array.isArray(lyrics) || lyrics.length === 0) {
			// Debug logging
			if (window.lyricsPlusDebug) {
				console.log("detectLanguage: No lyrics provided", { lyrics });
			}
			return null;
		}

		// Create cache key from lyrics text
		const rawLyrics = lyrics[0]?.originalText ? 
			lyrics.map((line) => line?.originalText || "").join(" ") : 
			lyrics.map((line) => line?.text || "").join(" ");
			
		const cacheKey = rawLyrics.substring(0, 200); // Use first 200 chars as cache key
		
		if (this._langDetectCache.has(cacheKey)) {
			return this._langDetectCache.get(cacheKey);
		}

		const kanaRegex = /[\u3001-\u3003]|[\u3005\u3007]|[\u301d-\u301f]|[\u3021-\u3035]|[\u3038-\u303a]|[\u3040-\u30ff]|[\uff66-\uff9f]/gu;
		const hangulRegex = /(\S*[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+\S*)/g;
		const simpRegex =
			/[万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俣俦俨俩俪俭债倾偬偻偾偿傥傧储傩儿兑兖党兰关兴兹养兽冁内冈册写军农冢冯冲决况冻净凄凉凌减凑凛几凤凫凭凯击凼凿刍划刘则刚创删别刬刭刽刿剀剂剐剑剥剧劝办务劢动励劲劳势勋勐勚匀匦匮区医华协单卖卢卤卧卫却卺厂厅历厉压厌厍厕厢厣厦厨厩厮县参叆叇双发变叙叠叶号叹叽吁后吓吕吗吣吨听启吴呒呓呕呖呗员呙呛呜咏咔咙咛咝咤咴咸哌响哑哒哓哔哕哗哙哜哝哟唛唝唠唡唢唣唤唿啧啬啭啮啰啴啸喷喽喾嗫呵嗳嘘嘤嘱噜噼嚣嚯团园囱围囵国图圆圣圹场坂坏块坚坛坜坝坞坟坠垄垅垆垒垦垧垩垫垭垯垱垲垴埘埙埚埝埯堑堕塆墙壮声壳壶壸处备复够头夸夹夺奁奂奋奖奥妆妇妈妩妪妫姗姜娄娅娆娇娈娱娲娴婳婴婵婶媪嫒嫔嫱嬷孙学孪宁宝实宠审宪宫宽宾寝对寻导寿将尔尘尧尴尸尽层屃屉届属屡屦屿岁岂岖岗岘岙岚岛岭岳岽岿峃峄峡峣峤峥峦崂崃崄崭嵘嵚嵛嵝嵴巅巩巯币帅师帏帐帘帜带帧帮帱帻帼幂幞干并广庄庆庐庑库应庙庞废庼廪开异弃张弥弪弯弹强归当录彟彦彻径徕御忆忏忧忾怀态怂怃怄怅怆怜总怼怿恋恳恶恸恹恺恻恼恽悦悫悬悭悯惊惧惨惩惫惬惭惮惯愍愠愤愦愿慑慭憷懑懒懔戆戋戏戗战戬户扎扑扦执扩扪扫扬扰抚抛抟抠抡抢护报担拟拢拣拥拦拧拨择挂挚挛挜挝挞挟挠挡挢挣挤挥挦捞损捡换捣据捻掳掴掷掸掺掼揸揽揿搀搁搂搅携摄摅摆摇摈摊撄撑撵撷撸撺擞攒敌敛数斋斓斗斩断无旧时旷旸昙昼昽显晋晒晓晔晕晖暂暧札术朴机杀杂权条来杨杩杰极构枞枢枣枥枧枨枪枫枭柜柠柽栀栅标栈栉栊栋栌栎栏树栖样栾桊桠桡桢档桤桥桦桧桨桩梦梼梾检棂椁椟椠椤椭楼榄榇榈榉槚槛槟槠横樯樱橥橱橹橼檐檩欢欤欧歼殁殇残殒殓殚殡殴毁毂毕毙毡毵氇气氢氩氲汇汉污汤汹沓沟没沣沤沥沦沧沨沩沪沵泞泪泶泷泸泺泻泼泽泾洁洒洼浃浅浆浇浈浉浊测浍济浏浐浑浒浓浔浕涂涌涛涝涞涟涠涡涢涣涤润涧涨涩淀渊渌渍渎渐渑渔渖渗温游湾湿溃溅溆溇滗滚滞滟滠满滢滤滥滦滨滩滪漤潆潇潋潍潜潴澜濑濒灏灭灯灵灾灿炀炉炖炜炝点炼炽烁烂烃烛烟烦烧烨烩烫烬热焕焖焘煅煳熘爱爷牍牦牵牺犊犟状犷犸犹狈狍狝狞独狭狮狯狰狱狲猃猎猕猡猪猫猬献獭玑玙玚玛玮环现玱玺珉珏珐珑珰珲琎琏琐琼瑶瑷璇璎瓒瓮瓯电画畅畲畴疖疗疟疠疡疬疮疯疱疴痈痉痒痖痨痪痫痴瘅瘆瘗瘘瘪瘫瘾瘿癞癣癫癯皑皱皲盏盐监盖盗盘眍眦眬着睁睐睑瞒瞩矫矶矾矿砀码砖砗砚砜砺砻砾础硁硅硕硖硗硙硚确硷碍碛碜碱碹磙礼祎祢祯祷祸禀禄禅离秃秆种积称秽秾稆税稣稳穑穷窃窍窑窜窝窥窦窭竖竞笃笋笔笕笺笼笾筑筚筛筜筝筹签简箓箦箧箨箩箪箫篑篓篮篱簖籁籴类籼粜粝粤粪粮糁糇紧絷纟纠纡红纣纤纥约级纨纩纪纫纬纭纮纯纰纱纲纳纴纵纶纷纸纹纺纻纼纽纾线绀绁绂练组绅细织终绉绊绋绌绍绎经绐绑绒结绔绕绖绗绘给绚绛络绝绞统绠绡绢绣绤绥绦继绨绩绪绫绬续绮绯绰绱绲绳维绵绶绷绸绹绺绻综绽绾绿缀缁缂缃缄缅缆缇缈缉缊缋缌缍缎缏缐缑缒缓缔缕编缗缘缙缚缛缜缝缞缟缠缡缢缣缤缥缦缧缨缩缪缫缬缭缮缯缰缱缲缳缴缵罂网罗罚罢罴羁羟羡翘翙翚耢耧耸耻聂聋职聍联聵聽聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯虮雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闼閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼]/gu;
		const tradRegex =
			/[萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勣勳猛勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚呼嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場阪壞塊堅壇壢壩塢墳墜壟壟壚壘墾坰堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖怵懣懶懍戇戔戲戧戰戬戶紮撲扡執擴捫掃揚擾撫拋摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氲彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆糊溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢佘疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓著睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜矽碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聽聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯虮雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闼閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼]/gu;
		const hanziRegex = /\p{Script=Han}/gu;

		const cjkMatch = rawLyrics.match(
			new RegExp(`${kanaRegex.source}|${hanziRegex.source}|${hangulRegex.source}|${/\p{Unified_Ideograph}/gu.source}`, "gu")
		);

		if (!cjkMatch) {
			// Debug logging for non-CJK languages
			if (window.lyricsPlusDebug) {
				console.log("detectLanguage: No CJK characters found", { 
					rawLyrics: rawLyrics.substring(0, 100),
					lyricsLength: lyrics.length 
				});
			}
			// Return null instead of undefined for non-CJK languages
			this._cacheLanguageResult(cacheKey, null);
			return null;
		}

		const kanaCount = cjkMatch.filter((glyph) => kanaRegex.test(glyph)).length;
		const hanziCount = cjkMatch.filter((glyph) => hanziRegex.test(glyph)).length;
		const simpCount = cjkMatch.filter((glyph) => simpRegex.test(glyph)).length;
		const tradCount = cjkMatch.filter((glyph) => tradRegex.test(glyph)).length;

		const kanaPercentage = kanaCount / cjkMatch.length;
		const hanziPercentage = hanziCount / cjkMatch.length;
		const simpPercentage = simpCount / cjkMatch.length;
		const tradPercentage = tradCount / cjkMatch.length;

		if (cjkMatch.filter((glyph) => hangulRegex.test(glyph)).length !== 0) {
			const result = "ko";
			this._cacheLanguageResult(cacheKey, result);
			return result;
		}

		if (((kanaPercentage - hanziPercentage + 1) / 2) * 100 >= CONFIG.visual["ja-detect-threshold"]) {
			const result = "ja";
			this._cacheLanguageResult(cacheKey, result);
			return result;
		}

		const result = ((simpPercentage - tradPercentage + 1) / 2) * 100 >= CONFIG.visual["hans-detect-threshold"] ? "zh-hans" : "zh-hant";
		this._cacheLanguageResult(cacheKey, result);
		return result;
	},
	processTranslatedLyrics(translated, original) {
		return original.map((lyric, index) => ({
			startTime: lyric?.startTime || 0,
			// Keep as string so Pages can inject as HTML (furigana) or plain text
			text: String(translated[index] ?? ""),
			originalText: lyric?.text || "",
		}));
	},
	/** It seems that this function is not being used, but I'll keep it just in case it's needed in the future.*/
	processTranslatedOriginalLyrics(lyrics, synced) {
		const data = [];
		const dataSouce = {};

		for (const item of lyrics) {
			if (item && typeof item.startTime !== 'undefined') {
				dataSouce[item.startTime] = { translate: item.text || "" };
			}
		}

		for (const time in synced) {
			const syncedItem = synced[time];
			if (syncedItem && typeof time !== 'undefined') {
				dataSouce[time] = {
					...dataSouce[time],
					text: syncedItem.text || "",
				};
			}
		}

		for (const time in dataSouce) {
			const item = dataSouce[time];
			const lyric = {
				startTime: time || 0,
				text: this.rubyTextToOriginalReact(item.translate || item.text, item.text || item.translate),
			};
			data.push(lyric);
		}

		return data;
	},
	rubyTextToOriginalReact(translated, syncedText) {
		const react = Spicetify.React;
		return react.createElement("p1", null, [react.createElement("ruby", {}, syncedText, react.createElement("rt", null, translated))]);
	},
	rubyTextToReact(s) {
		const react = Spicetify.React;
		const rubyElems = s.split("<ruby>");
		const reactChildren = [];

		reactChildren.push(rubyElems[0]);
		for (let i = 1; i < rubyElems.length; i++) {
			const kanji = rubyElems[i].split("<rp>")[0];
			const furigana = rubyElems[i].split("<rt>")[1].split("</rt>")[0];
			reactChildren.push(react.createElement("ruby", null, kanji, react.createElement("rt", null, furigana)));

			reactChildren.push(rubyElems[i].split("</ruby>")[1]);
		}
		return react.createElement("p1", null, reactChildren);
	},
	rubyTextToHTML(s) {
		if (!s || typeof s !== "string") return "";
		// Allow only ruby-related tags we generate; escape others
		let out = s
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
		// Re-enable allowed ruby tags
		out = out
			.replace(/&lt;ruby&gt;/g, "<ruby>")
			.replace(/&lt;\/ruby&gt;/g, "</ruby>")
			.replace(/&lt;rt&gt;/g, "<rt>")
			.replace(/&lt;\/rt&gt;/g, "</rt>")
			.replace(/&lt;rp&gt;/g, "<rp>")
			.replace(/&lt;\/rp&gt;/g, "</rp>");
		return out;
	},
	formatTime(timestamp) {
		if (Number.isNaN(timestamp)) return timestamp.toString();
		let minutes = Math.trunc(timestamp / 60000);
		let seconds = ((timestamp - minutes * 60000) / 1000).toFixed(2);

		if (minutes < 10) minutes = `0${minutes}`;
		if (seconds < 10) seconds = `0${seconds}`;

		return `${minutes}:${seconds}`;
	},
	formatTextWithTimestamps(text, startTime = 0) {
		if (text.props?.children) {
			return text.props.children
				.map((child) => {
					if (typeof child === "string") {
						return child;
					}
					if (child.props?.children) {
						return child.props?.children[0];
					}
				})
				.join("");
		}
		if (Array.isArray(text)) {
			let wordTime = startTime;
			return text
				.map((word) => {
					wordTime += word.time;
					return `${word.word}<${this.formatTime(wordTime)}>`;
				})
				.join("");
		}
		return text;
	},
	convertParsedToLRC(lyrics, isBelow) {
		let original = "";
		let conver = "";

		if (isBelow) {
			for (const line of lyrics) {
				if (line) {
					const startTime = line.startTime || 0;
					original += `[${this.formatTime(startTime)}]${this.formatTextWithTimestamps(line.originalText || "", startTime)}\n`;
					conver += `[${this.formatTime(startTime)}]${this.formatTextWithTimestamps(line.text || "", startTime)}\n`;
				}
			}
		} else {
			for (const line of lyrics) {
				if (line) {
					const startTime = line.startTime || 0;
					original += `[${this.formatTime(startTime)}]${this.formatTextWithTimestamps(line.text || "", startTime)}\n`;
				}
			}
		}

		return {
			original,
			conver,
		};
	},
	convertParsedToUnsynced(lyrics, isBelow) {
		let original = "";
		let conver = "";

		if (isBelow) {
			for (const line of lyrics) {
				if (typeof line.originalText === "object") {
					original += `${line.originalText?.props?.children?.[0]}\n`;
				} else {
					original += `${line.originalText}\n`;
				}

				if (typeof line.text === "object") {
					conver += `${line.text?.props?.children?.[0]}\n`;
				} else {
					conver += `${line.text}\n`;
				}
			}
		} else {
			for (const line of lyrics) {
				if (typeof line.text === "object") {
					original += `${line.text?.props?.children?.[0]}\n`;
				} else {
					original += `${line.text}\n`;
				}
			}
		}

		return {
			original,
			conver,
		};
	},
	parseLocalLyrics(lyrics) {
		// Preprocess lyrics by removing [tags] and empty lines
		const lines = lyrics
			.replaceAll(/\[[a-zA-Z]+:.+\]/g, "")
			.trim()
			.split("\n");

		const syncedTimestamp = /\[([0-9:.]+)\]/;
		const karaokeTimestamp = /<([0-9:.]+)>/;

		const unsynced = [];

		const isSynced = lines[0].match(syncedTimestamp);
		const synced = isSynced ? [] : null;

		const isKaraoke = lines[0].match(karaokeTimestamp);
		const karaoke = isKaraoke ? [] : null;

		function timestampToMs(timestamp) {
			const [minutes, seconds] = timestamp.replace(/\[\]<>/, "").split(":");
			return Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
		}

		function parseKaraokeLine(line, startTime) {
			let wordTime = timestampToMs(startTime);
			const karaokeLine = [];
			const karaoke = line.matchAll(/(\S+ ?)<([0-9:.]+)>/g);
			for (const match of karaoke) {
				const word = match[1];
				const time = match[2];
				karaokeLine.push({ word, time: timestampToMs(time) - wordTime });
				wordTime = timestampToMs(time);
			}
			return karaokeLine;
		}

		for (const [i, line] of lines.entries()) {
			const time = line.match(syncedTimestamp)?.[1];
			let lyricContent = line.replace(syncedTimestamp, "").trim();
			const lyric = lyricContent.replaceAll(/<([0-9:.]+)>/g, "").trim();

			if (line.trim() !== "") {
				if (isKaraoke) {
					if (!lyricContent.endsWith(">")) {
						// For some reason there are a variety of formats for karaoke lyrics, Wikipedia is also inconsisent in their examples
						const endTime = lines[i + 1]?.match(syncedTimestamp)?.[1] || this.formatTime(Number(Spicetify.Player.data.item.metadata.duration));
						lyricContent += `<${endTime}>`;
					}
					const karaokeLine = parseKaraokeLine(lyricContent, time);
					karaoke.push({ text: karaokeLine, startTime: timestampToMs(time) });
				}
				isSynced && time && synced.push({ text: lyric || "♪", startTime: timestampToMs(time) });
				unsynced.push({ text: lyric || "♪" });
			}
		}

		return { synced, unsynced, karaoke };
	},
	processLyrics(lyrics) {
		return lyrics
			.replace(/　| /g, "") // Remove space
			.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~？！，。、《》【】「」]/g, ""); // Remove punctuation
	},
	/**
	 * Determines if a color is light or dark.
	 * @param {string} color - The color in "rgb(r,g,b)" format.
	 * @returns {boolean} - True if the color is light, false if dark.
	 */
	isColorLight(color) {
		const [r, g, b] = color.match(/\d+/g).map(Number);
		// Using the luminance formula
		const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
		return luminance > 128;
	},
};
