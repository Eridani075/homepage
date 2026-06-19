import { Hct, SchemeVibrant, MaterialDynamicColors } from '@material/material-color-utilities';
const scheme = new SchemeVibrant(Hct.fromInt(0xff0000), false, 0);
console.log(scheme.surface, scheme.outline);
