import { join } from "path";
import { Configuration } from "webpack";

const config: Configuration = {
    entry: {
        background: join(__dirname, "src/background/index.ts"),
        popup: join(__dirname, "src/popup/index.ts"),
    },
    output: {
        path: join(__dirname, "dist/js"),
        filename: "[name].js",
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            common: join(__dirname, "src/common"),
        },
    },
    node: {
        fs: "empty",
    },
};

export default config;
