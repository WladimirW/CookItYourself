
if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
        value: function (callback, type, quality) {
            var binStr = atob(this.toDataURL(type, quality).split(',')[1]), len = binStr.length, arr = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = binStr.charCodeAt(i);
            }
            callback(new Blob([arr], { type: type || 'image/png' }));
        }
    });
}
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
        var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }
        return new Promise(function (resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    };
}