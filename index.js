var express = require('express');
var app = express();
const axios = require('axios');
var bodyParser = require("body-parser");
var Tesseract = require('tesseract.js');
var fs = require('fs');
var cors = require("cors");
var gm = require('gm');
var const_keys = require('./const.js');
var app_keys = const_keys.app_keys;

var screenshot = require('screenshot-desktop');


app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cors());

app.post('/myBot/scanv1.1/', function(req, res){
  console.log("got body");
  getQuestion2(function(err, result){
    if(err){
      res.json({
        success:false,
        result
      })
    } else{
      console.log("got anser in api ");
      res.json({
        success:true,
        result
      })
    }
  })
})


function getQuestion(callback){
  screenshot({ filename: 'shot.jpg' }).then((img_url) => {
    console.log("got screenshot");
    let url = __dirname + '/shot.jpg';
    let x = '1200';
    let y = '250';
    let width = '448';
    let height = '500';
    gm(url)
      .quality(100)
      .crop(width, height, x, y)
      .write('answers.jpg', function (err) {
        if (!err) {
          console.log("Answers resized");
          let img_url = __dirname + '/ice_screenshot_20190803-223427.png';
          gm(img_url)
           .magnify()
           .write('magnified_answers.png', function (err) {
             console.log("done magnifier");
             let img_url2 = __dirname + '/magnified_answers.png';
             Tesseract.recognize(img_url2)
             .progress(function  (p) {
               // console.log('progress', p)
             })
             .then(function (result) {
               let arr = result.text.split(/\r\n|\n|\r/)
               var filtered = arr.filter(function (el) {
                 return el != "";
               });
               let options = filtered.slice(filtered.length-3);
               let question = filtered.slice(0, filtered.length-3).join(' ');
               console.log("got arr ", options);
               console.log("question", question);
               getAnsweres(question, options, function(err, final_result){
                 if(err){
                   callback(final_result);
                 } else{
                   console.log("got anser", final_result);
                   callback(null,final_result);
                 }
               })
              })
           })

        } else {
          console.log(err);
          callback({

          }, null);
          console.log("got error");
        }
      });
    // created in current working directory named shot.png
  });
}

function getQuestion2(callback){
    console.log("reading question");
    let img_url = __dirname + '/pic.png';
    gm(img_url)
     .magnify()
     .write('magnified_answers.png', function (err) {
       console.log("done magnifier");
       let img_url2 = __dirname + '/magnified_answers.png';
       Tesseract.recognize(img_url2)
       .progress(function  (p) {
         // console.log('progress', p)
       })
       .then(function (result) {
         let arr = result.text.split(/\r\n|\n|\r/)
         var filtered = arr.filter(function (el) {
           return el != "";
         });
         let options = filtered.slice(filtered.length-3);
         let question = filtered.slice(0, filtered.length-3).join(' ');
         console.log("got arr ", options);
         console.log("question", question);
         getAnsweres(question, options, function(err, final_result){
           if(err){
             callback(final_result);
           } else{
             console.log("got anser", final_result);
             callback(null,final_result);
           }
         })
        })
     })
}

function getQuestionWithoutMagnify(callback){
    console.log("done magnifier");
    let img_url2 = __dirname + '/pic.png';
    Tesseract.recognize(img_url2)
    .progress(function  (p) {
      // console.log('progress', p)
    })
    .then(function (result) {
      let arr = result.text.split(/\r\n|\n|\r/)
      var filtered = arr.filter(function (el) {
        return el != "";
      });
      let options = filtered.slice(filtered.length-3);
      let question = filtered.slice(0, filtered.length-3).join(' ');
      console.log("got arr ", options);
      console.log("question", question);
      getAnsweres(question, options, function(err, final_result){
        if(err){
          callback(final_result);
        } else{
          console.log("got anser", final_result);
          callback(null,final_result);
        }
      })
     })
}

console.log("got your app running");
//
// // let img_url = __dirname + '/ques.jpg';



// let img_url = __dirname + '/full_ques2.jpg';
// Tesseract.recognize(img_url)
// .progress(function  (p) { console.log('progress', p)    })
// .then(function (result) {
//   // console.log('result', result)
//   console.log("result",result.text);
//   let arr = result.text.split(/\r\n|\n|\r/)
//   var filtered = arr.filter(function (el) {
//     return el != "";
//   });
//   console.log("filtered is ", filtered);
//   let options = filtered.slice(filtered.length-3);
//   let question = filtered.slice(0, filtered.length-3).join(' ');
//   console.log("got arr ", options);
//   console.log("question", question);
//   getAnsweres(question, options, function(final_result){
//     console.log("got anser", final_result);
//   })
//  })


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSearchableText(str){
  // first chekc is it which of these wala question
  let str_lowercase = str.toLowerCase();

  let isWhichofTheseQuestion = false;
  let count = 0
  const_keys.list_keywords.findIndex((each_keyword)=>{
    if(str_lowercase.includes(each_keyword))count++;
  })

  if(count == const_keys.list_keywords.length){
    isWhichofTheseQuestion = true;
  }

  let isNotQuestion = const_keys.not_keywords.findIndex((each_keyword)=>{
    return str_lowercase.includes(each_keyword);
  })

  // filter the question
  // remove not keywords
  const_keys.not_keywords.map((keyword)=>{
    str_lowercase = str_lowercase.replace(keyword, ' ');
  })

  // remove list keywords keywords
  // const_keys.list_keywords.map((keyword)=>{
  //   str_lowercase = str_lowercase.replace(keyword, ' ');
  // })

  // remove list keywords keywords
  const_keys.banded.map((keyword)=>{
    str_lowercase = str_lowercase.replace(keyword, ' ');
  })

  str_lowercase = str_lowercase.replace(' lm ', 'film');
  str_lowercase = str_lowercase.replace(' lms ', 'film');
  str_lowercase = str_lowercase.replace(' rst ', 'first');


  str_lowercase = str_lowercase.replace(/ {1,}/g," ").trim();

  console.log("final searchText is ", str_lowercase);
  let flag = isNotQuestion >= 0 ? true:false;
  return {final_question:str_lowercase, isNotQuestion:flag};
}


