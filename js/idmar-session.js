/* gate */
(function(){try{var p=location.pathname;var isLogin=/(?:^|\/)(login\.html|index\.html)?$/i.test(p)&&!/validador|historico|forense/i.test(p);var has=sessionStorage.getItem('IDMAR_SESSION')||sessionStorage.getItem('NAV_SESSION');if(!has&&!isLogin){location.replace('login.html');}}catch(e){}})();
