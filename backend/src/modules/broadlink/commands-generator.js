/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////// Credit: https://github.com/dimagoltsman. /////////////////////////////////////////////////////////////////////////
////// Copy from https://github.com/dimagoltsman/Random-Broadlink-RM-Code-Generator/blob/master/generator.js ////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var HIGH_BIT = "240d";
var LOW_BIT  = "0d24";
var BITS_ARRAY = [HIGH_BIT, LOW_BIT];
var RF433 = "b2";
var RF315 = "d7";
var FOOTER = "0c00016f00000000";
var REPEATS = "0c";
var LONG_REPEAT = "5c";
var BYTES = 24;
var DATA_LENGTH = "3400";



String.prototype.rightJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
        fill[fill.length] = char;
    }
    return this + fill.join('');
}
String.prototype.leftJustify = function( length, char ) {
    var fill = [];
    while ( fill.length + this.length < length ) {
        fill[fill.length] = char;
    }
    return fill.join('') + this;
}

class Con {
 typePrefixOf(type){
  if(type === "RF433"){
    return RF433;
  }else if(type === "RF315"){
    return RF315;
  }else{
    throw new Error("Unsupported transmission type.");
  }
}


 randomPulse(){
  return BITS_ARRAY[Math.floor(Math.random() * 2)];
}


 generate(type){
  var code = "";
  for (let i = 0; i < BYTES; i++) {
    var rand = this.randomPulse();
    code = code + rand;
  }

  var typePrefix = this.typePrefixOf(type);

  var res           = typePrefix + REPEATS      + DATA_LENGTH + code + FOOTER;
  var resWithRepeat = typePrefix + LONG_REPEAT  + DATA_LENGTH + code + FOOTER;

  return res;
  // {
  //         regular: hexToBase64(res),
  //         long:    hexToBase64(resWithRepeat)
  // }
}

 getRepeats(b64){
  var hex = base64ToHex(b64).replace(/ /g,'');
  var repeats = hex.substr(2, 2);
  var decimal = parseInt(repeats, 16);
  return decimal;
}

 getNewCode(b64, repeats){
  var hex = base64ToHex(b64).replace(/ /g,'');
  var start = hex.substr(0, 2);
  var end = hex.substr(4);

  var hexrepeats = parseInt(repeats).toString(16);

  if(hexrepeats.length == 1){
    hexrepeats = "0" + hexrepeats;
  }

  var res = (start + hexrepeats + end);
  return hexToBase64(res);

}



 generateLivolo(remoteId, btn){
    // the livolo code came from https://www.tyjtyj.com/livolo.php, dont know who wrote it, but big thanx
    header = "b280260013";
    id_bin = (+remoteId).toString(2);
    id_bin = id_bin.leftJustify(16,0);
    btn_bin = (+btn).toString(2);
    btn_bin = btn_bin.leftJustify(7,0);

    id_btn_bin = id_bin.concat(btn_bin);

    id_btn_bin = id_btn_bin.replace(/0/g, "0606");
    id_btn_bin = id_btn_bin.replace(/1/g, "0c");


    hex_out = header + id_btn_bin;

    pad_len = 32 - (hex_out.length - 24) % 32;


    hex_out = hex_out + ('').leftJustify(pad_len,0);
    //alert(hex_out);

    return hexToBase64(hex_out);


    /*


    Buttons:
    <option value='90'  >on only(scn1)</option>
	<option value='40'  >on/off (toggle/btn10)</option>
	<option value='106' >off only</option>
	<option value='0'   >btn1</option>
	<option value='96'	>btn2</option>
	<option value='120'	>btn3</option>
	<option value='24'  >btn4</option>
	<option value='108' >btn5</option>
	<option value='80'  >btn6</option>
	<option value='48'  >btn7</option>
	<option value='12'  >btn8</option>
	<option value='72'  >btn9</option>
	<option value='40'  >btn10</option>
	<option value='90'  >scn1</option>
	<option value='114' >scn2</option>
	<option value='10'  >scn3</option>
	<option value='18'  >scn4</option>
     */
}







/*
PROTOCOL:

b2 RF

0c repeats

34 00   52 bytes follow (big endian)  24 pairs + 4 for the footer

## ##       24 0d for a 1, 0d 24 for a 0

0c 00 01 6f   (Footer)


 */
}

module.exports = new Con();