function getAnsweres(ques, options, callback){
  let index = getRandomInt(1, 5);
  let searchText = ques.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  let str_arr = searchText.split(" ");


  if(!isNaN(str_arr[0]) && Number(str_arr[0]) <= 10){
    str_arr = str_arr.slice(1, str_arr.length);
    searchText = str_arr.join(" ");
  }

  console.log("*************index is ", index);
  let obj = getSearchableText(searchText);
  searchText = obj.final_question;
  const api_key = app_keys[index].api_key;
  const cx = app_keys[index].cx;
  // remove all the escape character from the string
  let option1 = options[0];
  let option2 = options[1];
  let option3 = options[2];
  let op1_count = 0;
  let op2_count = 0;
  let op3_count = 0;

  const url = "https://www.googleapis.com/customsearch/v1?key="+api_key+ "&cx="+ cx +"&q="+searchText;
    axios.get(url)
    .then(response => {
      let temp = JSON.parse(JSON.stringify(response, getCircularReplacer()));

      temp = JSON.parse(JSON.stringify(temp, null,'\n'));
      // console.log("got response from api ", temp);
      if(temp.data && temp.data.items){
        temp.data.items.map((each_item)=>{
          op1_count += getCount(each_item.title, option1);
          op1_count += getCount(each_item.snippet, option1);

          op2_count += getCount(each_item.title, option2);
          op2_count += getCount(each_item.snippet, option2);

          op3_count += getCount(each_item.title, option3);
          op3_count += getCount(each_item.snippet, option3);
        })
      }
      callback(null,{
        success:true,
        results:{
          question:ques,
          options:options,
          op1_count,
          op2_count,
          op3_count,
          temp,
          isNotQuestion:obj.isNotQuestion
        },
        // temp
      })
    })
    .catch(error => {
      console.log("got error", error);

      callback({
        question:ques,
        options:options,
        success:false,
        // error:error
      }, null)
    });
}


app.get('/', function(req, res){
   res.send("Hello world!");
});



app.post('/test-post', function(req, res){
  console.log("got body is ", req.body);
  let question = req.body.question;
  let options = req.body.options;
  getAnsweres(question, options, function(err, final_result){
    if(err){
      res.json(final_result);
    } else{
      console.log("got anser", final_result);
      res.json(null,final_result);
    }
  })
})

app.post('/get-result2', function(req, res){
  let myImage = req.body.data;
  getAnsweres()
  res.json({
    success:true
  })
})

app.post('/get-result', function(req, res){
  // let text = req.query.text;
  const api_key = 'AIzaSyAssjTQErTzm9UMpBPwP3K7gMBKMjjog-k';
  const cx = '001013610542069346626:zsnxsnyxcvy'
  let searchText = req.body.ques;
  let option1 = req.body.option1;
  let option2 = req.body.option2;
  let option3 = req.body.option3;
  let op1_count = 0;
  let op2_count = 0;
  let op3_count = 0;

  const url = "https://www.googleapis.com/customsearch/v1?key="+api_key+ "&cx="+ cx +"&q="+searchText;


    axios.get(url)
    .then(response => {
      let temp = JSON.parse(JSON.stringify(response, getCircularReplacer()));
      temp = JSON.parse(JSON.stringify(temp, null,'\n'));
      // console.log("got response from api ", temp);
      if(temp.data && temp.data.items){
        temp.data.items.map((each_item)=>{
          op1_count += getCount(each_item.title, option1);
          op1_count += getCount(each_item.snippet, option1);

          op2_count += getCount(each_item.title, option2);
          op2_count += getCount(each_item.snippet, option2);

          op3_count += getCount(each_item.title, option3);
          op3_count += getCount(each_item.snippet, option3);
        })
      }
      res.send({
        success:true,
        results:{
          "1":{option1,op1_count},
          "2":{option2,op2_count},
          "3":{option3,op3_count}
        },
        temp
      })
    })
    .catch(error => {
      console.log("got error", error);
      res.send({
        success:false,
        error:error
      })
    });
});



function getCount(main_str, sub_str)
    {
    main_str += '';
    sub_str += '';
    main_str = main_str.toUpperCase();
    sub_str = sub_str.toUpperCase();

    if (sub_str.length <= 0)
    {
        return 0;
    }

       subStr = sub_str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       // console.log("final option si =--->  ", subStr);
       let main_str1 = main_str.replace(/(\r\n|\n|\r|\\n)/gm, ' ');
       // console.log("main str", main_str1);
       return (main_str1.match(new RegExp(` ${subStr}`, 'gi')) || []).length;
       // return (r.match(/Geeks/g)).length;

       // var r = main_str1.indexOf(` ${subStr}`);
       // var c = 0;
       // while (r != -1) {
       //   c++;
       //   r = main_str1.indexOf(` ${subStr}`, r + 1);
       // }
       // return c;
       // return (main_str1.match(/`${subStr}`/g) || []).length;
    }


const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

app.listen(8000);
