var customerSession = null;
var firstTouch = true;
function ReconnectingWebSocket(saunaid) {
    var uu = localStorage.url.split(":")[1];

    var url = localStorage.url.split(":")[0] + ":" + (parseInt(localStorage.url.split(":")[1]) + 1).toString() + "/?saunaid=" + saunaid;

    this.debug = false;
    this.reconnectInterval = 1000;
    this.timeoutInterval = 5000;
    this.redirectInterval = null;
    var self = this;
    var ws;
    var forcedClose = false;
    var timedOut = false;
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.URL = url; // Public API
   this.refreshUserTimeout = null;
this.ot = null;
    this.onopen = function () {

        var reconnect = false;
        if (url.indexOf("?reconnect=") > -1) {
            reconnect = true;
        }
        url = ('https:' == document.location.protocol ? 'ws://' : 'ws://') + localStorage.url.split(":")[0] + ":" + (parseInt(localStorage.url.split(":")[1]) + 1).toString() + "/?saunaid=" + saunaid;
        this.ot = setTimeout(function() {
          $("[main]").hide();
          swal({
            type: 'error',
            text: "Connection fail.",
            confirmButtonText: "Check settings",
            cancelButtonText: "Check settings",
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,

          }).then((result) => {
            $("[main]").hide();
            $("header .row.title").addClass("active");
            $("#saunaName").html("SETTINGS");
            $("[main]").hide();
            $("[setup]").show();
            clearInterval(rint);
          });
        }, 5000);
    }


    this.onclose = function (e) {
		//ws.send("remove#" + localStorage.uid );

    };

    this.onconnecting = function (e) {
    };

    this.onmessage = function (e) {

      var obj = $.parseJSON(e.data);

      if (obj.action == "parameters") {
        clearTimeout(this.ot); 
        swal.close();
        if (!$("[setup]").is(":visible")) {
          $("[main]").show();
        }
        initialLoad = true;
        localStorage.connected = true;
        try {
          var pr = obj.parameters.split(",");
          if (localStorage.currentChangeNumber === undefined || firstTouch) {
            $("#saunaName").html(pr[3]);
            $("#saunaName").css({
              visibility: "visible"
            })
            if (firstTouch) {
              firstTouch = false;
            }
            localStorage.currentChangeNumber = pr[1];
            var obj = {
              action: "command",
              parameters: "$$$1," + localStorage.currentChangeNumber + "," + localStorage.saunaid + "," + localStorage.password.trim().padStart(10,"0") + ",14,&&&"
            }
            ws.send(JSON.stringify(obj));
          }

          if (pr[1] == localStorage.currentChangeNumber && !drumStarted) {
            noChangeState = false;
            settingsStarted = false;
            $('#infrafill_div').find('[realvalue]').show();
            $("#infrafill1_value").show();
            $("#infrafill2_value").show();
            refreshState = true;
            if (currentDrum != "") {
              refresh()
              currentDrum = "";
            }
            showResults(obj.parameters);
          }
        } catch(err) {

        }
      }
    };
    this.onerror = function (e) {

    };

    function connect(reconnectAttempt, reconnect) {

        if (reconnect) {
            if (url.indexOf("&reconnect=yes") == -1) {

            }

        } else {
            url = ('https:' == document.location.protocol ? 'ws://' : 'ws://') + localStorage.url.split(":")[0] + ":" + (parseInt(localStorage.url.split(":")[1]) + 1).toString() + "/?saunaid=" + saunaid;
        }
        ws = new WebSocket(url, this.protocols);

        self.onconnecting();

        var localWs = ws;
        var timeout = setInterval(function () {
            try {
                timedOut = true;
                localWs.close();
                timedOut = false;
                clearInterval(timeout);
            } catch (Error) {

            }
        }, self.timeoutInterval);

        ws.onopen = function (event) {
            clearTimeout(timeout);

            self.readyState = WebSocket.OPEN;
            reconnectAttempt = false;
            self.onopen(event);
        };

        ws.onclose = function (event) {
            clearTimeout(timeout);
            ws = null;
            if (forcedClose) {
                self.readyState = WebSocket.CLOSED;
                self.onclose(event);
            } else {
                self.readyState = WebSocket.CONNECTING;
                self.onconnecting();
                if (!reconnectAttempt && !timedOut) {

                    self.onclose(event);
                }
                setTimeout(function () {
                    connect(true, true);
                }, self.reconnectInterval);
            }
        };
        ws.onmessage = function (event) {
            self.onmessage(event);
        };
        ws.onerror = function (event) {

            clearInterval(self.redirectInterval);
            self.redirectInterval = null;
        };
    }
    connect(url, false);

    this.send = function (data) {

        if (ws) {
            return ws.send(data);
            return true;
        } else {
            var sd = setInterval(function () {
                if (ws) {

                    clearInterval(sd);
                    return ws.send(data);
                }
            }, 500);
        }
    };
    this.close = function () {

        forcedClose = true;
        if (ws) {
            console.log('ws close');
            ws.close();
        }
    };

    this.logout = function () {

        if (self.redirectInterval != null) {
        }
        clearInterval(self.redirectInterval);
    };

    /**
     * Additional public API method to refresh the connection if still open (close, re-open).
     * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
     */
    this.refresh = function () {
        if (ws) {
            ws.close();
        }
    };
}

/**
 * Setting this to true is the equivalent of setting all instances of ReconnectingWebSocket.debug to true.
 */
ReconnectingWebSocket.debugAll = false;
