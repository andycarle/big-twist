import { Request } from "http"
import SecureSocket from "securesocket";
import config from "mc/config";

const HOST = config.API_HOST;
const PATH = "/words/";
const FREQ_MIN = 5;

const ANAGRAM_HOST = "scrabble.now.sh";
const ANAGRAM_PATH = "/api";

const API_RETRY = 3;
//https://scrabble.now.sh/api?letters=qwerty


const headers = ["x-rapidapi-key", config.API_KEY, "x-rapidapi-host", config.API_HOST];

class WordsRound {

	constructor(options){
		if (config.API_KEY === "SECRET") throw new Error("Fill in API key in manifest.");
		this.length = options.bigWord;
		this.minimum = options.minimumWord;
		this.frequency = options.minimumFrequency ?? FREQ_MIN;
		this.lists = {};
	}

	checkWord(word){
		let done = false;
		let remaining = this.list.indexOf(word);
		const length = word.length;
		const spot = this.lists[length].indexOf(word); 
		if (spot === -1) return false;
		if (remaining === -1) return "guessed";

		delete this.list[remaining];
		if (this.list.length == 0) done = true;

		return {length, spot, done};
	}

	async startRound(){
		let word, errors = 0;

		findWord: while (true){
			try{
				word = await this.getRandom(this.length);
			}catch(e){
				errors++;
				if (errors >= API_RETRY){
					application.delegate("onError");
					return;
				} 
				continue findWord;
			}
			
			trace(`word is: ${word}\n`);
			if (word.indexOf("-") !== -1 || word.indexOf(" ") !== -1 || word.length != this.length)
				continue findWord;
			
			for (let i = 0; i < word.length; i++) {
				let code = word.charCodeAt(i);
				if (code < 97 || code > 122) {
					continue findWord;
				}
			}
			break;
		}
		
		this.word = word;
		// let regex = WordsRound.getRegex(word);
		let wordList;
		errors = 0;
		while(wordList === undefined){
			try{
				wordList = await this.getList(word, this.minimum);
			}catch(e){
				wordList = undefined;
				errors++;
				if (errors >= API_RETRY){
					application.delegate("onError");
					return;
				} 
			}
		}
		 
		this.list = wordList;
		this.lists = {};
		for (let i in this.list){
			const word = this.list[i];
			trace(`${word}\n`);
			const len = word.length;
			if (!this.lists[len]){
				this.lists[len] = new Array();
			}
			this.lists[len].push({word, guessed: false});
		}

		let o = {};
		for (let i in this.lists){
			o[i] = this.lists[i].length;
		}

		application.delegate("onRoundBegin", word, o);
	}

	static getRegex(word){
		let o = {};
		let str = "";
		for (let c = 0; c < word.length; c++){
			const char = word.charAt(c);
			if (o[char]){
				o[char]++;
			}else{
				o[char] = 1;
				str += char;
			}
		}
		let regex = "^";
		for (let i in o){
			const char = i;
			const num = o[i];
			regex += `(?!(?:[^${char}]*+${char}){${num + 1}})`;
		}
		regex += `[${str}]+$`;
		trace(`regex is: ${regex}\n`);
		return regex;
	}

	async getList(word, min, callback){
		let path = ANAGRAM_PATH;
		path += WordsRound.queryStringFromObject({
			letters: word
		});

		trace(`path: ${path}\n`);

		return new Promise((resolve, reject) => {
			let request = new Request({
				host: ANAGRAM_HOST, response: String, port: 443, Socket: SecureSocket, path, secure: {protocolVersion: 0x303}
			});
			request.callback = (message, value) => {
				if (message === 5){
					const array = JSON.parse(value);
					let longOnly = array.filter(word => word.length >= min);
					if (!longOnly.includes(word)) longOnly.push(word);
					longOnly.sort((a,b)=>{
						if (a.length < b.length) return -1;
						if (b.length < a.length) return 1;
						if (a < b) return -1;
						if (b < a) return 1;
						return 0;
					})
					resolve(longOnly);
				}else if (message < 0){
					reject(-1);
				}
			}
		});
	}

	async getRandom(length, callback){
		let path = PATH;
		path += WordsRound.queryStringFromObject({
			letters: length,
			frequencyMin: this.frequency,
			random: "true"
		})

		trace(`path is ${path}\n`);

		return new Promise((resolve, reject) => {
			let request = new Request({
				host: HOST, response: String, port: 443, Socket: SecureSocket, headers, path
			});
			request.callback = function (message, value) {
				if (5 === message){
					const obj = JSON.parse(value);
					const result  = obj.word.toLowerCase();
					resolve(result);
				}else if (message < 0){
					reject(-1);
				}
			}
		});
	}

	static traceInfo(word){
		let path = PATH;
		path += word;
		let request = new Request({
			host: HOST, response: String, port: 443, Socket: SecureSocket, headers, path
		});
		request.callback = (message, value, etc) => {
			if (message === 5) {
				trace(`${value}\n`);
			}
		}	
	}

	static queryStringFromObject(dictionary){
		let string = "?";
		let first = true;
		for (let i in dictionary){
			if (!first) string += "&";
			first = false;
			string += i + "=" + dictionary[i];
		}
		return string;
	}

}

export default WordsRound;