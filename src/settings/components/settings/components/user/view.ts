import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { VNode, div, h3, label, input, button } from "@cycle/dom";
import { style, classes } from "typestyle";
import { width, margin } from "csstips";

import {
    container,
    section,
    outlineButton,
    textField,
    item,
} from "common/styles";

const apiKey = style(width(110), margin(0, 7));

import { State } from "./model";

export const view = (state$: State): Observable<VNode> =>
    state$.pipe(
        map(state =>
            state.loggedIn
                ? div({ attrs: { class: container } }, [
                      h3(
                          { attrs: { class: section } },
                          `Welcome ${state.name}!`
                      ),
                      div({ attrs: { class: item } }, [
                          label({ attrs: { for: "apiKey" } }, "API key:"),
                          input({
                              attrs: {
                                  class: classes(textField, apiKey),
                                  value: state.apiKey,
                                  disabled: true,
                                  id: "apiKey",
                                  name: "key",
                              },
                          }),
                          button(
                              {
                                  attrs: {
                                      class: classes("logout", outlineButton),
                                  },
                              },
                              "logout"
                          ),
                      ]),
                  ])
                : div({ attrs: { class: container } }, [
                      h3(
                          { attrs: { class: section } },
                          "You are not logged in!"
                      ),
                      div({ attrs: { class: item } }, [
                          label({ attrs: { for: "apiKey" } }, "API key:"),
                          input({
                              attrs: {
                                  class: classes(apiKey, textField),
                                  id: "apiKey",
                                  name: "key",
                              },
                          }),
                          button(
                              {
                                  attrs: {
                                      class: classes("login", outlineButton),
                                  },
                              },
                              "login"
                          ),
                      ]),
                  ])
        )
    );
