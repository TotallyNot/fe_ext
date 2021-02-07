import { color, rgba } from "csx";
import { style } from "typestyle";

export const background = color("#333333");
export const text = color("#FFFFFF");
export const primary = color("#42a4f5");
export const allies = color("#2fba51");
export const axis = color("#db361d");
export const error = color("#ff2b05");

export const outlineButton = style({
    borderColor: primary.toString(),
    color: primary.toString(),
    background: rgba(0, 0, 0, 0).toString(),
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "solid",
    textDecoration: "none",
    display: "inline-block",
    padding: [1, 5, 3, 5],
    $nest: {
        "&:hover": {
            borderColor: primary.lighten(0.1).toString(),
            color: primary.lighten(0.1).toString(),
        },
    },
});

export const textField = style({
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: background.lighten(0.1).toString(),
    borderRadius: 3,
    backgroundColor: background.darken(0.05).toString(),
    color: text.toString(),
    padding: 4,

    $nest: {
        "&:focus": {
            outline: "none",
            borderColor: primary.toString(),
        },
    },
});
