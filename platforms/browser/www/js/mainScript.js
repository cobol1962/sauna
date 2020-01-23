var command = null;
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
  byVentilatorIdo: 15,
  byVentilatorIdo_s: 0,
  bS_Light: 0,
  bMoodLight: 0,
  bSaltWall: 0,
  bStarrySky: 0
};
var sset = false;
var roomRemoved = false;
var waterShown = false;
var currentDrum = "";
var drumStarted = false;
var ws = null;
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
  localStorage.connected = false;
  if (localStorage.bt !== undefined) {
    $("#bt").val(localStorage.bt);
    if (localStorage.bt == "btt") {
        $("#bt").val("btt");
        $(".bluetooth").show();
        $(".wall").hide();
    } else {
       $("#bt").val("salt");
       $(".bluetooth").hide();
       $(".wall").show();
    }
  } else {
    if (localStorage.mode == "url") {
        $("#bt").val("btt");
        $(".bluetooth").show();
        $(".wall").hide();
    } else {
       $("#bt").val("salt");
       $(".bluetooth").hide();
       $(".wall").show();
    }
  }
  if (localStorage.sfinn !== undefined && localStorage.sinfra !== undefined && localStorage.sbio !== undefined) {
    if (localStorage.sroom != "on") {
      $("#roomheat_div").hide();
      $(".room").hide();
      $("#sroom")[0].checked = false;
    } else {
      $("#roomheat_div").show();
      $("#sroom")[0].checked = true;
    }

    if (localStorage.sfinn == "on" && localStorage.sinfra == "on" && localStorage.sbio == "on") {
      $("#sfinn")[0].checked = true;
      $("#sinfra")[0].checked = true;
      $("#sbio")[0].checked = true;
        $(".finn").show();
        $(".infra").show();
        $(".steam").show();
        $(".finn").css({
          minWidth: "32%"
        })
        $(".infra").css({
          minWidth: "32%"
        })
        $(".steam").css({
          minWidth: "32%"
        })
    }

    if (localStorage.sfinn != "on" && localStorage.sinfra == "on" && localStorage.sbio != "on") {
      $("#sfinn")[0].checked = false;
      $("#sinfra")[0].checked = true;
      $("#sbio")[0].checked = false;
      $(".finn").hide();
      $(".steam").hide();
      $(".infra").show();
      $(".infra").css({
        minWidth: "100%"
      })
    }

    if (localStorage.sfinn != "on" && localStorage.sinfra != "on" && localStorage.sbio == "on") {
      $("#sfinn")[0].checked = false;
      $("#sinfra")[0].checked = false;
      $("#sbio")[0].checked = true;
      $(".finn").hide();
      $(".steam").show();
      $(".infra").hide();
      $(".steam").css({
        minWidth: "100%"
      })
    }

    if (localStorage.sfinn == "on" && localStorage.sinfra != "on" && localStorage.sbio == "on") {
      $("#sfinn")[0].checked = true;
      $("#sinfra")[0].checked = false;
      $("#sbio")[0].checked = true;
      $(".finn").show();
      $(".steam").show();
      $(".infra").hide();

    }

    if (localStorage.sfinn == "on" && localStorage.sinfra != "on" && localStorage.sbio != "on") {
      $("#sfinn")[0].checked = true;
      $("#sinfra")[0].checked = false;
      $("#sbio")[0].checked = false;
      $(".finn").show();
      $(".steam").hide();
      $(".infra").hide();
      $(".finn").css({
        minWidth: "98%"
      })
    }

    if (localStorage.sfinn == "on" && localStorage.sinfra == "on" && localStorage.sbio != "on") {
      $("#sfinn")[0].checked = true;
      $("#sinfra")[0].checked = true;
      $("#sbio")[0].checked = false;
      $(".finn").show();
      $(".infra").show();
      $(".steam").hide();
      $(".finn").css({
        minWidth: "48%"
      })
      $(".infra").css({
        minWidth: "50%"
      })
    }

    if (localStorage.sfinn != "on" && localStorage.sinfra == "on" && localStorage.sbio == "on") {

      $("#sfinn")[0].checked = false;
      $("#sinfra")[0].checked = true;
      $("#sbio")[0].checked = true;
      $(".finn").hide();
      $(".infra").show();
      $(".steam").show();

    }
    setTimeout(function() {
        var pp = parseInt((($("body").width() - 18) / 5) / 1);
        var rt = parseFloat($("body").width() / 436);
        var nb = 0;
        $.each($("[bottombuttons]").find("div"), function() {
          if ($(this).is(":visible")) {
            nb++;
          }
        })

        var pp1 = parseInt(($("body").width() / nb) / 1);
        if (nb == 3) {
          $("#roomheat_div").css({
            left: "50%"
          })
        }
        if (nb == 4) {
          $("#roomheat_div").css({
            left: "60%"
          })
        }
        $.each($("[bottombuttons]").find("div"), function() {
          $(this).css({
            height: pp * rt,

          })
        })
      }, 500);
  }
  //localStorage.mode = "url";
  setInterval(function() {
    if  (!$("[setup]").is(":visible")) {
      $("#saunaName").html(localStorage.saunaName);
    } else {
      $("#saunaName").html("SETTINGS");
    }
  }, 1000);
  if (localStorage.mode == "socket") {
    swal({
      type: "info",
      text: "Connecting",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showLoading: true
    })

  }
  delete localStorage.currentChangeNumber;
  jQuery.validator.addMethod("isOldPass", function(value, element) {
    return (element.value == localStorage.password);
  }, "Please enter old password");
  jQuery.validator.addMethod("isOneChecked", function(value, element) {
    return ($("#sfinn")[0].checked || $("#sinfra")[0].checked || $("#sbio")[0].checked );
  }, "Select at least one sauna mode");
 $("[main]").hide();
  $( "#setupSauna" ).validate({
    rules: {
      url: {
        required: true,
        url: false
      },
      pwd: {
        required: true,
        minlength: 6
      },

    },
    submitHandler: function(form) {

      localStorage.url = $("#url").val().split("(")[0].trim();
      $("#url").val(localStorage.url);
  //    $("#saunaid").val(localStorage.saunaid);
      localStorage.password = $("#pwd").val();
      localStorage.saunaid = $("#saunaid").val();
      localStorage.url = $("#url").val();

      setupDone = true;

      window.location.reload();
    }
  });
  $( "#appsettings" ).validate({
    rules: {
      smode: {
        isOneChecked: true
      }
    },
    submitHandler: function(form) {
      $.each($("#appsettings").find("input"), function() {
        localStorage[$(this).attr("id")] = (($(this)[0].checked) ? "on" : "off");
      })
      $.each($("#appsettings").find("select"), function() {
        localStorage[$(this).attr("id")] = $(this).val();
      })

      saunaSettings.bySaunaState = "0";
      trySet();
      setTimeout(function() {
        window.location.reload();
      }, 2000);
    }
  });

  $( "#changePassword" ).validate({
    rules: {
      oldPwd: {
        required: true,
        isOldPass: true
      },
      newPwd: {
        required: true,
        maxlength : 10,
        minlength : 6
      },
      cnfPwd: {
        required: true,
        equalTo: "#newPwd",
        maxlength : 10,
        minlength : 6
      }
    },
    submitHandler: function(form) {
      localStorage.currentChangeNumber++;
      command = "changePassword";

      var toSend = "$$$1," + localStorage.currentChangeNumber + "," + + ((localStorage.mode == "socket") ? localStorage.saunaid + "," : "") + localStorage.password.trim().padStart(10,"0") + ",11," + $("#newPwd").val().trim().padStart(10, "0") + ",&&&";
      if (localStorage.mode == "url") {

        $.ajax({
          url:  "http://" + localStorage.url + "/?settings=" + toSend,
          type: "GET",
          timeout: 3000,
          statusCode: {

          },
          success: function(result){
            showResults(result);

          },
          error: function() {
            swal({
              type: "warning",
              text: "Something went wrong. Please try again."
            })
          }
        });
          } else {
            var obj = {
              action: "command",
              parameters: toSend
            }
          ws.send(JSON.stringify(obj));
        }

    }
  });
  if (localStorage.url === undefined) {
    startApp();
    return;
  }
    if (localStorage.mode === undefined) {
      if (localStorage.url.indexOf(".") > -1) {
    //    localStorage.mode = "url";
      } else {
    //    localStorage.mode = "socket";
        if (ws == null) {
          ws = new ReconnectingWebSocket(localStorage.saunaid);
          $("[main]").show();
          initialLoad = true;
        }
      }
    }
    if (localStorage.settings === undefined) {
      localStorage.settings = [];
    }

    $("body").css({
      maxWidth: (($(window).width() < 500) ? $(window).width() : 500)
    });
    $("footer").css({
      width: $("body").width(),
      maxWidth: $(window).width()
    });
    $("#ventContainer").css({
      width: $("body").width()
    });

    var pp = parseInt(($("body").width() / 5) / 1);
    var rt = parseFloat($("body").width() / 430);



    $(".row.buttons div").not("#stateTable").css({
      height: pp * rt,
      width: pp - 8,
      minWidth: pp - 8,
      maxWidth: pp - 8
    });

    $(".row.title").css({
      height: 60 * rt
    });
    $("#roomheat_div").css({
      right: pp + 14,
      fontSize: 25,
      top:20
    })
    jQuery.validator.setDefaults({
      debug: true,
      success: "valid"
    });


    var ww = setInterval(function() {
      if ($.LoadingOverlay !== undefined) {
        clearInterval(ww);
        startApp();
      }
    }, 100)
    var acc = document.getElementsByClassName("accordion");
