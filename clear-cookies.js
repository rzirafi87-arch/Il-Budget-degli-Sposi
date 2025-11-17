document.cookie.split(';').forEach(function(c) {
  document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date(0).toUTCString() + ';path=/');
});
localStorage.clear();
