function Demo(pageAlert, metric, defaults) {
    const t = this;

    this.States = {
        CONSENT: "CONSENT",
        LOADING: "LOADING",
        RECORDING: "RECORDING",
        PLAYBACK: "PLAYBACK",
        SUMMARY: "SUMMARY"
    };

    let current_state = t.States.CONSENT
      , o = !1
      , n = null
      , s = !1
      , i = 0
      , r = 0
      , l = 0
      , d = !0
      , c = null
      , m = !1
      , subject = $("#media-subject")
      , video = $("#media-stimulus")
      , video_playback = $("#media-object");

    let recorder, stream, capturer, beam, demo_type;

    const u = 20, p = metric, q = defaults;

    let g = AsyncPlayer("media-stimulus")
      , h = AsyncPlayer("media-object")
      , j = AsyncPlayer("media-subject")
      , y = new Graph("#svg-curve",{
                emoRoot: "#emotion-buttons",
                buttons: p,
                defaults: q
            })
      , b = Summarizer(p)
      , w = pageAlert;


    this.state = (()=>current_state),
    this.start = (()=>Promise.all([k(), v()]).then(C).then(()=>{
                    A()
                })["catch"](e=>{
                    w.warn(e)
                }));

    const f = (e,t)=>{
        let a = ()=>new Promise(e=>{
            $(t).fadeIn(300, ()=>{
                e()
            })
        });
        return new Promise(t=>{
            $(e).fadeOut(200, ()=>{
                t()
            })
        }).then(a)
    }

      , lock = (orientation)=>{
        // Go into full screen first
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        }
        try{
          // Then lock orientation
          screen.orientation.lock(orientation);
        }
        catch{
          console.log("Screen Orientation Web API Not Supported");
        }


    }

      , v = ()=>new Promise(e=>{
        $("#demo-consent").one("click", ()=>{
            lock("landscape-primary");
            f("#consent-container", "#loading-container").then(e)
        })
    })

      , k = ()=>new Promise((e,t)=>{
        $("#loading-text").text(messages.loadingPlayer);
        const video_src = video.attr("data");
        g("load", video_src, a=>{
            "loaded" === a ? e() : "error" === a ? w.warn(messages.videoLoadingFailure) : t(a)
        })
    })

      , C = ()=>new Promise((e,t)=>{
        
        let a = document.getElementById("facevideo-node");

        (c = new affdex.CameraDetector(a)).detectAllEmotions(),
            c.detectAllExpressions(),c.detectAllAppearance(),
            c && !c.isRunning && c.start(),

            c.addEventListener("onWebcamConnectSuccess", ()=>{

            }),
            c.addEventListener("onWebcamConnectFailure", ()=>{
                t(messages.webcamFailure)
            }),
            c.addEventListener("onInitializeSuccess", ()=>{
                e()
            }),
            c.addEventListener("onImageResultsSuccess", P),

            $("#facevideo-node video")[0].addEventListener("playing", ()=>{
                $("#loading-text").text(messages.detectorLoaded)
            })
        })

      , P = e=>{
        if (current_state === t.States.RECORDING && s) {
            m || (i = Date.now(),m = !0), e.length > 0 
            ? data = Object.assign({}, e[0].emotions, e[0].expressions) 
            : data = undefined,b.log(data);

            const t = S();
            l > u && d && (d = !1, w.warn(messages.noFace)),
            e.length > 0 ? (d || (d = !0, w.hide()),l = 0,y.updatePlot(data, t)) : (l++,y.noData(t))
        }
    }
      , S = ()=>Date.now() - i

      , startPresenting = async () => {
          await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: "screen" },
            audio: false
          }).catch(e=>{w.warn(messages.noPresent)}).then(_stream=>{

          video.attr("poster", DEMO_TYPE.present);
          video_playback.attr("poster", DEMO_TYPE.play);

          stream = _stream;
          try{
            recorder = new MediaRecorder(stream);
          }
          catch{
            $("#checkMediaRecorder").html(messages.noMediaRecorder);
            s = !0,startCapturing();
            return;
          }

          const chunks = [];

          recorder.onstart = e => {
            s = !0,startCapturing()
            setTimeout(presentTimeout, DEMO_TYPE.presentTimeout*1000);
          },
          recorder.ondataavailable = e => {
            chunks.push(e.data);
          },
          recorder.onstop = e => {
            const completeBlob = new Blob(chunks, { type: chunks[0].type });
            video_playback.attr("src", URL.createObjectURL(completeBlob));
            video_playback.attr("data", null);
          },
          recorder.onerror = e => {
          };

          recorder.start();
          video.srcObject = stream;

        })

    }

      , stopPresenting = ()=>{
          recorder && recorder.state === "recording" && recorder.stop();
          stream && stream.getVideoTracks()[0].stop();
    }

    , startCapturing = async (audio=false) =>{
        await navigator.mediaDevices.getUserMedia({
          video: { mirrored: true },
          audio: audio
        }).catch(e=>{w.warn(messages.noPresent)}).then(_stream=>{

              if(demo_type==="watch"){
                let mirror = document.querySelector('#media-stimulus')
                  , buffer = document.querySelector('#media-object');

                mirror.style.webkitTransform = buffer.style.webkitTransform = "scaleX(-1)";
                mirror.style.transform = buffer.style.transform = "scaleX(-1)";
                
                mirror.srcObject = _stream;
                mirror.play();
                mirror.onplay = function() {
                  video.prop('muted', true);
                  video.css("display", "block");
                };
              }

              beam = _stream;
              try{
                capturer = new MediaRecorder(beam);
              }
              catch{
                $("#checkMediaRecorder").html(messages.noMediaRecorder);
                return;
              }
              const chunks = [];

              capturer.onstart = e => {
              },
              capturer.ondataavailable = e => {
                chunks.push(e.data);
              },
              capturer.onstop = e => {
                const completeBlob = new Blob(chunks, { type: chunks[0].type });
                if(demo_type==="watch"){
                  video_playback.attr("src", URL.createObjectURL(completeBlob));
                  video_playback.attr("data", null);
                }
                else{
                  subject.attr("src", URL.createObjectURL(completeBlob));
                  j('load'),j("seek", 1000000000),j("seek", 0),j("pause");
                }
              },
              capturer.onerror = e => {
              };

              capturer.start();

            })
    }

      , stopCapturing = ()=>{
            capturer && capturer.state === "recording" && capturer.stop();
            beam && beam.getVideoTracks()[0].stop();
    }

      , startMirroring = ()=>{
          $("#checkMediaRecorder").html(messages.verbalAnalyticsBody);
          $('#rhsCardHeader').text(messages.verbalAnalyticsCard)
      }


      , A = ()=>{
            w.hide(),
            f("#loading-container", "#demo-container").then(()=>{
                current_state = t.States.RECORDING,
                w.warn(messages.demoMessage),
                y.initPlot(document.getElementById("media-stimulus").duration, $("#video-wrapper").width()),
                y.initButtons(),

                $("#startVideo").one("click", ()=>{
                    $("#showControl").fadeIn(100),
                    demo_type = "play",
                    g("play", null, (e,o)=>{
                        "video start" === e || (
                            "buffer finished" === e ? m && (s = !0, r += o) 
                            : "buffer started" === e ? m && (s = !1) 
                            : "ended" === e ? (s = !1, current_state === t.States.PLAYBACK ? y.translateCursor(0) : E(), g("seek", 0), g("pause"), stopCapturing())
                            : "network fail" === e ? (s = !1, c.stop(), w.warn("No Internet")) 
                            : "error" === e && w.warn(o)
                        )
                    }),
                    s = !0,
                    startCapturing();
                }),
                $("#startShare").one("click", ()=>{
                    $("#showControl").fadeIn(100),
                    y.clearPlot(DEMO_TYPE.presentTimeout),
                    demo_type = "present",
                    startPresenting();
                }),
                $("#startMirror").one("click", ()=>{
                    $("#showControl").fadeIn(100),
                    y.clearPlot(60),
                    demo_type = "watch",
                    s = !0,
                    startMirroring();
                    startCapturing(true);
                }),                
                $("#stopFACS").one("click", ()=>{
                    if(demo_type === "play"){
                      (E(a=>{
                        "stop recording" === a ? stopCapturing() : !0}),g("pause"))
                    }
                    else if(demo_type === "present"){
                      E(a=>{
                          "stop recording" === a ? (stopPresenting(),stopCapturing()) : "loaded" === a ? (h("seek", 0), h("pause")) : !0
                      });
                    }
                    else if(demo_type === "watch"){
                      E(a=>{
                          "stop recording" === a ? (stopCapturing()) : "loaded" === a ? (h("seek", 0), h("pause")) : !0
                      });
                    }                    

                })
            })
    }

    , presentTimeout = ()=>{
        s && $("#stopFACS").length && $("#stopFACS").click();
    }


      , E = (p=()=>{})=>{
        current_state = t.States.PLAYBACK,
        c.stop(),
        b.done(),
        w.hide(),
        p("stop recording"),
        $("#alert").data("bs.modal")._config.keyboard = !0,
        $("#alert").data("bs.modal")._config.backdrop = !0,
        w.warn(messages.videoEnd),
        $("#alert").on("hidden.bs.modal", ()=>{
            const e = video_playback.attr("data");
            h("load", e, p),

            video.css("display", "none"),
            subject.css("display", "block"),            
            video_playback.css("display", "block"),

            (demo_type === "play" && subject.prop('muted', true)),

            $("#showSubject").fadeIn(200),
            $("#showSummary").fadeIn(200),
            $("#showControl").fadeOut(100),

            bindPlayerOnKeypress(),
            bindPlayerOnD3()
        })
    }

      , bindPlayerOnD3 = ()=>{
        let e = y.initializeCursor();
        B(),
        e.call(d3.drag().on("drag", N).on("start", L).on("end", R)),
        y.getCurveBox().on("click", O),
        $("#summaryButton").on("click", x)
    }
      , bindPlayerOnKeypress = ()=>{
        document.onkeypress = (e=>{
            32 == (e || window.event).charCode && ((h("getPlayingState") || j("getPlayingState")) ? (h("pause"),j("pause")) : (h("resume"),j("resume")))
        }
        )
    }
      , N = ()=>{
        const e = y.clipX(d3.event.x), t = y.playbackFromX(e);
        y.translateCursor(e),
        h("seek", t),
        j("seek", t)
    }
      , L = ()=>{
        (h("getPlayingState") || j("getPlayingState")) && (clearInterval(n), o = !0, h("pause"), j("pause")),
        y.setMousePointerDragging()
    }
      , R = ()=>{
        o && (h("resume"), j("resume"), o = !1, h("setPlayingState", !0), j("setPlayingState", !0), B()),
        y.setMousePointerUndragging()
    }
      , O = function() {
        const e = y.clipX(d3.mouse(this)[0]) , t = y.playbackFromX(e);
        (h("getPlayingState") || j("getPlayingState")) ? (clearInterval(n), y.translateCursor(e), h("seek", t), j("seek", t), B()) : (y.translateCursor(e), h("seek", t), j("seek", t));
    }
      , B = ()=>{
            n = setInterval(()=>{
                        const e = y.playbackToX(h("getCurrentTime"));
                        y.translateCursor(e)
                    }
                , 50)
    }

      , x = ()=>{
            g("pause"),
            f("#demo-container", "#summary-container"),
            $("#demoButton").on("click", ()=>{
                f("#summary-container", "#demo-container")
            });
            setSubjectDuration();
            setObjectDuration();
    }

      , getDuration =  e=>{
          let video = document.getElementById(e)
            , duration = Math.round(video.duration);

          return duration === Infinity ? "-" : duration || "--";
      }

      , setObjectDuration = ()=>{
          let subject = getDuration("media-object");
          $("#summaryObject").html(subject);
      }

      , setSubjectDuration = ()=>{
          let subject = getDuration("media-subject");
          $("#summarySubject").html(subject);
      }

}

browserCheck = ()=>!0;



let FACSDemo = null;
const pageAlert = Alert("alert");

$(document).ready(()=>{
    FACSDemo = new Demo(pageAlert, metric, defaults),
    browserCheck() ? FACSDemo.start() : pageAlert.warn(messages.incompatableBrowser)
});
