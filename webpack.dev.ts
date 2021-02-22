import { DefinePlugin } from "webpack";
import merge from "webpack-merge";
import common from "./webpack.common";

export default merge(common, {
    mode: "development",
    devtool: "inline-source-map",

    plugins: [
        new DefinePlugin({
            __DEBUG__: true,
        }),
    ],
});
