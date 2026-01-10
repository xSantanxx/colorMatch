export const colorCheck = (color, palette) => {
    // console.log(color);

    let r = Number(color[0]) / 255;
    let g = Number(color[1]) / 255;
    let b = Number(color[2]) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let d = max - min;

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if( d !== 0){
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    let comH;

    comH = (h + 180) % 360;
    let arrCom = [h, s, l, comH]
    // console.log('Original Hue: ' + h);
    // console.log('Saturation: ' + s);
    // console.log('Lightness: ' + l);
    // console.log('Complementary Hue: ' + comH);
    return arrCom;
}