var saunaSettings = {
  bySaunaState: 0,
  byMeasuredSaunaTemp: 0, //Measured SaunaTemp
  bySaunaTemp: 0,
  byInfraFill1: 0,
  byInfraFill2: 0,
  byMeasuredSteam: 0,     //Measured Steam
  bySteam: 0,
  bySaunaTimeHour: 0,
  bySaunaTimeMin: 0,
  bySaunaTimeSec: 0,
  byMeasuredRoomTemp: 0,    //Measured RoomTemp
  bRoomHeat: 0,
  byRoomTemp: 0,
  byRoomTemperringTemp: 0,   //room tempered temp
  bVentSate: 0,
  byVentilatorIdo: 0,
  byVentilatorIdo_s: 0,
  bS_Light: 0,
  bMoodLight: 0,
  bSaltWall: 0,
  bStarrySky: 0
};
var initialLoad = false;
var rint = null;
var oldState = "";
var waitDrum = null;
var noChangeState = false;
var noChangeStateTimeout = null;
var timerInt = null;
var ventInt = null;
var infrafill1Int = null;
var infrafill2Int = null;
var temperingtempInt = null;
var roomtempInt = null;
var settingsStarted = false;
var saunaStateChanged = false;
var error = "";
var setupDone = true;
currentSettings = [];
var refreshState = false;
$(document).ready(function() {

    if (localStorage.settings === undefined) {
      localStorage.settings = [];
    }
    $("body").css({
      maxWidth: $(window).width()
    });
    $("footer").css({
      width: $("body").width(),
      width: 500,
      maxWidth: $(window).width()
    });
    $("#ventContainer").css({
      width: $("body").width()
    });
    var pp = parseInt(($("body").width() / 5) / 0.7666);
    var rt = parseFloat($("body").width() / 480);
    $(".row.buttons div").css({
      height: pp
    });
    $(".row.title").css({
      height: 60 * rt
    });
    jQuery.validator.setDefaults({
      debug: true,
      success: "valid"
    });
    $( "#setupSauna" ).validate({
      rules: {
        url: {
          required: true,
          url: false
        },
        pwd: {
          required: true,
          minlength: 8
        }
      },
      submitHandler: function(form) {
        localStorage.url = $("#url").val();
        localStorage.password = $("#pwd").val();
        $("#url").val(localStorage.url);
        $("#pwd").val(localStorage.password);
        setupDone = true;
        window.location.reload();
      }
    });
    var ww = setInterval(function() {
      if ($.LoadingOverlay !== undefined) {
        clearInterval(ww);
        startApp();
      }
    }, 100)

});
function startApp() {

  $("#control").css({
    height: $(window).height() - $("header").height() - $("footer").height() - 8,
    maxHeight: $(window).height() - $("header").height() - $("footer").height() - 8,
    overflowY: "hidden",
    overflowX: "hidden",
    padding: 5,
    marginTop: 1,
    paddingLeft:10
  });
  checkStorage();
}
/*  $("#control").LoadingOverlay("show",
    {text        : "Connecting..."}
  );*/
