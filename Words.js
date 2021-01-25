import { Request } from "http"
import SecureSocket from "securesocket";
import config from "mc/config";


const HOST = config.API_HOST;
const PATH = "/words/";
const FREQ_MIN = 5;

const ANAGRAM_HOST = "scrabble.now.sh";
const ANAGRAM_PATH = "/api";

//https://scrabble.now.sh/api?letters=qwerty


const headers = ["x-rapidapi-key", config.API_KEY, "x-rapidapi-host", config.API_HOST];

class WordsRound {

	constructor(options){
		this.length = options.bigWord;
		this.minimum = options.minimumWord;
	}

	startRound(callback){
		this.getRandom(this.length, word => {
			trace(`word is: ${word}\n`);
			this.word = word;
			// let regex = WordsRound.getRegex(word);
			this.getList(word, this.minimum, result => {
				this.list = result;
				let o = {};
				for (let i in result){
					const word = result[i];
					const len = word.length;
					if (o[len]){
						o[len]++;
					}else{
						o[len] = 1;
					}
				}
				callback(this.word, o)
			});
		});
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

	getList(word, min, callback){
		let path = ANAGRAM_PATH;
		path += WordsRound.queryStringFromObject({
			letters: word
		});

		trace(`path: ${path}\n`);
		let request = new Request({
			host: ANAGRAM_HOST, response: String, port: 443, Socket: SecureSocket, path, secure: {protocolVersion: 0x303}
		});
		request.callback = (message, value, etc) => {
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
				callback(longOnly);
			}
		}
	}

	getRandom(length, callback){
		let path = PATH;
		path += WordsRound.queryStringFromObject({
			letters: length,
			frequencymin: FREQ_MIN,
			random: "true"
		})

		let request = new Request({
			host: HOST, response: String, port: 443, Socket: SecureSocket, headers, path
		});
		request.callback = (message, value, etc) => {
			if (message === 5){
				const obj = JSON.parse(value);
				callback(obj.word);
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