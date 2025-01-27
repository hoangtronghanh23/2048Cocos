export class Utils {

    public static isString (str: any) {
        return typeof str === "string";
    }

    public static defaultValue<T> (a: T, b: T) {
        return this.defined(a) ? a : b;
    }

    public static defined (val: any) {
        return val !== undefined && val !== null;
    }

    public static createGuid () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            let r = (Math.random() * 16) | 0;
            let v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    public static base64Encode (input: string) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
        input = this.utf8Encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    }

    public static base64Decode (input: string) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1;
        var chr2;
        var chr3;
        var enc1;
        var enc2;
        var enc3;
        var enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = this.utf8Decode(output);
        return output;
    }

    public static utf8Encode (string: string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    }

    public static utf8Decode (utftext: string) {
        var string = "";
        var i = 0;
        var c = 0;
        var c1 = 0;
        var c2 = 0;
        var c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }

    public static formatBytes (bytes: number, decimals: number = 1) {

        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];

    }


    public static createScriptBlob (scriptStr: string) {
        const jsBlob = new Blob([scriptStr], {
            type: 'application/javascript'
        });
        return jsBlob;
    }


    public static debounce (fn: Function, context: any, delay?: number): Function {
        delay = delay ?? 300;
        let timer: number | undefined;
        return function () {
            let args = arguments;
            if (Utils.defined(timer)) {
                clearTimeout(timer);
            }
            //@ts-ignore
            timer = setTimeout(() => {
                timer = undefined;
                fn.apply(context, args);
            }, delay);
        }
    }

    public static combine (object1: any, object2: any, deep?: boolean) {
        deep = this.defaultValue(deep, false);

        let result: Record<any, any> = {};

        let object1Defined = this.defined(object1);
        let object2Defined = this.defined(object2);
        let property;
        let object1Value;
        let object2Value;
        if (object1Defined) {
            for (property in object1) {
                if (object1.hasOwnProperty(property)) {
                    object1Value = object1[property];
                    if (
                        object2Defined &&
                        deep &&
                        typeof object1Value === "object" &&
                        object2.hasOwnProperty(property)
                    ) {
                        object2Value = object2[property];
                        if (typeof object2Value === "object") {
                            result[property] = this.combine(object1Value, object2Value, deep);
                        } else {
                            result[property] = object1Value;
                        }
                    } else {
                        result[property] = object1Value;
                    }
                }
            }
        }
        if (object2Defined) {
            for (property in object2) {
                if (
                    object2.hasOwnProperty(property) &&
                    !result.hasOwnProperty(property)
                ) {
                    object2Value = object2[property];
                    result[property] = object2Value;
                }
            }
        }
        return result;
    }

    public static clone (object: any, deep: boolean) {
        if (object === null || typeof object !== "object") {
            return object;
        }

        deep = this.defaultValue(deep, false);

        var result = new object.constructor();
        for (var propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                var value = object[propertyName];
                if (deep) {
                    value = this.clone(value, deep);
                }
                result[propertyName] = value;
            }
        }

        return result;
    }

}