var i;
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    $(".panel").hide(300);
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
  $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {
    if (e.target.id != "step1_tab") {
    /*  if (localStorage.connected == "false") {
        swal({
          type: "error",
          text: "You are not connected to any sauna. Please connect first."
        }).then((result) => {
          $("#step1_tab").tab("show");
        })
      }*/
    }
    if (e.target.id == "step1_tab") {
    }
    if (e.target.id == "step3_tab") {
      if (localStorage.mode == "url") {
        $("#hardwareSettings").show();
        $("#switchNetwork").text("Cloud");
        $("#switchNetwork").attr("mode", "url");
      }
      if (localStorage.mode == "socket") {
        $("#hardwareSettings").hide();
        $("#switchNetwork").text("Local");
        $("#switchNetwork").attr("mode","socket");
      }
    }
    if (e.target.id == "step4_tab") {
      if (localStorage.mode != "url") {
        e.preventDefault();
        $("#step1_tab").tab("show");
        return false;
      }
      localStorage.currentChangeNumber++;
      command = "checkDomain";
      var toSend = "$$$1," + localStorage.currentChangeNumber + "," + + ((localStorage.mode == "socket") ? localStorage.saunaid + "," : "") + localStorage.password.trim().padStart(10,"0") + ",12,&&&";
      $.ajax({
        url:  "http://" + localStorage.url + "/?settings=" + toSend,
        type: "GET",
        timeout: 3000,
        statusCode: {

        },
        success: function(result){
          showResults(result);

        },
        error: function() {
          swal({
            type: "warning",
            text: "Something went wrong. Please try again."
          })
        }
      });
    }
  })
});
function switchNetwork(btn) {
  clearInterval(rint);
  $(btn).attr("mode", localStorage.mode)
  var md = $(btn).attr("mode");

  if (md == "socket") {
    localStorage.currentChangeNumber++;
    command = "changeNetwork";
    var toSend = "$$$1," + localStorage.currentChangeNumber + "," + localStorage.saunaid + "," + localStorage.password.trim().padStart(10,"0") + ",15,&&&";
    var obj = {
      action: "command",
      parameters: toSend
    }
    ws.send(JSON.stringify(obj));
    swal({
      type: "info",
      html: "Action can take 30 - 60 secs. Please be patient. <br />Time used: <strong id='scsp'></strong> secs.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false
    });
    var sc = 0;
    var sint = setInterval(function() {
      sc++;
      $("#scsp").html(sc.toString().padStart(2, "0"));
      if (sc > 60) {
        clearInterval(sint);
        swal.close();
        swal({
          type: "error",
          text: "Somwthing went wrong. Please try again or contact support."
        });
      }
    }, 1000)
  } else {
    localStorage.currentChangeNumber++;

    command = "checkDomain";
    var toSend = "$$$1," + localStorage.currentChangeNumber + "," + localStorage.saunaid + "," + localStorage.password.trim().padStart(10,"0") + ",12,&&&";
    $("#step4_tab").tab("show");
  }
}
function startApp() {
  $("#control").show();
  $("#control").css({
    height: $(window).height() - $("header").height() - $("footer").height() - 8,
    maxHeight: $(window).height() - $("header").height() - $("footer").height() - 8,
    overflowY: "hidden",
    overflowX: "hidden",
    marginTop: 1,

  });
  checkStorage();
}

