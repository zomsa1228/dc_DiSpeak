var bouyomiConnect = require("./files/bouyomiConnect.js");
var Discord = require("discord.js");
var client = new Discord.Client();
var fs = require("fs");
var fileName = "setting.json";
var fileName_default = "setting_default.json";
// 設定ファイルの読み込み
readFile();
// 更新ボタン
function reload(){
  location.reload();
}
// 日時の0詰め https://tagamidaiki.com/javascript-0-chink/
function toDoubleDigits(num){
  num += "";
  if (num.length === 1) {
    num = `0${num}`;
  }
  return num;
}
// 正規表現
function replaceNewline(str) {
  var strRep = str.replace(/\n/g, "|");
  var strReg = new RegExp(`^(${strRep})$`);
  return strReg;
}
// 配列の空要素除去filter https://qiita.com/akameco/items/1636e0448e81e17e3646
function filterArray(ary){
  var ary = ary.filter(Boolean);
  return ary;
}
function logProcess(time, text){
  var hour = toDoubleDigits(time.getHours());
  var min  = toDoubleDigits(time.getMinutes());
  var sec  = toDoubleDigits(time.getSeconds());
  var textLog = text.replace(/\r\n|\n|\r/,"");
  var textLog = `[${hour}:${min}:${sec}] ${textLog}`;
  var pLog = document.createElement("p"); // 要素作成
  pLog.textContent = textLog; // 要素にテキストを設定
  document.getElementById("log").prepend(pLog); // 要素を追加
  // ログの削除
  var logP = document.querySelectorAll("#log p");
  var maxLine = 50; // 表示される最大行数
  if(logP.length > maxLine){ // 行数を超えたら古いログを削除
    for(var i=maxLine,n=logP.length; i<n; i++){
      logP[i].remove();
    }
  }
}
function bouyomiDisabled(){
  document.getElementById("bouyomi_status").innerHTML =
    `<input type="button" class="button button-disabled" name="bouyomi_start" value="読み上げ開始">`+
    `<p class="comment">「画面を更新」してから「読み上げ開始」してください。</p>`;
}
function bouyomiStart(){
  var d_token = document.querySelector('input[name="d_token"]').value;
  var startTime = new Date();
  var startMess = "読み上げを開始しています。";
  var startText = `<info> ${startMess}`;
  document.getElementById("bouyomi_status").innerHTML =
    `<input type="button" class="button button-disabled" name="bouyomi_start" value="読み上げ開始">`+
    `<p class="comment">${startMess}</p>`;
  logProcess(startTime, startText);
  //client.login(d_token);
  client.login(d_token).catch(function(error){
    errorLog(error.message);
  });
}
function bouyomiProcess(time, text){
  var bouyomiServer = {};
  var textBym = text.replace(/<[\s\S]*?>\s/,"");
  var ip   = document.querySelector('input[name="b_ip"]').value;
  var port = document.querySelector('input[name="b_port"]').value;
  bouyomiServer.host = ip;
  bouyomiServer.port = port;
  bouyomiConnect.sendBouyomi(bouyomiServer, textBym);
}
// ファイルを表示
function readFile(){
  fs.readFile(`${fileName}`, "utf8", (error, setting) => {
    if(error){
      errorHandling(error);
      return;
    }
    var settingAry = JSON.parse(setting);
    for(key in settingAry){
      var settingAryKey = settingAry[key];
      switch(key){
        // Discord 基本設定
        case "d_token":        document.querySelector('input[name="d_token"]').value = settingAryKey; break;
        case "d_user":         document.getElementById("d_user").d_user[settingAryKey].checked = true; break;
        // Discord DM設定
        case "d_dm":           document.getElementById("d_dm").d_dm[settingAryKey].checked = true; break;
        case "d_dm_list":      document.getElementById("d_dm_list").d_dm_list[settingAryKey].checked = true; break;
        case "d_dm_list_b":    document.querySelector('textarea[name="d_dm_list_b"]').value = settingAryKey.join("\n"); break;
        case "d_dm_list_w":    document.querySelector('textarea[name="d_dm_list_w"]').value = settingAryKey.join("\n"); break;
        // Discord サーバ設定
        case "d_sv":           document.getElementById("d_sv").d_sv[settingAryKey].checked = true; break;
        case "d_sv_nick":      document.getElementById("d_sv_nick").d_sv_nick[settingAryKey].checked = true; break;
        case "d_sv_sv_list":   document.getElementById("d_sv_sv_list").d_sv_sv_list[settingAryKey].checked = true; break;
        case "d_sv_sv_list_b": document.querySelector('textarea[name="d_sv_sv_list_b"]').value = settingAryKey.join("\n"); break;
        case "d_sv_sv_list_w": document.querySelector('textarea[name="d_sv_sv_list_w"]').value = settingAryKey.join("\n"); break;
        case "d_sv_ch_list":   document.getElementById("d_sv_ch_list").d_sv_ch_list[settingAryKey].checked = true; break;
        case "d_sv_ch_list_b": document.querySelector('textarea[name="d_sv_ch_list_b"]').value = settingAryKey.join("\n"); break;
        case "d_sv_ch_list_w": document.querySelector('textarea[name="d_sv_ch_list_w"]').value = settingAryKey.join("\n"); break;
        // 棒読みちゃん 基本設定
        case "b_ip":           document.querySelector('input[name="b_ip"]').value = settingAryKey; break;
        case "b_port":         document.querySelector('input[name="b_port"]').value = settingAryKey; break;
      }
    }
    var readTime = new Date();
    var readText = "<info> 設定ファイルを読み込みました。";
    logProcess(readTime, readText);
  });
}
// ファイルへ書き込み
function writeFile(){
  var settingAry = {};
  // Discord 基本設定
  settingAry.d_token        = document.querySelector('input[name="d_token"]').value;
  settingAry.d_user         = Number(document.getElementById("d_user").d_user.value);
  // Discord DM設定
  settingAry.d_dm           = Number(document.getElementById("d_dm").d_dm.value);
  settingAry.d_dm_list      = Number(document.getElementById("d_dm_list").d_dm_list.value);
  settingAry.d_dm_list_b    = filterArray(document.querySelector('textarea[name="d_dm_list_b"]').value.replace(/[ 　\t]/g,"").split("\n"));
  settingAry.d_dm_list_w    = filterArray(document.querySelector('textarea[name="d_dm_list_w"]').value.replace(/[ 　\t]/g,"").split("\n"));
  // Discord サーバ設定
  settingAry.d_sv           = Number(document.getElementById("d_sv").d_sv.value);
  settingAry.d_sv_nick      = Number(document.getElementById("d_sv_nick").d_sv_nick.value);
  settingAry.d_sv_sv_list   = Number(document.getElementById("d_sv_sv_list").d_sv_sv_list.value);
  settingAry.d_sv_sv_list_b = filterArray(document.querySelector('textarea[name="d_sv_sv_list_b"]').value.replace(/[ 　\t]/g,"").split("\n"));
  settingAry.d_sv_sv_list_w = filterArray(document.querySelector('textarea[name="d_sv_sv_list_w"]').value.replace(/[ 　\t]/g,"").split("\n"));
  settingAry.d_sv_ch_list   = Number(document.getElementById("d_sv_ch_list").d_sv_ch_list.value);
  settingAry.d_sv_ch_list_b = filterArray(document.querySelector('textarea[name="d_sv_ch_list_b"]').value.replace(/[ 　\t]/g,"").split("\n"));
  settingAry.d_sv_ch_list_w = filterArray(document.querySelector('textarea[name="d_sv_ch_list_w"]').value.replace(/[ 　\t]/g,"").split("\n"));
  // 棒読みちゃん 基本設定
  settingAry.b_ip           = document.querySelector('input[name="b_ip"]').value;
  settingAry.b_port         = document.querySelector('input[name="b_port"]').value;
  var setting = JSON.stringify(settingAry, null, 4);
  fs.writeFile(`${fileName}`, setting, (error) => {
    if(error){
      errorHandling(error);
      return;
    }
    var writTime = new Date();
    var writMess = "設定ファイルを保存しました。";
    var writText = `<info> ${writMess}`;
    document.getElementById("save_information").textContent = writMess;
    logProcess(writTime, writText);
  });
}
function createFile(){
  fs.readFile(`${__dirname}/files/${fileName_default}`, "utf8", (error, setting) => {
    if(error){return;}
    fs.writeFile(`${fileName}`, setting, (error) => {
      if(error){return;}
      var createTime = new Date();
      var createText = "<info> 設定ファイルを作成しました。「設定を編集」より設定を行ってください。"
      logProcess(createTime, createText);
      readFile();
    });
  });
}
function errorHandling(error){
  var errorTime = new Date(),
    errorCode = error.code,
    errorMess = (function(){
      if(errorCode.match(/ENOENT/)) return      "設定ファイルが存在しませんでした。";
      if(errorCode.match(/EPERM|EBUSY/)) return `設定ファイルを保存できませんでした。${fileName}を開いている場合は閉じてください。`;
    })(),
    errorText = `<info> ${errorMess}`;
  logProcess(errorTime, errorText);
  if(errorCode.match(/ENOENT/)){
    createFile();
  }
  return;
}
client.on("ready", () => {
  var readyTime    = new Date();
  var readyMess = "読み上げを開始しました。";
  var readyText = `<info> ${readyMess}`;
  document.querySelector("#bouyomi_status p").textContent = readyMess;
  logProcess(readyTime, readyText);
  bouyomiProcess(readyTime, readyText);
});
client.on("message", message => {
  console.log(message);
  // Discord 基本設定
  var d_user         = document.getElementById("d_user").d_user.value;
  // Discord DM設定
  var d_dm           = document.getElementById("d_dm").d_dm.value;
  var d_dm_list      = document.getElementById("d_dm_list").d_dm_list.value;
  var d_dm_list_b    = document.querySelector('textarea[name="d_dm_list_b"]').value;
  var d_dm_list_w    = document.querySelector('textarea[name="d_dm_list_w"]').value;
  // Discord サーバ設定
  var d_sv           = document.getElementById("d_sv").d_sv.value;
  var d_sv_nick      = document.getElementById("d_sv_nick").d_sv_nick.value;
  var d_sv_sv_list   = document.getElementById("d_sv_sv_list").d_sv_sv_list.value;
  var d_sv_sv_list_b = document.querySelector('textarea[name="d_sv_sv_list_b"]').value;
  var d_sv_sv_list_w = document.querySelector('textarea[name="d_sv_sv_list_w"]').value;
  var d_sv_ch_list   = document.getElementById("d_sv_ch_list").d_sv_ch_list.value;
  var d_sv_ch_list_b = document.querySelector('textarea[name="d_sv_ch_list_b"]').value;
  var d_sv_ch_list_w = document.querySelector('textarea[name="d_sv_ch_list_w"]').value;
  // 自身の通知を読むか
  var user_id = client.user.id;
  var authorId = message.author.id;
  if(d_user=="1" && user_id==authorId){return;}
  // 使用するID
  // DM SV 判定   message.channel.type
  // DM UserId    message.channel.recipient.id
  // SV ServerID  message.channel.guild.id
  // SV ChannelID message.channel.id
  // 使用しないID
  // DM UserId    message.author.id
  // SV ServerID  message.member.guild.id
  // SV ServerID  message.mentions._guild.id
  // DM・サーバを読む・読まないの処理
  var channelType = message.channel.type;
  if(channelType=="dm"   && d_dm=="1"){return;}else
  if(channelType=="text" && d_sv=="1"){return;}
  // ホワイトリスト・ブラックリストの処理
  // 1.  DMかサーバかを確認                channelType
  // 2.  リスト設定がどっちかを確認        d_dm_list,   d_sv_sv_list,   d_sv_ch_list   0ブラックリスト, 1ホワイトリスト
  // 3-1.ブラックリストのIDならreturn      d_dm_list_b, d_sv_sv_list_b, d_sv_ch_list_b
  // 3-2.ホワイトリスト以外のIDならreturn  d_dm_list_w, d_sv_sv_list_w, d_sv_ch_list_w
  if(channelType == "dm"){
    var dmUserId = message.channel.recipient.id;
    if(d_dm_list=="0" &&  dmUserId.match(replaceNewline(d_dm_list_b))){return;}else
    if(d_dm_list=="1" && !dmUserId.match(replaceNewline(d_dm_list_w)) && d_dm_list_w.length>10){return;}
  }else if(channelType == "text"){
    var svServerId  = message.channel.guild.id;
    var svChannelId = message.channel.id;
    if(d_sv_sv_list=="0" &&  svServerId.match(replaceNewline(d_sv_sv_list_b))){return;}else
    if(d_sv_sv_list=="1" && !svServerId.match(replaceNewline(d_sv_sv_list_w)) && d_sv_sv_list_w.length>10){return;}else
    if(d_sv_ch_list=="0" &&  svChannelId.match(replaceNewline(d_sv_ch_list_b))){return;}else
    if(d_sv_ch_list=="1" && !svChannelId.match(replaceNewline(d_sv_ch_list_w)) && d_sv_ch_list_w.length>10){return;}
  }
  // 名前の処理
  var nickname = (function() {
    if(channelType=="text" && message.member!==null) return message.member.nickname;
    return "";
  })();
  var username = (function() {
    // d_sv_nickが無効の時、DMの時、nicknameが無いとき(DM)、サーバで未設定のとき
    if(d_sv_nick=="1" || channelType=="dm" || nickname=="" || nickname===null) return message.author.username;
    return nickname;
  })();
  // サーバー名
  var guildName = (function() {
    if(channelType == "dm") return "dm";
    return message.channel.guild.name;
  })();
  // チャットの内容
  var content = message.content;
  var text = `<${guildName}> ${username} ${content}`;
  // チャットの時間
  var utc  = message.createdTimestamp; // UTC
  var jst  = utc + (60 * 60 * 9); // +9hour
  var time = new Date(jst);
  // 処理
  logProcess(time, text);
  bouyomiProcess(time, text);
});
// エラーが起きたときの処理
process.on("uncaughtException", (error) => {
  var error = String(error);
  errorLog(error);
});
// エラーをログへ書き出す
function errorLog(error){
  console.log(error);
  var errorMess = (function(){
      if(error.match(/Error: connect ECONNREFUSED/)) return "棒読みちゃんが起動していません。";
      if(error.match(/Incorrect login details were provided/)) return "トークンが間違えています。";
      return error;
    })();
  var errTime = new Date();
  var errText = `<error> ${errorMess}`;
  logProcess(errTime, errText);
  document.getElementById("bouyomi_status").innerHTML =
    `<input type="button" class="button" name="setting_save" value="画面を更新" onclick="reload();">`+
    `<p class="comment">エラーが発生しました。</p>`;
}