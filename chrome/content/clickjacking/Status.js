function ok(){ //changes the status, displaying green icon and the extension name in the tooltip
   var status = document.getElementById('clickjacking-statusbar-panel');
   status.setAttribute('checkresult', 'green');
   status.setAttribute('tooltiptext', 'ClickJackThis!');
}

function warn(){ //changes the status, displaying yellow icon and a warning in the tooltip
   var status = document.getElementById('clickjacking-statusbar-panel');
   status.setAttribute('checkresult', 'yellow');
   status.setAttribute('tooltiptext', 'ClickJackThis! - Possible ClickJacking Attempt!');
}

function alt(){ //changes the status, displaying red icon and a security alert in the tooltip
   var status = document.getElementById('clickjacking-statusbar-panel');
   status.setAttribute('checkresult', 'red');
   status.setAttribute('tooltiptext', 'ClickJackThis! - ClickJacking Attempt!');
}