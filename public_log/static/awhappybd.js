setInterval(() => {
    var d = new Date();
    document.getElementById('CurrentTimeUTC').textContent = d.toUTCString();
    document.getElementById('CurrentTime').textContent = d.toLocaleString();

    
}, 900);