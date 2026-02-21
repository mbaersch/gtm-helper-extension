(function() {

  function loadSettings() {
    try {
      let settings = localStorage.getItem("igtm_settings");
      return settings ? JSON.parse(settings) : {};
    } catch (e) {
      return {}; 
    }
  }
  
  function injectPastedGtmCode(gtmCode, settings) {
    var code = gtmCode.replace("<script>", "").replace("</script>", "");
    
    // Advanced Parameters (gtm_auth, gtm_preview) integrieren, falls vorhanden
    if (settings.igtmGtmAuth || settings.igtmGtmPreview) {
      var authParam = settings.igtmGtmAuth ? "&gtm_auth=" + settings.igtmGtmAuth : "";
      var previewParam = settings.igtmGtmPreview ? "&gtm_preview=" + settings.igtmGtmPreview : "";
      var cookiesWinParam = (settings.igtmGtmAuth || settings.igtmGtmPreview) ? "&gtm_cookies_win=x" : "";
      
      // Suche nach der GTM URL im Code und hänge die Parameter an
      var urlRegex = /(googletagmanager\.com\/gtm\.js\?id=[A-Z0-9-]+)/g;
      code = code.replace(urlRegex, function(match) {
        return match + authParam + previewParam + cookiesWinParam;
      });
    }

    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    
    // Injektions-Position (Head vs Body)
    var target = (settings.igtmPos === "body") ? document.body : document.head;
    if (target) {
      target.appendChild(script);
    }
  }

  function hideContainerQuality() {
    var stl = document.createElement("span");
    stl.innerHTML = '<style>div[data-ng-if="::ctrl.isTagHealthEnabled"]{display:none}</style>';
    document.body.appendChild(stl);
  }

  function pushToDataLayer(vars) {
    var code = "window.dataLayer = window.dataLayer || []; window.dataLayer.push(" + JSON.stringify(vars) + ");";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = code;
    document.head.appendChild(script);
  }
  
  function addExtraScript(scode) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.textContent = scode;
    document.head.appendChild(script);
  }
  
  // Ausführung der Funktionen je nach Einstellungen  
  (function() {
    var settings = loadSettings();
    if (settings.hideQuality) 
      hideContainerQuality();

    // Wenn mindestens eine der Optionen aktiviert ist, wird der entsprechende Code injiziert:
    if (settings.igtm_Status || settings.igtmAddInit || settings.igtmAddCode) {
      if (settings.igtmAddCode && settings.igtmCode) {
        addExtraScript(settings.igtmCode);
      }
      if (settings.igtmAddInit && settings.igtmInit) {
        try {
          var initObj = JSON.parse(settings.igtmInit);
          pushToDataLayer(initObj);
        } catch(e) {
          console.error("Error parsing object for dataLayer. Please provide a valid JSON string: ", e);
        }
      }
      if (settings.igtmGtmCode && settings.igtm_Status) {
        injectPastedGtmCode(settings.igtmGtmCode, settings);
      }
    }
     
  })();
})();
