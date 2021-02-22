import { DefinePlugin } from "webpack";
import TerserPlugin from "terser-webpack-plugin";
import LicensePlugin from "webpack-license-plugin";

import merge from "webpack-merge";
import common from "./webpack.common";

export default merge(common, {
    mode: "production",
    plugins: [
        new DefinePlugin({
            __DEBUG__: false,
        }),
        new LicensePlugin(),
    ],

    optimization: {
        minimize: true,
        usedExports: true,
        sideEffects: true,

        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
});