function checkStorage() {

  if (localStorage.url === undefined || localStorage.password === undefined || !setupDone) {
    setupDone = false;
    $.LoadingOverlay("hide");
    $("[main]").hide();
    $("[setup]").show();
  } else {
    $("[main]").hide();
    $("[setup]").hide();
    $("#url").val(localStorage.url);
    $("#pwd").val(localStorage.password);
    initializeDrums();
    var ww = setInterval(function() {
      if (window.tcp !== undefined) {
        clearInterval(ww);
        continueStart();
      }
    }, 100);
  }
}
function continueStart() {
  tcp.open(
  //  "80.211.81.111",
    localStorage.url,
    30001,
    function() {
      if (tcp.state == 2) {
        tcp.close();
        showResults();
        $.LoadingOverlay("hide");
        $("[main]").show();
        initialLoad = true;
      //  rint = setInterval(function() {
          refresh();
      //  }, 2000);
      }
    },
    function(errorMessage) {
      start();
    });



/*  $.ajax({
    url:  localStorage.url + "/GetValue",
    timeout: 3000,

    success: function(result){
      if (result == "") {
        start();
        return false;
      }
      setTimeout(function() {
        $("#response").html(result);
        showResults();
        $.LoadingOverlay("hide");
        $("[main]").show();
        initialLoad = true;
        if (rint == null) {
          clearInterval(rint);
          rint = setInterval(function() {
            refresh();
          }, 2000);
        }
      }, 1000);
    },
    error: function() {
      start();
    }
  });*/
}
var tempInt = null;
var steamInt = null;
var tHoursInt = null;
var tMinutesInt = null;
function initializeDrums() {
  Hammer.plugins.fakeMultitouch();
  for (i=1;i<101;i++) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "<b>&#176;C</b>" + "</option>").appendTo($("#temperature"));
  }
  for (i=0;i<91;i+=5) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "%" + "</option>").appendTo($("#steam"));
  }
  for (i=0;i<13;i++) {
      $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "</option>").appendTo($("#timerHours"));
  }
  for (i=0;i<60;i++) {
      $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "</option>").appendTo($("#timerMinutes"));
  }
  for (i=0;i<11;i+=1) {
    $("<option value='" + i + "'>" + (i * 10).toString().padStart(2, "0") + "" + "</option>").appendTo($("#infrafill1"));
    $("<option value='" + i + "'>" + (i * 10).toString().padStart(2, "0") + "" +  "</option>").appendTo($("#infrafill2"));
  }

  for (i=5;i<16;i+=1) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "&#176;C" + "</option>").appendTo($("#temperingtemp"));
  }
  for (i=5;i<31;i+=1) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "&#176;C" + "</option>").appendTo($("#roomtemp"));
  }

  $("#roomtemp").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(roomtempInt);
      clearTimeout(waitDrum);

      roomtempInt = setTimeout(function() {
        saunaSettings.byRoomTemp = e.value;

        $("#roomtemp_value").html(saunaSettings.byRoomTemp.padStart(2, "0") + "&#176;C");
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_roomtemp").hide();

  $("#temperingtemp").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(temperingtempInt);
      clearTimeout(waitDrum);

      temperingtempInt = setTimeout(function() {
        saunaSettings.byRoomTemperringTemp = e.value;
        $("#temperingtemp_value").html(saunaSettings.byRoomTemperringTemp.padStart(2, "0") + "&#176;C");
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_temperingtemp").hide();
  $("#infrafill1").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(infrafill1Int);
      $('#infrafill2_value').show();
      infrafill1Int = setTimeout(function() {
        try {
          saunaSettings.byInfraFill1 = parseInt(e.value);
          $("#infrafill2_value").show();
          $("#infrafill1_value").html((saunaSettings.byInfraFill1 * 10) + "%");
          trySet();
        } catch(err) {
        }
      }, 2000);
    }
  });
  $("#drum_infrafill1").hide();

  $("#infrafill2").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(infrafill2Int);
      infrafill2Int = setTimeout(function() {
        try {
          saunaSettings.byInfraFill2 = parseInt(e.value);
          $("#infrafill1_value").show();
          $("#infrafill2_value").html((saunaSettings.byInfraFill2 * 10) + "%");
          trySet();
        } catch(err) {
          alert(err);
        }
      }, 2000);
    }
  });
  $("#drum_infrafill2").hide();

  $("#timerMinutes").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(tMinutesInt);
      tMinutesInt = setTimeout(function() {
        saunaSettings.bySaunaTimeMin = e.value;
        $("#timerMinutes_value").html(saunaSettings.bySaunaTimeMin.toString().padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_timerMinutes").hide();

  $("#timerHours").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(tHoursInt);
      tHoursInt = setTimeout(function() {
        saunaSettings.bySaunaTimeHour = e.value;
        $("#timerHours_value").html(saunaSettings.bySaunaTimeHour.toString().padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_timerHours").hide();


  $("#temperature").drum({
    onChange : function (e) {
      clearTimeout(tempInt);
      clearInterval(rint);
      clearTimeout(waitDrum);
      tempInt = setTimeout(function() {
        saunaSettings.bySaunaTemp = e.value;
        $("#temperature_value").html(saunaSettings.bySaunaTemp.padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_temperature").hide();

  $("#steam").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(steamInt);
      clearTimeout(waitDrum);
      steamInt = setTimeout(function() {
        saunaSettings.bySteam = e.value;
        $("#steam_value").html(saunaSettings.bySteam.padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 500);
    }
  });
  $("#drum_steam").hide();
  $("[target]").bind("click", function() {
    clearInterval(rint);
    settingsStarted = true;
    $(this).toggleClass("active");
    if ($(this).attr("target") == "bVentSate") {

  //    $("#venttimer").toggle();
  //    $("#ventContainer").toggle();
      refreshState = true;
    }
    if ($(this).attr("target") == "bRoomHeat") {
      refreshState = true;
    }
    if ($(this).attr("target") == "bRoomHeat" && saunaSettings.byMeasuredRoomTemp == "255") {
      swal({
        type: "error",
        text: "Room Temperature Sensor Error!"
      });
      $(this).removeClass("active");
      return;
    }
    saunaSettings[$(this).attr("target")] = ($(this).hasClass("active") ? "on" : "0");
    clearTimeout(noChangeStateTimeout);
    $.each($("[target]"), function() {
      if ($(this).hasClass("active")) {
        saunaSettings[$(this).attr("target")] = 1;
      } else {
        saunaSettings[$(this).attr("target")] = 0;
      }
    });
    trySet();
  });
  $("[saunaState]").bind("click", function() {
    settingsStarted = true;
    var  err = false;
    if ($(this).hasClass("active")) {
      return false;
    }

    clearInterval(rint);
    $("[saunaState]").removeClass("active");
    $(this).addClass("active");
    saunaStateChanged = true;
    var mode = $(this).attr("saunaState");
    $("[saunaState='" + mode + "']").addClass("active");
    if (saunaSettings.byMeasuredSaunaTemp  == "255") {
      err = true;
      swal({
        type: "error",
        text: "Sauna Temperature sensor Error!"
      });
    }

    if (saunaSettings.byMeasuredSteam  == "255" && mode == "3") {
      err = true;
      swal({
        type: "error",
        text: "Humidity Sensor Error!"
      })
    }

    if (err) {
      return false;
    }
    switch(mode) {
      case "1":
        saunaSettings.bySaunaTimer = "00:30:00";
        break;
      case "2":
        saunaSettings.bySaunaTimer = "00:30:00";
        break;
      case "3":
        saunaSettings.bySaunaTimer = "00:30:00";
        break;
    }
    saunaSettings.bySaunaState = $(this).attr("saunaState");
    if (saunaSettings.bySaunaState != "0") {
      var secs = (parseInt(saunaSettings.bySaunaTimer.split(":")[0]) * 3600) + (parseInt(saunaSettings.bySaunaTimer.split(":")[1]) * 60) + (parseInt(saunaSettings.bySaunaTimer.split(":")[2]));
      if (secs < 1800) {
        saunaSettings.bySaunaTimer = "00:30:00";
        saunaSettings.bySaunaTimeHour = 0;
        saunaSettings.bySaunaTimeMin = 30;
        saunaSettings.bySaunaTimeSec = 0;
      }
    } else {
      saunaSettings.bySaunaTimer = "00:00:00";
    }
    clearInterval(timerInt);
    timerInt = null;
    trySet();
  });
}
var count     = 1;
function start() {
  $.support.cors = true;

/*  $("#control").LoadingOverlay("show",
    {text        : "Connecting..."}
  );*/
  $.LoadingOverlay("show", {
    text        : "Loading ..."
  });
  $.LoadingOverlay("text", "Attempt " + count);
  refreshState = true;
  var wwa = setInterval(function() {
      $.ajax({
        url:  localStorage.url + ":30001/GetValue",
        timeout: 3000,
        success: function(result){
          if (result == "") {
            count += 1;
            connError(count, wwa);
            return false;
          }
          count = 1;
          setTimeout(function() {
            $("#response").html(result);
            try {
              clearInterval(wwa);
            } catch(err) {

            }
            $("[main]").show();
            initialLoad = true;
            if (rint == null) {
              clearInterval(rint);
              rint = setInterval(function() {

                refresh();
              }, 2000);
            }
            clearInterval(wwa);
            showResults();
          }, 1000);
        },
        error: function() {
          count += 1;
          connError(count, wwa);
        }
      });


  }, 2000);
}
function connError(count, interval) {

  if (count > 10) {
    clearInterval(interval);
    $("[target]").unbind("click");
  //  $("#control").html("<h3 style='width:100%;clear:both;cursor:pointer;'>Connection fail. Check again settings and try to reconnect.</h3><br><div><button onclick='window.location.reload();' type='button' class='btn btn-primary'>Reconnect</button></div>");
    $.LoadingOverlay("hide");
    swal({
      type: 'error',
      text: "Connection fail.",
      confirmButtonText: "Reconnect",
      cancelButtonText: "Check settings",
      okButtonColor: "#297dce",
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.value) {
        window.location.reload();
      } else {
        $("[main]").hide();
        $("[setup]").show();
      }
    });
  } else {
    $.LoadingOverlay("text", "Attempt " + count);
  }
}
function showResults() {

//  $.LoadingOverlay("hide");
//  resultToObject($("#response").html());
  $("#control").fadeTo(1, 2000);
}
function resultToObject(result) {

  var r1 = result.replace(/<\/?[^>]+(>|$)/g, "");
  var r = r1.split(",");

  $.each(r, function() {
    try {
      var rr = this.trim();
      saunaSettings[rr.substring(0,rr.indexOf(":")).replace("<p>","")] = rr.substring(rr.indexOf(":") + 1).trim().replace("</p>","");
    } catch(err) {

    }
  });
  saunaSettings["byMeasuredSaunaTemp"] = saunaSettings[""].split(" ")[1].trim();
  delete saunaSettings[""];
//  if (settingsStarted) {
    drawSauna();
//  }

}
var trs = false;
function drawSauna(received = true) {
  if (!noChangeState) {
      if (saunaSettings.bySaunaState == 0) {
        $("[settings]").hide();
        $("#tempok").find("[realvalue]").hide();
        $("[saunaState]").removeClass("active");
        saunaSettings.bySaunaTimer = "00:30:00";
        $("[target]").removeClass("active");
        clearInterval(timerInt);
        startTimer(0);
      } else {
        $("#tempok").find("[realvalue]").show();
        $("[saunaState]").removeClass("active");
        $("[settings]").show();
        $("[saunaState='" + saunaSettings.bySaunaState + "']").addClass("active");
      }
  }
  $.each($("[allow]"), function() {
    if ($(this).attr("allow").indexOf(saunaSettings.bySaunaState) > -1) {
      $(this).css({
        opacity: 1
      });
    } else {
      $(this).css({
        opacity: 0
      });
    }
  });
  if (trs) {
    alert(JSON.stringify(saunaSettings));
  }
  if (!settingsStarted) {
    $.each($("[target]"), function() {
      if (!noChangeState) {
        if (saunaSettings[$(this).attr("target")] != "0" ) {
          $(this).addClass("active");
        } else {
          $(this).removeClass("active");
        }
      }
    });
  }
  if (saunaSettings.byMeasureSaunaTemp  == "255") {
    err = true;
    swal({
      type: "error",
      text: "Sauna Temperature sensor Error!"
    });
  }
  if (saunaSettings.byMeasuredRoomTemp == "255") {
    $("#roomheat_div").hide();
  } else {
    $("#roomheat_div").show();
  }
  if (saunaSettings.bVentSate != "0") {
    var realtime = parseInt(saunaSettings.byVentilatorIdo) * 60 + parseInt(saunaSettings.byVentilatorIdo_s);
    var st = $('#venttimer').html().split(":");
    var showtime = parseInt(st[0]) * 60 + parseInt(st[1]);
    if (Math.abs(showtime - realtime) > 2) {
      startVentTimer(realtime);
      setTimeout(function() {
    //    $("#ventContainer").show();
      }, 100);
    } else {
  //    $("#ventContainer").show();
    }
  } else {
    clearInterval(ventInt);
    ventInt = null;
    $("#ventContainer").hide();
    $("#venttimer").html("00:00");
  }
  $("#infrafill1_value").html((parseInt(saunaSettings.byInfraFill1) * 10).toString().padStart(2, "0") + "%");
  if (saunaSettings.byInfraFill1 > 0) {
    $("#infrafill1").drum('setIndex', parseInt(saunaSettings.byInfraFill1));
  } else {
    $("#infrafill1").drum('setIndex', 0);
  }
  $("#infrafill2_value").html((parseInt(saunaSettings.byInfraFill2) * 10).toString().padStart(2, "0") + "%");
  if (saunaSettings.byInfraFill2 > 0) {
    $("#infrafill2").drum('setIndex', parseInt(saunaSettings.byInfraFill2));
  } else {
    $("#infrafill2").drum('setIndex', 0);
  }
  if (!$("#drum_infrafill1").is(":visible") && !$("#drum_infrafill2").is(":visible")) {
    $("#infrafill1_value").show();
    $("#infrafill2_value").show();
  }
  if (saunaSettings.byMeasuredSaunaTemp == '255') {
    $("#tempok").find("[measured]").hide();
    $("#temperr").show();
    $("#real_temperature_value").html(saunaSettings.byMeasuredSaunaTemp.padStart(2, "0"));
    $("[source='byMeasuredSaunaTemp']").hide();
    $("#temp_div").hide();
    if (saunaSettings.bySaunaState != "0") {
      saunaSettings.bySaunaState = "0";
      trySet();
    }
  } else {
    $("#tempok").find("[measured]").show();
    $("#temperr").hide();
    $("#temp_div").show();
    $("[source='byMeasuredSaunaTemp']").show();
    $("#temperature").drum('setIndex', parseInt(saunaSettings.bySaunaTemp) - 1);
    $("#temperature_value").html(saunaSettings.bySaunaTemp.padStart(2, "0"));
    $("#real_temperature_value").html(saunaSettings.byMeasuredSaunaTemp.padStart(2, "0"));
  }

  if (saunaSettings.bRoomHeat == "1") {
    $("#rtemp").show();
    $("#ttemp").hide();
  } else {
    $("#rtemp").hide();
    $("#ttemp").show();
  }
  $("#temperingtemp_value").html(saunaSettings.byRoomTemperringTemp.padStart(2, "0") + "&#176;C");
  $("#temperingtemp").drum('setIndex', parseInt(saunaSettings.byRoomTemperringTemp) - 1);
  $("#real_room_temp").html(saunaSettings.byMeasuredRoomTemp.padStart(2, "0"));

  $("#roomtemp_value").html(saunaSettings.byRoomTemp.padStart(2, "0") + "&#176;C");
  $("#roomtemp").drum('setIndex', parseInt(saunaSettings.byRoomTemp) - 1);
  if (saunaSettings.byMeasuredSteam == '255') {
    $("[source='byMeasuredSteam']").hide();
  } else {
    $("[source='byMeasuredSteam']").show();
    $("#real_steam_value").html(saunaSettings.byMeasuredSteam.padStart(2, "0"));
    $("#steam").drum('setIndex', parseInt(saunaSettings.bySteam) - 1);
    $("#steam_value").html(saunaSettings.bySteam.padStart(2, "0"));
  }
  var secs = (parseInt(saunaSettings.bySaunaTimeHour) * 3600) + (parseInt(saunaSettings.bySaunaTimeMin) * 60) + (parseInt(saunaSettings.bySaunaTimeSec));
  var secs1 = (parseInt($("#timerHours_value").html()) * 3600) + (parseInt($("#timerMinutes_value").html()) * 60) + (parseInt($("#timerSeconds_value").html()) * 1);

  var diff = Math.abs(secs - secs1);

  if (diff > 3) {
    $("#timerHours_value").html(saunaSettings.bySaunaTimeHour.padStart(2, "0"));
    $("#timerHours").drum('setIndex', parseInt(saunaSettings.bySaunaTimeHour));
    $("#timerMinutes_value").html(saunaSettings.bySaunaTimeMin.padStart(2, "0"));
    $("#timerMinutes").drum('setIndex', parseInt(saunaSettings.bySaunaTimeMin));
    $("#timerSeconds_value").html(saunaSettings.bySaunaTimeSec.padStart(2, "0"));
    saunaSettings.bySaunaTimer = saunaSettings.bySaunaTimeHour.padStart(2, "0") + ":" + saunaSettings.bySaunaTimeMin.padStart(2, "0") + ":" + saunaSettings.bySaunaTimeSec.padStart(2, "0");
  }
  if (diff > 3) {
      startTimer(secs);
  }
  setTimeout(function() {

    $('#real_room_temp').show();
  }, 1000);
  if (refreshState) {
    $.LoadingOverlay("hide");
    refreshState = false;
  }
}
var att = 1;
var  failTimeout = null;
var err = false;
function trySet(send = true) {
//  return;
  clearTimeout(sI);
  settingsStarted = true;
  clearInterval(rint);
  tcp.close();
  rint = null;
  settingsStarted = true;
  var str = {};
    if (saunaSettings.bySaunaTimer === undefined) {
      saunaSettings.bySaunaTimer = "00:30:00";
    }
    saunaSettings.bySaunaTimeHour = parseInt(saunaSettings.bySaunaTimeHour);
    saunaSettings.bySaunaTimeMin = parseInt(saunaSettings.bySaunaTimeMin);
    saunaSettings.bySaunaTimeSec = parseInt(saunaSettings.bySaunaTimeSec);
    if (isNaN(saunaSettings.bySaunaTimeHour)) {
      saunaSettings.bySaunaTimeHour =  parseInt($("#timerHours_value").html());
    }
    if (isNaN(saunaSettings.bySaunaTimeMin)) {
      saunaSettings.bySaunaTimeMin = parseInt($("#timerMinutes_value").html());
    }
    if (isNaN(saunaSettings.bySaunaTimeSec)) {
      saunaSettings.bySaunaTimeSec = parseInt($("#timerSeconds_value").html());
    }
    var tss = [saunaSettings.bySaunaState,saunaSettings.bySaunaTemp,saunaSettings.byInfraFill1,saunaSettings.byInfraFill2,saunaSettings.bySteam,saunaSettings.bySaunaTimeHour,saunaSettings.bySaunaTimeMin,saunaSettings.bySaunaTimeSec,saunaSettings.bRoomHeat,saunaSettings.byRoomTemp,saunaSettings.byRoomTemperringTemp,saunaSettings.bVentSate,saunaSettings.bS_Light,saunaSettings.bMoodLight,saunaSettings.bSaltWall,saunaSettings.bStarrySky];
    var toSend = "$$$1,17," + localStorage.password.trim().padStart(10,"0") + ",";
    toSend += tss.join(",") + ",&&&";
    alert("to send " + toSend);
    if (send) {
      refresh(toSend);
    }
    //saunaStateChanged = false;
}

function refresh(ts) {
 clearInterval(rint);
 if (settingsStarted) {
  //return;
 }
 $(".drum-wrapper").hide();
  $("[realvalue]").css({
    visibility: "visible"
  });
  if (!initialLoad) {
  //  return;
  }

  if (ts === undefined) {
    var dataString = "$$$1,17,000getData,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,&&&";
  } else {
    alert("ts = " + ts);
    var dataString = ts;
  }
  dataString = dataString.replace(/(\r\n|\n|\r)/gm, "");
  if (ts !== undefined) {
    alert("data string " + dataString);
  }
  if (ts !== undefined) {
    tcp1.open(
      "80.211.81.111",
      30000,
      function() {
        try {
          var ds = "$$$" + dataString;
          var data = new Uint8Array(ds.length);
          for (var i = 0; i < data.length; i++) {
            data[i] = ds.charCodeAt(i);
          }
          tcp1.write(data);
          tcp1.close();
        } catch(err) {
        }
      },
      function(errorMessage) {
        alert(JSON.stringify(errorMessage));
      });
  }
  try {
    tcp.close();
  } catch(e) {
  }
  var ww = setInterval(function() {
      if (tcp.state == 0) {
          clearInterval(ww);
          tcp.open(
            localStorage.url,
            30001,
            function() {
                var data = new Uint8Array(dataString.length);
                for (var i = 0; i < data.length; i++) {
                  data[i] = dataString.charCodeAt(i);
                }
                tcp.write(data);
            //    tcp.close();
            },
            function(errorMessage) {
              setTimeout(function() {
                refresh(dataString);
              }, 2000)
            });
        }
    }, 100);
}
function startDrum(elm,drumid) {
  $(".drum-wrapper").css({
    zIndex: -1
  });
  $('#' + drumid).css({
    zIndex: 9000
  });

  clearTimeout(sI);
  $(elm).css({visibility: 'hidden' });
  if (!elm.hasAttribute("timer")) {
    $(elm).next().css({visibility: 'hidden' });
  }
  $('#' + drumid).show();
  waitDrum = setTimeout(refresh, 5000);

}

function startTimer(duration) {
  clearInterval(timerInt);
  timerInt = null;
    var timer = duration, minutes, seconds;
    timerInt = setInterval(function () {

        hours = parseInt(timer / 3600, 10)
        minutes = parseInt((timer - (hours * 3600)) / 60, 10);
        seconds = parseInt((timer - ((hours * 3600) + (minutes * 60))) % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        $("#timerHours_value").html(hours);
        $("#timerMinutes_value").html(minutes);
        $("#timerSeconds_value").html(seconds);
        saunaSettings.bySaunaTimeHour = hours;
        saunaSettings.bySaunaTimeMin  = minutes;
        saunaSettings.bySaunaTimeSec =  seconds;
        if (--timer < 0) {
            timer = null;
            clearInterval(timerInt);
        }
    }, 1000);
}
function startVentTimer(duration) {
  clearInterval(ventInt);
  ventInt = null;
    var timer = duration, minutes, seconds;
    ventInt = setInterval(function () {
        hours = parseInt(timer / 3600, 10)
        minutes = parseInt((timer - (hours * 3600)) / 60, 10);
        seconds = parseInt((timer - ((hours * 3600) + (minutes * 60))) % 60, 10);

        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $("#venttimer").html(minutes + ":" + seconds);
        $("#ventContainer").show();
        if (--timer < 0) {
            timer = null;
            clearInterval(timerInt);
        }
    }, 1000);
}
function subitAndReload() {

}
var sI = null;
function receivedToObject() {
  if (received == "") {
    return;
  }

  var rcv = received.split(",");
  var ind = 4;
  for (var k in saunaSettings) {
    saunaSettings[k] = rcv[ind];
    ind++;
  }
//  saunaSettings.byVentilatorTimer = saunaSettings.byVentilatorIdo + ":" + saunaSettings.byVentilatorIdo_s;
  try {
    drawSauna();
  } catch(err) {
  }
  received = "";
  sI = setTimeout(function() {
    refresh();
  }, 2000);
}
