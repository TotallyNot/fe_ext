import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

import { VNode, div, input, label, h3, h4, span } from "@cycle/dom";
import { style, classes } from "typestyle";
import { vertical, width, padding, margin, horizontal } from "csstips";

import { textField, primary, container, item, box } from "common/styles";

import { Output } from "./model";

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

const boxTitle = style(margin(0, 0, 7, 0), {
    fontSize: 14,
    color: primary.toString(),
});

const footNoteContainer = style(vertical, {
    alignItems: "flex-start",
});

const footNoted = style(horizontal);

const footNote = style({
    fontSize: 11,
    marginTop: 4,
    marginLeft: 5,
});

const inlineInput = style(width(60), margin(0, 5));

export const view = (
    output: Output,
    countries$: Observable<VNode>
): Observable<VNode> =>
    combineLatest([output.settings$, countries$]).pipe(
        map(([settings, countries]) =>
            !settings
                ? div()
                : div({ attrs: { class: container } }, [
                      h3({ attrs: { class: section } }, "Notifications"),
                      div({ attrs: { class: item } }, [
                          label({ attrs: { for: "refreshPeriod" } }, [
                              "API refresh period:",
                              input({
                                  attrs: {
                                      class: classes(textField, inlineInput),
                                      value: settings.refreshPeriod,
                                  },
                                  props: {
                                      id: "refreshPeriod",
                                      name: "refreshPeriod",
                                      type: "number",
                                      min: "15",
                                  },
                              }),
                              "seconds",
                          ]),
                      ]),
                      div(
                          {
                              attrs: {
                                  class: classes(item, footNoteContainer),
                              },
                          },
                          [
                              div({ attrs: { class: footNoted } }, [
                                  input({
                                      props: {
                                          type: "checkbox",
                                          id: "world",
                                          name: "world",
                                      },
                                      attrs: {
                                          checked: settings.world,
                                      },
                                  }),
                                  label(
                                      { attrs: { for: "world" } },
                                      "Track entire map *"
                                  ),
                              ]),
                              span(
                                  { attrs: { class: footNote } },
                                  "* this will significantly increase data usage, but will be required for some as of yet unimplementend features"
                              ),
                          ]
                      ),
                      div({ attrs: { class: classes(item, box) } }, [
                          h4({ attrs: { class: boxTitle } }, "data usage:"),
                          span(
                              `~${Math.round(
                                  (60 / settings.refreshPeriod) *
                                      (settings.world ? 11 : 2)
                              )}kB per minute / ~${Math.round(
                                  88.4 / settings.refreshPeriod
                              ) * (settings.world ? 11 : 2)}mB per day`
                          ),
                      ]),
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
                                  checked: settings.reimburse,
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

                      div(
                          {
                              attrs: {
                                  class: classes(item, box),
                              },
                          },
                          [
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
                                  input({
                                      props: {
                                          type: "checkbox",
                                          id: "userLocationCooldownActive",
                                          name: "userLocationCooldownActive",
                                      },
                                      attrs: {
                                          checked:
                                              settings.userLocation
                                                  .cooldownActive,
                                          disabled: !settings.userLocationActive,
                                      },
                                  }),
                                  label(
                                      {
                                          attrs: {
                                              for: "userLocationCooldownActive",
                                          },
                                      },
                                      [
                                          "Cooldown between alerts:",
                                          input({
                                              props: {
                                                  type: "number",
                                                  id: "userLocationCooldown",
                                                  name: "userLocationCooldown",
                                                  min: "0",
                                                  className: classes(
                                                      textField,
                                                      inlineInput
                                                  ),
                                              },
                                              attrs: {
                                                  value:
                                                      settings.userLocation
                                                          .cooldown,
                                                  disabled:
                                                      !settings.userLocationActive ||
                                                      !settings.userLocation
                                                          .cooldownActive,
                                              },
                                          }),
                                          "seconds",
                                      ]
                                  ),
                              ]),
                          ]
                      ),
                      countries,
                  ])
        )
    );
