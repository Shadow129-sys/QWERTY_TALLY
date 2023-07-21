const axios = require('axios');
const URL = "https://api.quotable.io/quotes/random?limit=15&minLength=100&maxLength=140"

// mode = 0, Easy | mode = 1, Medium | mode = 2, Hard
const Mode_Based = (results, mode = 0) => {
    if(mode!==2)results = results.replace("."," ").replace(","," ").replace(/\s+/g, ' ');
    if(mode===0){
        results = results.toLowerCase().split("");
        results = results.filter(e => ((e>='a' && e<='z') || e===' ')).join("");
    }else if(mode===1){
        results = results.split("");
        results = results.filter(e => ((e>='a' && e<='z') || e===' ' || (e>='A' && e<='Z'))).join("");
    }
    return results;
}

const getQuotes = async (mode = 0) => {
    try{
        let results = await axios(URL);
        results = results.data.map(e => e.content.trim()).join("");
        results = Mode_Based(results, mode);
        return results;
    }catch(err){ 
        console.log(err);
        return "";
    }
};

const getSentence = async (mode = 0) => {
    const r = await getQuotes(mode);
    return r;
};

module.exports = getSentence;