function checkStorage() {
  if (localStorage.url === undefined || localStorage.password === undefined || !setupDone) {

    setupDone = false;
    $.LoadingOverlay("hide");
    $("header .row.title").addClass("active");
    $("#saunaName").html("SETTINGS");
    $("[main]").hide();
    $("[setup]").show();
    clearInterval(rint);
  } else {
    $("[main]").hide();
    $("[setup]").hide();
    $("#url").val(localStorage.url + " (" + localStorage.name + ")");
    $("#pwd").val(localStorage.password);
    $("#saunaid").val(localStorage.saunaid);
    $("#url").val(localStorage.url);

    initializeDrums();
    continueStart();
  }
}
// start
function continueStart() {
    window.saunas = [];
  if (localStorage.mode == "url") {
    $("#btn").attr("mode", "url");
        $.ajax({
          url:  "http://" + localStorage.url + "/GetValue",
          timeout: 3000,

          success: function(result){
            if (result == "") {
              start();
              return false;
            }
            setTimeout(function() {
              localStorage.name = result.split(",")[3];
              window.saunas.push( localStorage.url + ((localStorage.name !== undefined) ? " (" + localStorage.name + ")" : "")  )
              $("#url").typeahead({ source: window.saunas });
              localStorage.connected = true;
                showResults(result);
              $.LoadingOverlay("hide");
              $("[main]").show();
              initialLoad = true;
            if (rint == null) {
              //  clearInterval(rint);
              localStorage.currentChangeNumber++;
              command = "checkMode";
              clearInterval(rint);

              $.ajax({
                url:  "http://" + localStorage.url + "/?settings=" + "$$$1," + localStorage.currentChangeNumber + "," + localStorage.password + ",14,&&&",
                type: "GET",
                timeout: 3000,
                statusCode: {
                  500: function() {

                   }
                },
                success: function(result){
                  showResults(result);

                }
              });
              }
            }, 1000);
          },
          error: function() {
            start();
          }
        });
  } else {
    $("#btn").attr("mode", "socket");
  /*  swal({
      type: "info",
      text: "Connecting to sauna",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false
    })*/
    var o = true;
  try {

    var toSend = "$$$1," + localStorage.currentChangeNumber + "," + localStorage.password + ",14,&&&";
    command = "checkMode";
    var obj = {
      action: "command",
      parameters: toSend
    }
     ws = new ReconnectingWebSocket(localStorage.saunaid);
     ws.send(JSON.stringify(obj));
  } catch(err) {
    o = false;
    swal({
      type: "error",
      text: "PLEASE CHECK SETTINGS AGAIN",
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      $("[main]").hide();
        $("header .row.title").addClass("active");
        $("#saunaName").html("SETTINGS");
        $("[main]").hide();
        $("[setup]").show();
        localStorage.mode = "url"
        clearInterval(rint);
    });
  }
  if (!o) {
    return false;
  }
var is =  setTimeout(function() {
      if (ws === undefined) {
        swal({
          type: "error",
          text: "PLEASE CHECK SETTINGS AGAIN",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then((result) => {
          $("[main]").hide();
            $("header .row.title").addClass("active");
            $("#saunaName").html("SETTINGS");
            $("[main]").hide();
            $("[setup]").show();
            localStorage.mode = "url"
            clearInterval(rint);
        });
      }
        if (ws === undefined) {
          return;
        }
      if (ws.readyState == 0) {
        swal({
          type: "error",
          text: "PLEASE CHECK SETTINGS AGAIN",
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false
        }).then((result) => {
          $("[main]").hide();
            $("header .row.title").addClass("active");
            $("#saunaName").html("SETTINGS");
            $("[main]").hide();
            $("[setup]").show();
            localStorage.mode = "url"
            clearInterval(rint);
        });
      } else {
        swal({
          type: "info",
          text: "Connecting",
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          allowEnterKey: false,
          showLoading: true,
          timer: 2000
        }).then((result) => {
          $("[main]").show();
          clearTimeout(is);
          initialLoad = true;
        })

      }
    }, 5000);
  }
}
var tempInt = null;
var steamInt = null;
var tHoursInt = null;
var tMinutesInt = null;
function initializeDrums() {
  Hammer.plugins.fakeMultitouch();

  for (i=1;i<101;i+=1) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "<b>&#176;C</b>" + "</option>").appendTo($("#temperature"));
  }
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#temperature"));
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#temperature"));
  $("<option value='" + 999 + "'>" + "" + "</option>").appendTo($("#temperature"));
  for (i=0;i<101;i+=5) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "%" + "</option>").appendTo($("#steam"));
  }
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#steam"));
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#steam"));
  $("<option value='" + 999 + "'>" + "" + "</option>").appendTo($("#steam"));
  for (i=0;i<10;i++) {
      $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "</option>").appendTo($("#timerHours"));
  }
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#timerHours"));
  $("<option value='" + 999 + "'>" +  "" + "</option>").appendTo($("#timerHours"));
  $("<option value='" + 999 + "'>" + "" + "</option>").appendTo($("#timerHours"));

  for (i=0;i<60;i++) {
      $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "</option>").appendTo($("#timerMinutes"));
  }
  for (i=0;i<11;i+=1) {
    $("<option value='" + i + "'>" + (i * 10).toString().padStart(2, "0") + "%" + "</option>").appendTo($("#infrafill1"));
    $("<option value='" + i + "'>" + (i * 10).toString().padStart(2, "0") + "%" +  "</option>").appendTo($("#infrafill2"));
  }

  for (i=5;i<16;i+=1) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "&#176;C" + "</option>").appendTo($("#temperingtemp"));
  }
  for (i=5;i<31;i+=1) {
    $("<option value='" + i + "'>" + i.toString().padStart(2, "0") + "&#176;C" + "</option>").appendTo($("#roomtemp"));
  }

  $("#roomtemp").drum({
    onChange : function (e) {
      clearTimeout(roomtempInt);
      clearTimeout(waitDrum);
      roomtempInt = setTimeout(function() {
        saunaSettings.byRoomTemp = e.value;
        $("#roomtemp_value").html(saunaSettings.byRoomTemp.padStart(2, "0") + "&#176;C");
        drumStarted = false;
        trySet();
      }, 3000);
    }
  });
  $("#drum_roomtemp").hide();

  $("#temperingtemp").drum({
    onChange : function (e) {
      clearTimeout(temperingtempInt);
      clearTimeout(waitDrum);
      roomtempInt = setTimeout(function() {
        saunaSettings.byRoomTemperringTemp = e.value;
        $("#temperingtemp_value").html(saunaSettings.byRoomTemperringTemp.padStart(2, "0") + "&#176;C");
        drumStarted = false;
        trySet();
      }, 3000);
    }
  });

  $("#drum_temperingtemp").hide();


  $("#infrafill1").drum({
    onChange : function (e) {
      clearTimeout(infrafill1Int);
      clearTimeout(waitDrum);
      $('#infrafill2_value').show();
      infrafill1Int = setTimeout(function() {
        saunaSettings.byInfraFill1 = e.value;
        drumStarted = false;
        $("#infrafill2_value").show();
        $("#infrafill1_value").html((parseInt(saunaSettings.byInfraFill1) * 10).toString().padStart(2, "0") + "%");
        trySet();
      }, 3000);
    }
  });
  $("#drum_infrafill1").hide();

  $("#infrafill2").drum({
    onChange : function (e) {
    //  clearInterval(rint);
      clearTimeout(infrafill2Int);
      clearTimeout(waitDrum);
      infrafill2Int = setTimeout(function() {
        saunaSettings.byInfraFill2 = e.value;
        $("#infrafill1_value").show();
        $("#infrafill2_value").html((parseInt(saunaSettings.byInfraFill2) * 10).toString().padStart(2, "0") + "%");
        drumStarted = false;
        trySet();
      }, 3000);
    }
  });
  $("#drum_infrafill2").hide();


    $("#timerMinutes").drum({
      onChange : function (e) {
      //  clearInterval(rint);
        clearTimeout(tMinutesInt);
        tMinutesInt = setTimeout(function() {
          saunaSettings.bySaunaTimeMin = e.value;
          if (saunaSettings.bySaunaState == "1") {
            localStorage.infra.bySaunaTimeMin = saunaSettings.bySaunaTimeMin;
          }
          if (saunaSettings.bySaunaState == "2") {
            localStorage.finn.bySaunaTimeMin = saunaSettings.bySaunaTimeMin;
          }
          if (saunaSettings.bySaunaState == "3") {
            localStorage.steam.bySaunaTimeMin = saunaSettings.bySaunaTimeMin;
          }
      //    $("#timerMinutes_value").html("59");
          $("#timerMinutes_value").html(saunaSettings.bySaunaTimeMin.toString().padStart(2, "0"));
        //  clearInterval(rint);
          trySet();
        }, 3000);
      }
    });
    $("#drum_timerMinutes").hide();

    $("#timerHours").drum({
      onChange : function (e) {
       console.log(e.value);
        clearTimeout(tHoursInt);
        tHoursInt = setTimeout(function() {
          saunaSettings.bySaunaTimeHour = e.value;
          if (saunaSettings.bySaunaState == "1") {
            localStorage.infra.bySaunaTimeHour = saunaSettings.bySaunaTimeHour;
          }
          if (saunaSettings.bySaunaState == "2") {
            localStorage.finn.bySaunaTimeHour = saunaSettings.bySaunaTimeHour;
          }
          if (saunaSettings.bySaunaState == "3") {
            localStorage.steam.bySaunaTimeHour = saunaSettings.bySaunaTimeHour;
          }
          $("#timerHours_value").html(e.value.toString().padStart(2, "0"));
        //  clearInterval(rint);
          trySet();
        }, 3000);
      }
    });
    $("#drum_timerHours").hide();


    $("#temperature").drum({
      onChange : function (e) {
        clearTimeout(tempInt);
        clearTimeout(waitDrum);
        tempInt = setTimeout(function() {
        console.log(e.value)
          if (e.value != "999") {
              saunaSettings.bySaunaTemp = e.value;
              $("#temperature_value").html(saunaSettings.bySaunaTemp.padStart(2, "0"));
              drumStarted = false;
              trySet();
          }
        }, 3000);
      }
    });
  $("#drum_temperature").hide();

  $("#steam").drum({
    onChange : function (e) {
      clearTimeout(steamInt);
      steamInt = setTimeout(function() {
        if (e.value != "999") {
            saunaSettings.bySteam = e.value;
            if (saunaSettings.bySteam != "") {
              $("#steam_value").html(saunaSettings.bySteam.padStart(2, "0"));
              drumStarted = false;
              trySet();
            }
          }
      }, 3000);
    }
  });
  $("#drum_steam").hide();
  $("[target]").bind("click", function() {
  //  clearInterval(rint);
    settingsStarted = true;
    $(this).toggleClass("active");
    if ($(this).attr("target") == "bVentSate") {
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
    saunaSettings[$(this).attr("target")] = ($(this).hasClass("active") ? 1 : 0);
    clearTimeout(noChangeStateTimeout);
  /*  $.each($("[target]"), function() {
      if ($(this).hasClass("active")) {
        saunaSettings[$(this).attr("target")] = 1;
      } else {
        saunaSettings[$(this).attr("target")] = 0;
      }
    });*/
    trySet();
  });
  $("[saunaState]").bind("click", function() {
    settingsStarted = true;
    var  err = false;
    if ($(this).hasClass("active")) {
      return false;
    }
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
          try {
            var sett = $.parseJSON(localStorage.infra);
          } catch(err) {
            var sett = localStorage.infra;
          }
          saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
          saunaSettings.byInfraFill1 = sett.byInfraFill1;
          saunaSettings.byInfraFill2 = sett.byInfraFill2;
          saunaSettings.bySteam = sett.bySteam;
          try {
            saunaSettings.bySaunaTimer = sett.bySaunaTimeHour.toString().padStart(2, "0") + ":" + sett.bySaunaTimeMin.toString().padStart(2, "0") + ":" + sett.bySaunaTimeSec.toString().padStart(2, "0");
          } catch(err) {
            saunaSettings.bySaunaTimer = "00:30:00";
          }
        } else {
          saunaSettings.bySaunaTimer = "00:30:00";
          saunaSettings.bySaunaTimeHour = 0;
          saunaSettings.bySaunaTimeSec = 0;
          saunaSettings.bySaunaTimeMin = 30;
          saunaSettings.bySaunaTemp =  50;
          saunaSettings.byInfraFill1 = 7;
          saunaSettings.byInfraFill2 = 8;
          saunaSettings.byRoomTemperringTemp = 5;
        }
        break;
      case "2":
          if (localStorage.finn !== undefined) {
            try {
              var sett = $.parseJSON(localStorage.finn);
            } catch(err) {
              var sett = localStorage.finn;
            }

            saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
            saunaSettings.byInfraFill1 = sett.byInfraFill1;
            saunaSettings.byInfraFill2 = sett.byInfraFill2;
            saunaSettings.bySteam = sett.bySteam;
            try {
              saunaSettings.bySaunaTimer = sett.bySaunaTimeHour.toString().padStart(2, "0") + ":" + sett.bySaunaTimeMin.toString().padStart(2, "0") + ":" + sett.bySaunaTimeSec.toString().padStart(2, "0");
            } catch(err) {
              saunaSettings.bySaunaTimer = "00:30:00";
            }
         } else {
            saunaSettings.bySaunaTimer = "00:30:00";
            saunaSettings.bySaunaTimeSec = 0;
            saunaSettings.bySaunaTimeHour = 0;
            saunaSettings.bySaunaTimeMin = 30;
            saunaSettings.bySaunaTemp =  80;
            saunaSettings.byRoomTemperringTemp = 5;
          }
          break;
      case "3":
        if (localStorage.steam !== undefined) {
          try {
            var sett = $.parseJSON(localStorage.steam);
          } catch(err) {
            var sett = localStorage.steam;
          }

          saunaSettings.bySaunaTemp =  sett.bySaunaTemp;
          saunaSettings.byInfraFill1 = sett.byInfraFill1;
          saunaSettings.byInfraFill2 = sett.byInfraFill2;
          saunaSettings.bySteam = sett.bySteam;
          if (sett.bySaunaTimeHour === undefined) {
            sett.bySaunaTimeHour = 0;
            sett.bySaunaTimeMin = 30;
            sett.bySaunaTimeSec = 0;
          }
          try {
            saunaSettings.bySaunaTimer = sett.bySaunaTimeHour.toString().padStart(2, "0") + ":" + sett.bySaunaTimeMin.toString().padStart(2, "0") + ":" + sett.bySaunaTimeSec.toString().padStart(2, "0");
          } catch(err) {
            saunaSettings.bySaunaTimer = "00:30:00";
          }

        } else {
          saunaSettings.bySaunaTimer = "00:30:00";
          saunaSettings.bySaunaTimeHour = 0;
          saunaSettings.bySaunaTimeMin = 30;
          saunaSettings.bySaunaTimeSec = 0;
          saunaSettings.bySaunaTemp =  80;
          saunaSettings.byRoomTemperringTemp = 5;
        }

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

            return false;
          }

          setTimeout(function() {

            $("#response").html(result);
            try {
              clearInterval(wwa);
            } catch(err) {

            }
        //    $("[main]").show();
            initialLoad = true;
            if (rint == null) {
            }
            clearInterval(wwa);
            showResults(result);
          }, 0);
        },
        error: function() {

          count += 1;
          connError(count, wwa);
        }
      });


  }, 2000);
}
function connError(count, interval) {
  if (count > 4) {
    return;
  }
  if (count > 3) {

    clearInterval(interval);
    $("[target]").unbind("click");
    $.LoadingOverlay("hide");
    $("[main]").hide();
    swal({
      type: 'error',
      text: "Connection fail.",
      confirmButtonText: "Reconnect",
      cancelButtonText: "Check settings",
      confirmButtonColor: "#297dce",
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,

    }).then((result) => {
      $("[main]").hide();
      if (result.value) {
        window.location.reload();
      } else {
        $("header .row.title").addClass("active");
        $("#saunaName").html("SETTINGS");
        $("[main]").hide();
        $("[setup]").show();
        clearInterval(rint);
      }
    });
  } else {
    $.LoadingOverlay("text", "Attempt " + count);
  }
}
function showResults(response) {

//  $.LoadingOverlay("hide");
  resultToObject(response);
    $("#control").show();
  $("#control").fadeTo(1, 2000);
}
function resultToObject(received) {

  var rcv = received.split(",");
  if (rcv[0] == "$$$2") {
    checkSettings(rcv);
    return;
  }
  localStorage.saunaName = rcv[3];

  if (localStorage.currentChangeNumber === undefined || firstTouch) {
    $("#saunaName").html(rcv[3]);
    localStorage.saunaName = rcv[3];
    $("#saunaName").css({
      visibility: "visible"
    })
    if (firstTouch) {
      firstTouch = false;
    }
    localStorage.currentChangeNumber = rcv[1];
  }
  var ind = 4;
  for (var k in saunaSettings) {
    saunaSettings[k] = rcv[ind].toString();
    ind++;
  }
  if((parseInt(rcv[1]) >=  parseInt(localStorage.currentChangeNumber) && !drumStarted)) {
    localStorage.currentChangeNumber = rcv[1];
//    refresh();
    drawSauna();
  }
}
function checkSettings(rcv) {

  if (!$("[setup]").is(":visible")) {
     rint = setInterval(function() {
      refresh();
    }, 2000);
  }
  var rstr = rcv.join(",");
  if (rstr.indexOf("WRG_PSW") > -1 && localStorage.mode == "url") {
    $("[main]").hide();
    $("[setup]").show();
    clearInterval(rint);
    swal({
      type: "error",
      text: "Please check password again"
    }).then((result) => {
      localStorage.connected = false;
      $("header .row.title").addClass("active");
      $("#saunaName").html("SETTINGS");
      $("[main]").hide();
      $("[setup]").show();
      clearInterval(rint);
      $("#step1_tab").tab("show");
    })
  }
console.log("???? = " + rcv)
  if (command == "checkDomain") {

    if (rcv[4] == "1") {
      localStorage.cloudMode = "ip";
      $("#dName").val(rcv[5] + "." + rcv[6] + "." + rcv[7] + "." + rcv[8] + ":" + rcv[9]);
    } else {
        localStorage.cloudMode = "domain";
      $("#dName").val(rcv[5] + ":" + rcv[6])
    }
    localStorage.saunaid = rcv[2];

    $("#saunaid").val(rcv[2])

  }
  if (command == "changeNetwork") {
    if (rstr.indexOf("LOCAL_NTW_OK") > -1) {
      localStorage.url = "";
      localStorage.mode = "url";
      $("#url").val("");
      $("#pwd").val("");
      $("#url").typeahead("destroy");
      localStorage.password = "";
      swal.close();
      $("#step1_tab").tab("show");
    }
  }
  if (command == "changePassword") {
    if (rstr.indexOf("PSW_OK") > -1) {
      swal({
        type: "success",
        text: "Password changed. Next time connect using new password."
      })
    } else {
      swal({
        type: "warning",
        text: "Something went wrong. Please try again."
      })
    }
  }
  if (command == "setDomain") {
    if (rstr.indexOf("LOCAL_NTW_OK") > -1 || rstr.indexOf("CLOUD_OK") > -1) {
      setTimeout(function() {
          swal({
            type: "success",
            text: "Set domain success. Waiting sauna to connect. 5 seconds",
            showConfirmButton: false,
            timer: 5000
          }).then((result) => {
            if (rstr.indexOf("LOCAL_NTW_OK") > -1) {
              localStorage.mode = "url";
                window.location.reload();
            }
            if (rstr.indexOf("CLOUD_OK") > -1) {
              sset = false;
              localStorage.url = $("#dName").val();
              $("#url").val($("#dName").val());
              localStorage.mode = "socket";
              window.location.reload();
            }


          })
        }, 10000);
    } else {
      swal({
        type: "warning",
        text: "Something went wrong. Please try again."
      })
    }
    if (rstr.indexOf("LOCAL_NTW_OK") > -1) {
      localStorage.mode = "url";
    }
    if (rstr.indexOf("CLOUD_OK") > -1) {
      localStorage.mode = "socket";
    }
  }
  if (command == "checkMode") {

    if (localStorage.sfinn === undefined || localStorage.sinfra === undefined || localStorage.sbio === undefined) {
          switch(rcv[5]) {
            case "1":
              $(".finn").hide();
              $(".steam").hide();
              $(".infra").show();
              $(".infra").css({
                minWidth: "100%"
              })
              break;
            case "2":
            localStorage.sfinn = "on";
            localStorage.sinfra = "off";
            localStorage.sbio = "off";
              $(".finn").show();
              $(".steam").hide();
              $(".infra").hide();
              $(".finn").css({
                minWidth: "98%"
              })
              break;
            case "3":
            localStorage.sfinn = "on";
            localStorage.sinfra = "on";
            localStorage.sbio = "off";
              $(".finn").show();
              $(".infra").show();
              $(".steam").hide();
              $(".finn").css({
                minWidth: "48%"
              })
              $(".infra").css({
                minWidth: "50%"
              })
              break;
            case "4":
              localStorage.sfinn = "on";
              localStorage.sinfra = "on";
              localStorage.sbio = "on";
              $("#sfinn")[0].checked = true;
              $("#sinfra")[0].checked = true;
              $("#sbio")[0].checked = true;
                $(".finn").show();
                $(".infra").show();
                $(".steam").show();

                break;
          }
          var pp = parseInt((($("body").width() - 8) / 5) / 1);
          var rt = parseFloat($("body").width() / 430);
          var nb = 1;

          if (localStorage.sfinn == "on") {
            nb++
          }
          if (localStorage.sinfra == "on") {
            nb++
          }
          if (localStorage.sbio == "on") {
            nb++
          }
          if (localStorage.sroom == "on") {
            nb++
          }
          var a1 = $("body").width() - ((nb -1) * 10);

          var pp1 = parseInt(($("body").width() / nb) / 1);
          if (nb == 3) {
            $("#roomheat_div").css({
              left: "50%"
            })
          }
          if (nb == 4) {
            $("#roomheat_div").css({
              left: "60%"
            })
          }
          $.each($("[bottombuttons]").find("div"), function() {
            $(this).css({
              height: pp * rt,
              width: (100 / nb) + "%",
              minWidth: (100 / nb) + "%",
              maxWidth: (100 / nb) + "%"
            })
          })
      }
      if (localStorage.bt === undefined) {
        if (localStorage.mode == "socket") {
          $(".wall").show();
          $(".bluetooth").hide();
        } else {
          $(".wall").hide();
          $(".bluetooth").show();
        }
      }

  }
  var pp = parseInt((($("body").width() - 8) / 5) / 1);
  var rt = parseFloat($("body").width() / 430);
  var nb = 1;

  if (localStorage.sfinn == "on") {
    nb++
  }
  if (localStorage.sinfra == "on") {
    nb++
  }
  if (localStorage.sbio == "on") {
    nb++
  }
  if (localStorage.sroom == "on") {
    nb++
  }
  var a1 = $("body").width() - ((nb -1) * 10);

  var pp1 = parseInt(($("body").width() / nb) / 1);
  if (nb == 3) {
    $("#roomheat_div").css({
      left: "50%"
    })
  }
  if (nb == 4) {
    $("#roomheat_div").css({
      left: "60%"
    })
  }
  $.each($("[bottombuttons]").find("div"), function() {
    $(this).css({
      height: pp * rt,
      width: (100 / nb) + "%",
      minWidth: (100 / nb) + "%",
      maxWidth: (100 / nb) + "%"
    })
  })
}
function drawSauna(received = true) {

  oldState = saunaSettings.bySaunaState;
  if (saunaSettings.bySaunaState == 0) {
    $(".stop").addClass("active");
  } else {
    $(".stop").removeClass("active");
  }

  if (!noChangeState) {
      if (saunaSettings.bySaunaState == 0) {
        $("[settings]").hide();
        $("#tempok").find("[realvalue]").hide();
        $("[saunaState]").not(".stop").removeClass("active");
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

  if (!settingsStarted) {
    $.each($("[target]").not(".bulb"), function() {
      if (!noChangeState) {
        if (saunaSettings[$(this).attr("target")] != "0" ) {
          $(this).addClass("active");
        } else {
          $(this).removeClass("active");
        }
      }
    });
    if (parseInt(saunaSettings.bS_Light) > 127) {
      var lght = (parseInt(saunaSettings.bS_Light) - 127).toString();
      if (!waterShown) {
        swal({
          type: "warning",
          text: "Water filling!!"
        })
        waterShown = true;
      }
    } else {
      var lght = saunaSettings.bS_Light;
      waterShown = false;
    }
    if (lght == "0" ) {
      $(".bulb").removeClass("active");
    } else {
      $(".bulb").addClass("active");
    }
  }
  if (saunaSettings.byMeasureSaunaTemp  == "255") {
    err = true;
    swal({
      type: "error",
      text: "Sauna Temperature sensor Error!"
    });
  }
  //if (saunaSettings.byMeasuredRoomTemp == "255") {
  if (saunaSettings.byMeasuredRoomTemp == "255") {
    $("#roomheat_div").hide();
    if (!roomRemoved) {
      roomRemoved = true;

    }
    $(".room").hide();
  } else {
    roomRemoved = false;

    if (localStorage.sroom == "on") {
      $(".room").show();
        $("#roomheat_div").show();
    } else {
      $(".room").hide();
        $("#roomheat_div").hide();
    }

  }
  if (saunaSettings.bVentSate != "0") {
//    $("#ventContainer").show();
    $("#venttimer").css({
      visibility: "visible"
    });
    var realtime = parseInt(saunaSettings.byVentilatorIdo) * 60 + parseInt(saunaSettings.byVentilatorIdo_s);
    var st = $('#venttimer').html().split(":");
    var showtime = parseInt(st[0]) * 60 + parseInt(st[1]);
    var dif = parseFloat(Math.abs(showtime - realtime));
    if (dif > 2) {
      startVentTimer(realtime);
      setTimeout(function() {
        $("#ventContainer").show();
      }, 100);
    } else {
    }
  } else {
    clearInterval(ventInt);
    ventInt = null;
//    $("#ventContainer").hide();
    $("#venttimer").css({
      visibility: "hidden"
    });
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
    var sv2 = 0;
    $.each($("#temperature").find("option"), function(ind) {
      if ($(this).attr("value") == saunaSettings.bySaunaTemp) {
        sv2 = ind;
      }
    })
    $("#roomtemp").drum('setIndex', sv);
    $("#temperature").drum('setIndex', sv2);
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
  var sv1 = 0;
  $.each($("#temperingtemp").find("option"), function(ind) {
    if ($(this).attr("value") == saunaSettings.byRoomTemperringTemp) {
      sv1 = ind;
    }
  })
  $("#roomtemp").drum('setIndex', sv);
  $("#temperingtemp").drum('setIndex', sv1);
  $("#real_room_temp").html(saunaSettings.byMeasuredRoomTemp.padStart(2, "0"));

  $("#roomtemp_value").html(saunaSettings.byRoomTemp.padStart(2, "0") + "&#176;C");
  var sv = 0;

  $.each($("#roomtemp").find("option"), function(ind) {
  //  console.log($(this).attr("value"))
    if ($(this).attr("value") == saunaSettings.byRoomTemp) {
      sv = ind;
    }
  })
  $("#roomtemp").drum('setIndex', sv);

  if (saunaSettings.byMeasuredSteam == '255') {
    $("[source='byMeasuredSteam']").hide();
  } else {
    $("[source='byMeasuredSteam']").show();
    $("#real_steam_value").html(saunaSettings.byMeasuredSteam.padStart(2, "0"));
    var sv = 0;
    $.each($("#steam").find("option"), function(ind) {
      if ($(this).attr("value") == saunaSettings.bySteam) {
        sv = ind;
      }
    })
    $("#steam").drum('setIndex', sv);
    $("#steam_value").html(saunaSettings.bySteam.padStart(2, "0"));
  }

  var secs = (parseInt(saunaSettings.bySaunaTimeHour) * 3600) + (parseInt(saunaSettings.bySaunaTimeMin) * 60) + (parseInt(saunaSettings.bySaunaTimeSec));
  var secs1 = (parseInt($("#timerHours_value").html()) * 3600) + (parseInt($("#timerMinutes_value").html()) * 60) + (parseInt($("#timerSeconds_value").html()) * 1);

  var diff = Math.abs(secs - secs1);
  $.each($("#timerHours").find("option"), function(ind) {

    if ($(this).attr("value") == saunaSettings.bySaunaTimeHour) {
      tv2 = ind;
    }
  })
    console.log(tv2)
  $("#timerHours").drum('setIndex',tv2);
  if (diff > 3) {
    var tv2 = 0;

    $("#timerHours_value").html(saunaSettings.bySaunaTimeHour.padStart(2, "0"));

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

var fails = null;
function trySet() {
//  return;
  if (fails == null) {
    fails = 0;
  }
  settingsStarted = true;
  clearInterval(rint);

  var str = {};
  if (saunaSettings.bySaunaTimer === undefined) {
    saunaSettings.bySaunaTimer = "00:30:00";
  }
  saunaSettings.bySaunaTimeHour = parseInt(saunaSettings.bySaunaTimer.split(":")[0]);
  saunaSettings.bySaunaTimeMin = parseInt(saunaSettings.bySaunaTimer.split(":")[1]);
  saunaSettings.bySaunaTimeSec = parseInt(saunaSettings.bySaunaTimer.split(":")[2]);
  if (isNaN(saunaSettings.bySaunaTimeHour)) {
    saunaSettings.bySaunaTimeHour =  parseInt($("#timerHours_value").html());
  }
  if (isNaN(saunaSettings.bySaunaTimeMin)) {
    saunaSettings.bySaunaTimeMin = parseInt($("#timerMinutes_value").html());
  }
  if (isNaN(saunaSettings.bySaunaTimeSec)) {
    saunaSettings.bySaunaTimeSec = parseInt($("#timerSeconds_value").html());
  }
  var secs = (parseInt(saunaSettings.bySaunaTimeHour) * 3600) + (parseInt(saunaSettings.bySaunaTimeMin) * 60) + (parseInt(saunaSettings.bySaunaTimeSec));
  startTimer(secs);
  if (saunaSettings.bySaunaState != oldState) {
    if (saunaSettings.bySaunaTimeHour == 0 && saunaSettings.bySaunaTimeMin < 30) {
      saunaSettings.bySaunaTimeMin = 30;
    }
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
    localStorage.currentChangeNumber++;
    if (localStorage.currentChangeNumber > 255) {
      localStorage.currentChangeNumber = 0;
    }
  var tss = [saunaSettings.bySaunaState,saunaSettings.bySaunaTemp,saunaSettings.byInfraFill1,saunaSettings.byInfraFill2,saunaSettings.bySteam,saunaSettings.bySaunaTimeHour,saunaSettings.bySaunaTimeMin,saunaSettings.bySaunaTimeSec,saunaSettings.bRoomHeat,saunaSettings.byRoomTemp,saunaSettings.byRoomTemperringTemp,saunaSettings.bVentSate,saunaSettings.bS_Light,saunaSettings.bMoodLight,saunaSettings.bSaltWall,saunaSettings.bStarrySky];
  var toSend = "$$$1," + localStorage.currentChangeNumber + "," + ((localStorage.mode == "socket") ? localStorage.saunaid + "," : "") + localStorage.password.trim().padStart(10,"0") + ",";
  toSend += tss.join(",") + ",&&&";

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
  var frm = $("#setData");
  if (localStorage.mode == "url") {

    $.ajax({
      url:  "http://" + localStorage.url + "/?settings=" + toSend,
      type: "GET",
      timeout: 3000,
      statusCode: {
        500: function() {
            setTimeout(function () {
              fails++;
              if (fails > 10) {
                swal({
                  type: "error",
                  text: "Communication error"
                }).then((result) => {
                  $("[main]").hide();
                  $("[setup]").show();
                  clearInterval(rint);
                  $("#step1_tab").tab("show");

                });
              }
              localStorage.currentChangeNumber--;
              rint = setInterval(function() {
                refresh();
              }, 2000);

            }, 2000);
         }
      },
      success: function(result){
        var c = true;
        if (result.indexOf("WRONG PASSWORD") > -1 && localStorage.mode == "url") {
          c = false;
          $.LoadingOverlay("hide");
          swal({
            type: "error",
            text: "Wrong password. Check settings"
          }).then((result) => {
            $("header .row.title").addClass("active");
            $("#saunaName").html("SETTINGS");
              setupDone = false;
              checkStorage();
          });
        }

          clearTimeout(failTimeout);
          fails = null;
          noChangeState = false;
          settingsStarted = false;
          $('#infrafill_div').find('[realvalue]').show();
          $("#infrafill1_value").show();
          $("#infrafill2_value").show();
          refreshState = true;
          resultToObject(result);
          rint = setInterval(function() {
            refresh();
          }, 2000);

      },
      error: function() {
        fails++;
        if (fails > 3) {
          swal({
            type: "error",
            text: "Communication error. Command failed. Try again."
          }).then((result) => {
            settingsStarted = false;
            localStorage.currentChangeNumber--;
            rint = setInterval(function() {
              refresh();
            }, 1000);
          });
        } else {
          setTimeout(function() {
            trySet();
          }, 2000);
        }
      }
    });
    } else {
      var obj = {
        action: "command",
        parameters: toSend
      }
      ws.send(JSON.stringify(obj));
    }

}

function refresh() {
  if (drumStarted) {
    return
  }
 //clearTimeout(waitDrum);
 if (settingsStarted) {
   return;
 }
 $(".drum-wrapper").hide();
  $("[realvalue]").css({
    visibility: "visible"
  });
  if (!initialLoad) {
    return;
  }
  $.ajax({
    url:  "http://" + localStorage.url + "/GetValue",
    timeout: 3000,
    type: "GET",
    statusCode: {
      500: function() {
        /*  setTimeout(function () {
            refresh();
          }, 2000);*/
       }
    },
    success: function(result) {

      setTimeout(function() {
        showResults(result);
      }, 500);
    },
    error: function() {
    }
  });
}
function startDrum(elm,drumid) {
  if (drumStarted) {
    return;
  }
  clearInterval(waitDrum);
  drumStarted = true;
  currentDrum = drumid;
  $(".drum-wrapper").css({
    zIndex: -1
  });
  $('#' + drumid).css({
    zIndex: 9000
  });
  refresh();
  //clearInterval(rint);
  $(elm).css({visibility: 'hidden' });
  if (!elm.hasAttribute("timer")) {
    $(elm).next().css({visibility: 'hidden' });
  }
  $('#' + drumid).show();
  waitDrum = setTimeout(function() {
    drumStarted = false;
    refresh();
  }, 5000);

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
    if (localStorage.mode == "socket") {
      hours = parseInt(timer / 3600, 10)
      minutes = parseInt((timer - (hours * 3600)) / 60, 10);
      seconds = parseInt((timer - ((hours * 3600) + (minutes * 60))) % 60, 10);
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      $("#venttimer").html(minutes + ":" + seconds);
      saunaSettings.byVentilatorIdo = minutes;
      saunaSettings.byVentilatorIdo_s = seconds;
    }
    ventInt = setInterval(function () {
        hours = parseInt(timer / 3600, 10)
        minutes = parseInt((timer - (hours * 3600)) / 60, 10);
        seconds = parseInt((timer - ((hours * 3600) + (minutes * 60))) % 60, 10);
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $("#venttimer").html(minutes + ":" + seconds);
        saunaSettings.byVentilatorIdo = minutes;
        saunaSettings.byVentilatorIdo_s = seconds;
        $("#ventContainer").show();
        if (--timer < 0) {
            timer = null;
            clearInterval(timerInt);
        }
    }, 1000);
}
function subitAndReload() {

}

function scanNetwork() {

  $("#scan").show();
  $("#scanned")
     .css("width", 0 + "%")
     .attr("aria-valuenow", 0);
  $("#buttonScan").prop("disabled", true);
  var networkState = navigator.connection.type;
  var isWifi = networkState == "wifi";
  /*if (!isWifi) {
    swal({
      type: 'warning',
      text: "You are not connected to wi-fi network. Local sauna not accessable."
    });
    return;
  }*/
  var ips = window.localIP.split(".")[0] + "." + window.localIP.split(".")[1] + "." + window.localIP.split(".")[2] + ".";
  setTimeout(function() {
    startScan(ips,1);
  }, 500);
}
window.saunas = [];
function startScan(ips, ip) {
  var current_progress = (parseInt(ip) / 125) * 100;
  $("#scanned")
     .css("width", current_progress + "%")
     .attr("aria-valuenow", parseInt(current_progress));
  $.ajax({
    url:  "http://" + ips + ip + "/GetValue",
    timeout: 300,
    type: "GET",
    success: function(result){

      if (result.indexOf("$$$1") == 0) {
        var r = result.split(",");
        localStorage.name = r[3];
        localStorage.saunaid = r[2];
        localStorage.password = r[2];
        var ss = ips + ip + " (" + r[2] + ")";
        if (window.saunas.indexOf(ss) == -1) {
          window.saunas.push( ips + ip + " (" + r[2] + ")");
        }
      }
      ip++;
      if (ip > 127) {
        listSaunas();
      } else {
        startScan(ips, ip)
      }
    },
    error: function() {
      ip++;
      if (ip > 127) {
        listSaunas();
      } else {
        startScan(ips, ip)
      }
    }
  });
}
function listSaunas() {
//  $("#scan").hide();
  try {
    $("#url").typeahead("destroy");
  } catch(e) {

  }
  $("#buttonScan").prop("disabled", false);

  if (window.saunas.length == 0) {
    swal({
      type: "warning",
      text: "No sauna detected on local network. Please check network or settings."
    })
    $("#url").typeahead({ source: window.saunas });
    retun;
  }
  swal({
    type: "info",
    html: window.saunas.length + " sauna(s) detected. " + ((window.saunas.length > 1) ? " Select one." : "") + "<br /><form><select style='margin-top: 5px;' class='form-control' id='saunas'></select></form>",
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    showConfirmButton: true
  }).then((result) => {
    $("#url").val($("#saunas").val());
    $("#step1_tab").tab("show");
  });
  $.each(window.saunas, function() {
    $("<option value='" + this + "'>" + this + "</option>").appendTo($("#saunas"));
  })
  $("#url").typeahead({ source: window.saunas });
}
function checkReading() {
  if (localStorage.connected != "false") {
    if ($("[setup]").is(":visible")) {

      clearInterval(rint);
    } else {
        rint = setInterval(function() {
          refresh();
        }, 2000);
      }
    }
}
function changeDomain() {
 /*if (localStorage.mode == "url") {
   swal({
     type: "info",
     text: "Please switch sauna to clod mode first",
     allowOutsideClick: false,
     allowEscapeKey: false,
     allowEnterKey: false,
     showCancelButton: false
   }).then((result) => {
     $("#step3_tab").tab("show");
   })
   return false;
 }*/
  var md = $("#switchNetwork").attr("mode");
  var u = $("#dName").val();
  var us = u.split(":");
  command = "setDomain";
  localStorage.currentChangeNumber++;
  if (md == "url") {
    var uss = us[0].split(".");
    if (localStorage.cloudMode == "ip") {
      var toSend = "$$$1," + localStorage.currentChangeNumber + "," +  localStorage.password.trim().padStart(10,"0") + ",13,1," + uss[0] + "," + uss[1] + "," + uss[2] + "," +uss[3] + "," + us[1] + ",&&&";
    } else {
      var u = $("#dName").val().split(":");
      var toSend = "$$$1," + localStorage.currentChangeNumber + "," +  localStorage.password.trim().padStart(10,"0") + ",13,0," + u[0] + "," + u[1] + ",&&&";

    }
  } else {
    var uss = us[0].split(".");
    var toSend = "$$$1," + localStorage.currentChangeNumber + "," + localStorage.password.trim().padStart(10,"0") + ",13,1," + uss[0] + "," + uss[1] + "," + uss[2] + ","  + uss[3] + "," + us[1] + ",&&&";
  }

  swal({
    type: "info",
    text: "Setting domain. Be patient.",
    showConfirmButton: false
  })
  $("#url").val(u);
  if (localStorage.mode == "url") {
    $.ajax({
      url:  "http://" + localStorage.url + "/?settings=" + toSend,
      type: "GET",
      timeout: 3000,
      statusCode: {

      },
      success: function(result){

        showResults(result);

      },
      error: function() {
        swal({
          type: "warning",
          text: "Something went wrong. Please try again."
        })
      }
    });
      } else {
        var obj = {
          action: "command",
          parameters: toSend
        }
      ws.send(JSON.stringify(obj));
    }
}
function openWindow() {

  window.open("http://" + localStorage.url.replace("http://", "") + "/SetNetwork", '_system');
}
