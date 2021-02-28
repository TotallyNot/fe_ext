import { join } from "path";
import { Configuration } from "webpack";
import CopyPlugin from "copy-webpack-plugin";

const config: Configuration = {
    entry: {
        background: join(__dirname, "src/background/index.ts"),
        popup: join(__dirname, "src/popup/index.ts"),
        settings: join(__dirname, "src/settings/index.ts"),
        acknowledgements: join(__dirname, "src/acknowledgements/index.ts"),
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
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: join(__dirname, "resources/manifest.json"),
                    to: join(__dirname, "dist/manifest.json"),
                    transform(content) {
                        const manifest = JSON.parse(content.toString());
                        const packageJSON = require("./package.json");

                        manifest.version = packageJSON.version;
                        manifest.version_name = `v${packageJSON.version}`;
                        manifest.name = packageJSON.name;
                        manifest.description = packageJSON.description;
                        manifest.author = packageJSON.author;

                        return Buffer.from(JSON.stringify(manifest, null, 4));
                    },
                },
            ],
        }),
    ],
};

export default config;
