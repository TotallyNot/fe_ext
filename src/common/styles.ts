import { color, rgba } from "csx";
import { style, classes } from "typestyle";
import { vertical, horizontal, flex, width, padding, margin } from "csstips";

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
    padding: "2px 5px 3px 5px",
    $nest: {
        "&:hover": {
            borderColor: primary.lighten(0.1).toString(),
            color: primary.lighten(0.1).toString(),
        },
        "&:focus": {
            outline: "none",
        },
        "&:active": {
            borderColor: primary.darken(0.1).toString(),
            color: primary.darken(0.1).toString(),
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
        "&:disabled": {
            color: text.darken(0.4).toString(),
            backgroundColor: background.darken(0.02).toString(),
        },
    },
});

export const container = style(
    vertical,
    width(400),
    padding(0, 10),
    margin(0, 0, 20, 0)
);

export const item = style(horizontal, {
    alignItems: "center",
    $nest: {
        "input[type=checkbox]": {
            marginRight: 5,
        },
        "input[type=number]": {
            marginLeft: 5,
        },
        "&:not(:last-child)": {
            marginBottom: 10,
        },
    },
});

export const checkboxRow = classes(
    item,
    style({
        $nest: {
            label: {
                marginRight: 15,
            },
        },
    })
);

export const section = style(margin(5, 0, 10, 0));

export const subSection = style(margin(3, 0, 7, 0));

export const box = classes(
    style(padding(10, 15), vertical, flex, {
        backgroundColor: background.lighten(0.05).toString(),
    })
);

export const inlineInput = style(width(60), margin(0, 5));
