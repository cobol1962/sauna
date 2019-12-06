var saunaSettings = {};
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
    continueStart();
  }
}
function continueStart() {

  $.ajax({
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
  });
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
      clearTimeout(waitDrum);
      $('#infrafill2_value').show();
      infrafill1Int = setTimeout(function() {
        saunaSettings.byInfraFill1 = e.value;
        $("#infrafill2_value").show();
        $("#infrafill1_value").html(saunaSettings.byInfraFill1.padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_infrafill1").hide();

  $("#infrafill2").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(infrafill2Int);
      clearTimeout(waitDrum);
      infrafill2Int = setTimeout(function() {
        saunaSettings.byInfraFill2 = e.value;
        $("#infrafill1_value").show();
        $("#infrafill2_value").html(saunaSettings.byInfraFill2.padStart(2, "0"));
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_infrafill2").hide();

  $("#timerMinutes").drum({
    onChange : function (e) {
      clearInterval(rint);
      clearTimeout(tMinutesInt);
      clearTimeout(waitDrum);
      clearInterval(timerInt);
      tMinutesInt = setTimeout(function() {
        saunaSettings.bySaunaTimer = saunaSettings.bySaunaTimer.split(":")[0].padStart(2, "0") + ":" + e.value + ":" + "00";
        $("#timerMinutes_value").html(saunaSettings.bySaunaTimer.split(":")[1].padStart(2, "0"));
        $("#timerSeconds_value").html("00");
        clearInterval(rint);
        trySet();
      }, 2000);
    }
  });
  $("#drum_timerMinutes").hide();

  $("#timerHours").drum({
    onChange : function (e) {
      clearTimeout(tHoursInt);
      clearTimeout(waitDrum);
      clearInterval(timerInt);
      clearInterval(rint);
      tHoursInt = setTimeout(function() {
        saunaSettings.bySaunaTimer = e.value + ":" + saunaSettings.bySaunaTimer.split(":")[1].padStart(2, "0") + ":00";
        $("#timerHours_value").html(saunaSettings.bySaunaTimer.split(":")[0].padStart(2, "0"));
        $("#timerSeconds_value").html("00");
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
        saunaSettings[$(this).attr("target")] = "on";
      } else {
        saunaSettings[$(this).attr("target")] = "0";
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
        if (localStorage.infra !== undefined) {
          var sett = $.parseJSON(localStorage.infra);
          saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
          saunaSettings.byInfraFill1 = sett.byInfraFill1;
          saunaSettings.byInfraFill2 = sett.byInfraFill2;
          saunaSettings.bySteam = sett.bySteam;
          saunaSettings.bySaunaTimer = sett.bySaunaTimer;
        } else {
          saunaSettings.bySaunaTimer = "00:30";
        }
        break;
      case "2":
          if (localStorage.finn !== undefined) {
            var sett = $.parseJSON(localStorage.finn);
            saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
            saunaSettings.byInfraFill1 = sett.byInfraFill1;
            saunaSettings.byInfraFill2 = sett.byInfraFill2;
            saunaSettings.bySteam = sett.bySteam;
            saunaSettings.bySaunaTimer = sett.bySaunaTimer;
          } else {
            saunaSettings.bySaunaTimer = "00:30";
          }
          break;
      case "3":
        if (localStorage.steam !== undefined) {
          var sett = $.parseJSON(localStorage.steam);
          saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
          saunaSettings.byInfraFill1 = sett.byInfraFill1;
          saunaSettings.byInfraFill2 = sett.byInfraFill2;
          saunaSettings.bySteam = sett.bySteam;
          saunaSettings.bySaunaTimer = sett.bySaunaTimer;
        } else {
          saunaSettings.bySaunaTimer = "00:30";
        }

        break;

    }

//    noChangeState = true;
//    clearTimeout(noChangeStateTimeout);
/*    noChangeStateTimeout = setTimeout(function() {
      noChangeState = false;
    }, 15000);*/

    saunaSettings.bySaunaState = $(this).attr("saunaState");
    if (saunaSettings.bySaunaState != "0") {
      var secs = (parseInt(saunaSettings.bySaunaTimer.split(":")[0]) * 3600) + (parseInt(saunaSettings.bySaunaTimer.split(":")[1]) * 60) + (parseInt(saunaSettings.bySaunaTimer.split(":")[2]));
      if (secs < 1800) {
        saunaSettings.bySaunaTimer = "00:30";
      }
    } else {
      saunaSettings.bySaunaTimer = "00:00"
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
        url:  localStorage.url + "/GetValue",
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
  resultToObject($("#response").html());
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
function drawSauna(received = true) {
  if (settingsStarted) {
    return;
  }
  if (!noChangeState) {
      if (saunaSettings.bySaunaState == 0) {
        $("[settings]").hide();
        $("#tempok").find("[realvalue]").hide();
        $("[saunaState]").removeClass("active");
        saunaSettings.bySaunaTimer = "30:00";
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

    var rt =  saunaSettings.byVentilatorTimer.split(":");
    var realtime = parseInt(rt[0]) * 60 + parseInt(rt[1]);
    var st = $('#venttimer').html().split(":");
    var showtime = parseInt(st[0]) * 60 + parseInt(st[1]);
    console.log(showtime)
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
  $("#infrafill1").drum('setIndex', parseInt(saunaSettings.byInfraFill1));

  $("#infrafill2_value").html((parseInt(saunaSettings.byInfraFill2) * 10).toString().padStart(2, "0") + "%");
  $("#infrafill2").drum('setIndex', parseInt(saunaSettings.byInfraFill2));
  if (!$("#srum_infrafill1").is(":visible") && !$("#drum_infrafill2").is(":visible")) {

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
  var secs = (parseInt(saunaSettings.bySaunaTimer.split(":")[0]) * 3600) + (parseInt(saunaSettings.bySaunaTimer.split(":")[1]) * 60) + (parseInt(saunaSettings.bySaunaTimer.split(":")[2]));
  var secs1 = (parseInt($("#timerHours_value").html()) * 3600) + (parseInt($("#timerMinutes_value").html()) * 60) + (parseInt($("#timerSeconds_value").html()) * 1);
  var diff = Math.abs(secs - secs1);

  if (diff > 3) {
    $("#timerHours_value").html(saunaSettings.bySaunaTimer.split(":")[0].padStart(2, "0"));
    $("#timerHours").drum('setIndex', parseInt(saunaSettings.bySaunaTimer.split(":")[0]));
    $("#timerMinutes_value").html(saunaSettings.bySaunaTimer.split(":")[1].padStart(2, "0"));
    $("#timerMinutes").drum('setIndex', parseInt(saunaSettings.bySaunaTimer.split(":")[1]));
    $("#timerSeconds_value").html(saunaSettings.bySaunaTimer.split(":")[2].padStart(2, "0"));
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
function trySet() {
//  return;
  settingsStarted = true;
  console.log("trySet");
  clearInterval(rint);
  rint = null;

  if (err) {
  //  $.LoadingOverlay("hide");
    swal({
      type: 'error',
      text: "Connection fail.",
      confirmButtonText: "Reconnect",
      cancelButtonText: "Check settings",
      okButtonColor: "#297dce",
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {

      if (result.value) {
        window.location.reload();
      }
    });
  }
  var mode = saunaSettings.bySaunaState;
  switch(mode) {
    case "1":
      localStorage.infra = JSON.stringify(saunaSettings);
      break;
    case "2":
      localStorage.finn = JSON.stringify(saunaSettings);
      break;
    case "3":
        localStorage.steam = JSON.stringify(saunaSettings);
        break;
    }

  settingsStarted = true;
  var str = {};
  str.Lozinka = localStorage.password;
  str.SaunaState = saunaSettings.bySaunaState;
  str.SaunaTemp = saunaSettings.bySaunaTemp;
  str.InfraFill1 = saunaSettings.byInfraFill1;
  str.InfraFill2 =  saunaSettings.byInfraFill2;
  str.Steam = saunaSettings.bySteam;
  str.SaunaTime = "";
  var tmr = "";
  var secs = (parseInt(saunaSettings.bySaunaTimer.split(":")[0]) * 3600) + (parseInt(saunaSettings.bySaunaTimer.split(":")[1]) * 60) + (parseInt(saunaSettings.bySaunaTimer.split(":")[2]));
  if (secs < 1800 && saunaStateChanged) {
    saunaSettings.bySaunaTimer = "00:30";
    var secs = (parseInt(saunaSettings.bySaunaTimer.split(":")[0]) * 3600) + (parseInt(saunaSettings.bySaunaTimer.split(":")[1]) * 60) + (parseInt(saunaSettings.bySaunaTimer.split(":")[2]));
    startTimer(secs);
  }

  saunaStateChanged = false;
  if (str.SaunaState == "0") {
      tmr = "00:00";
      clearInterval(timerInt);
      timerInt = null;
      saunaSettings.bySaunaTimer = "00:00";
  //    $("[target]").removeClass("active");
  }
  tmr = saunaSettings.bySaunaTimer.split(":")[0].padStart(2, "0") + ":" + saunaSettings.bySaunaTimer.split(":")[1].padStart(2, "0");
  str.SaunaTime = tmr;

  str.Sec= "0";

  str.RoomTemp = saunaSettings.byRoomTemp;
  str.TemperingTemp = saunaSettings.byRoomTemperringTemp;
  if ((saunaSettings.bRoomHeat == "on" || saunaSettings.bRoomHeat == "1")) {
    str.RoomHeat = "on";
  } else {
    delete str.RoomHeat;
  }

  if ((saunaSettings.bS_Light == "on" || saunaSettings.bS_Light == "1")) {
    str.S_Light = "on";
  } else {
    delete str.S_Light;
  }

  if ((saunaSettings.bMoodLight == "on" || saunaSettings.bMoodLight == "1")) {
    str.MoodLight = "on";
  } else {
    delete str.MoodLight;
  }

  if ((saunaSettings.bSaltWall == "on" || saunaSettings.bSaltWall == "1")) {
    str.SaltWall = "on";
  } else {
    delete str.bSaltWall;
  }

  if ((saunaSettings.bStarrySky == "on" || saunaSettings.bStarrySky == "1")) {
    str.StarrySky = "on";
  } else {
    delete str.StarrySky;
  }
  if ((saunaSettings.bVentSate == "on" || saunaSettings.bVentSate == "1")) {
    str.VentSate = "on";
  } else {
    delete str.VentSate;
  }
  var setParams = Object.keys(str).map((key) => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(str[key]);
  }).join('&');

  $.ajax({
    url:  localStorage.url + "/?" + setParams,
    type: "GET",
    timeout: 3000,
    statusCode: {
      500: function() {

          setTimeout(function () {
            trySet();
          }, 500);
       }
    },
    success: function(result){
      var c = true;
      if (result.indexOf("WRONG PASSWORD") > -1) {
        c = false;
        $.LoadingOverlay("hide");
        swal({
          type: "error",
          text: "Wrong password. Check settings"
        }).then((result) => {

            setupDone = false;
            checkStorage();
        });
      }
      if (result == "" && setupDone && c) {

        setTimeout(function () {
          trySet();
        }, 500);
      } else {

        clearTimeout(failTimeout);
          clearInterval(rint);
          setTimeout(function() {
            clearInterval(rint);
            rint = setInterval(function() {
              noChangeState = false;
              settingsStarted = false;
              $('#infrafill_div').find('[realvalue]').show();
              $("#infrafill1_value").show();
              $("#infrafill2_value").show();
              refreshState = true;
              refresh();
            }, 2000);
            noChangeState = false;
            settingsStarted = false;
            $('#infrafill_div').find('[realvalue]').show();
            $("#infrafill1_value").show();
            $("#infrafill2_value").show();
            refreshState = true;
            refresh();
          }, 500);
      }
    },
    error: function() {
        clearInterval(rint);
        trySet();
    }
  });
}

function refresh() {
 clearTimeout(waitDrum);
 clearInterval(rint);
 if (settingsStarted) {
   return;
 }
 rint = setInterval(function() {
   refresh();
 }, 2000);
 $(".drum-wrapper").hide();
  $("[realvalue]").css({
    visibility: "visible"
  });
  if (!initialLoad) {
    return;
  }
  $.ajax({
    url:  localStorage.url + "/GetValue",
    timeout: 3000,
    statusCode: {
      500: function() {
          setTimeout(function () {
            refresh();
          }, 500);
       }
    },
    success: function(result) {
      console.log(result)
      setTimeout(function() {
        $("#response").html(result);
        showResults();
      }, 500);
    },
    error: function() {
    }
  });
}
function startDrum(elm,drumid) {

  $(".drum-wrapper").css({
    zIndex: -1
  });
  $('#' + drumid).css({
    zIndex: 9000
  });
  refresh();
  clearInterval(rint);
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
