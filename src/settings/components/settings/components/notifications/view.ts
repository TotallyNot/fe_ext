import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { VNode, div, input, label, h3, h4, p } from "@cycle/dom";
import { style, classes } from "typestyle";
import { vertical, flex, width, padding, margin, horizontal } from "csstips";

import { textField, background } from "common/styles";

import { Output } from "./model";

const container = style(vertical, width(400), padding(0, 10));

const item = style(horizontal, {
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

const checkboxRow = classes(
    item,
    style({
        $nest: {
            label: {
                marginRight: 15,
            },
        },
    })
);

const section = style(margin(5, 0, 10, 0));

const subSection = style(margin(3, 0, 7, 0));

const box = classes(
    style(padding(10, 15), vertical, flex, {
        backgroundColor: background.lighten(0.05).toString(),
    })
);

export const view = (output: Output): Observable<VNode> =>
    output.settings$.pipe(
        map(settings =>
            !settings
                ? div()
                : div({ attrs: { class: container } }, [
                      h3({ attrs: { class: section } }, "Notifications"),
                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "event",
                                  name: "event",
                              },
                              attrs: {
                                  checked: settings.event,
                              },
                          }),
                          label({ attrs: { for: "event" } }, "Events"),
                      ]),
                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "mail",
                                  name: "mail",
                              },
                              attrs: {
                                  checked: settings.mail,
                              },
                          }),
                          label({ attrs: { for: "mail" } }, "Mail"),
                      ]),

                      h4({ attrs: { class: subSection } }, "Timers"),
                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "war",
                                  name: "war",
                              },
                              attrs: {
                                  checked: settings.war,
                              },
                          }),
                          label({ attrs: { for: "war" } }, "War / travel"),
                      ]),
                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "reimburse",
                                  name: "reimburse",
                              },
                              attrs: {
                                  checked: settings.war,
                              },
                          }),
                          label(
                              { attrs: { for: "reimburse" } },
                              "Reimbursement"
                          ),
                      ]),

                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "training",
                                  name: "training",
                              },
                              attrs: {
                                  checked: settings.training,
                              },
                          }),
                          label(
                              { attrs: { for: "training" } },
                              "Training queue"
                          ),
                      ]),

                      h4(
                          { attrs: { class: subSection } },
                          "Unit notifications"
                      ),
                      div({ attrs: { class: item } }, [
                          input({
                              props: {
                                  type: "checkbox",
                                  id: "userLocationActive",
                                  name: "userLocationActive",
                              },
                              attrs: {
                                  checked: settings.userLocationActive,
                              },
                          }),
                          label(
                              { attrs: { for: "userLocationActive" } },
                              "For the user's location"
                          ),
                      ]),

                      div({ attrs: { class: box } }, [
                          div({ attrs: { class: checkboxRow } }, [
                              input({
                                  props: {
                                      type: "checkbox",
                                      id: "userLocationAllies",
                                      name: "userLocationAllies",
                                  },
                                  attrs: {
                                      checked: settings.userLocation.allies,
                                      disabled: !settings.userLocationActive,
                                  },
                              }),
                              label(
                                  { attrs: { for: "userLocationAllies" } },
                                  "Allies"
                              ),
                              input({
                                  props: {
                                      type: "checkbox",
                                      id: "userLocationAxis",
                                      name: "userLocationAxis",
                                  },
                                  attrs: {
                                      checked: settings.userLocation.axis,
                                      disabled: !settings.userLocationActive,
                                  },
                              }),
                              label(
                                  { attrs: { for: "userLocationAxis" } },
                                  "Axis"
                              ),
                          ]),
                          div({ attrs: { class: item } }, [
                              label(
                                  { attrs: { for: "userLocationCooldown" } },
                                  "Cooldown (in seconds):"
                              ),
                              input({
                                  props: {
                                      type: "number",
                                      id: "userLocationCooldown",
                                      name: "userLocationCooldown",
                                      className: textField,
                                  },
                                  attrs: {
                                      value: settings.userLocation.cooldown,
                                      disabled: !settings.userLocationActive,
                                  },
                              }),
                          ]),
                      ]),
                  ])
        )
    );
